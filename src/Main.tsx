import React, { FunctionComponent, useCallback, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Growl } from 'primereact/growl';
import Axios from 'axios';
import DatTable from './components/Table';
import './Main.scss';
import moment from 'moment';

interface IPageToken {
  next: string;
  prev: string;
}

type Dir = 'next' | 'prev';

const Main: FunctionComponent<any> = () => {
  const [channel, setChannel] = useState<any>(null);
  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [plName, setPlName] = useState('Selected Playlist');
  const [growl, setGrowl] = useState<any>(null);
  const [selectedPl, setSelectedPl] = useState<any>(null);
  const [playlistRecords, setPlaylistRecords] = useState<number>(1);
  const [videoRecords, setVideoRecords] = useState<number>(1);
  const [videoPageTokens, setVideoPageTokens] = useState<IPageToken>({ next: '', prev: '' });
  const [plPageTokens, setPlPageTokens] = useState<IPageToken>({ next: '', prev: '' });
  const url = process.env.REACT_APP_PI === 'true' ? '192.168.0.152' : 'localhost';

  const showGrowl = useCallback(
    (data: any) => {
      if (growl) {
        // @ts-ignore
        growl.show(data);
      } else {
        console.error(data.detail);
      }
    },
    [growl]
  );

  const getChannelData = useCallback(() => {
    Axios.get(`http://${url}:4001/api/channel`)
      .then((result) => {
        setChannel(result.data.items[0]);
      })
      .catch((error) => {
        showGrowl({ severity: 'error', summary: 'Error fetching channel data!', detail: error });
      });
  }, [showGrowl, setChannel, url]);

  const rowClicked = useCallback(
    (row: any, direction?: Dir) => {
      setSelectedPl(row);
      setPlName(row.value.snippet.title);
      Axios.post(`http://${url}:4001/api/playlist`, {
        playlistId: row.value.id,
        pageToken: direction ? videoPageTokens[direction] : undefined
      })
        .then((result) => {
          console.log('playlistItems data', result);
          setVideoPageTokens({
            next: result.data.nextPageToken || '',
            prev: result?.data?.prevPageToken || ''
          });
          setVideos(result.data.items);
          setVideoRecords(result?.data?.pageInfo?.totalResults);
        })
        .catch((error) => {
          showGrowl({ severity: 'error', summary: 'Error fetching videos data!', detail: error });
        });
    },
    [url, showGrowl, videoPageTokens]
  );

  const refreshData = useCallback(
    (direction?: Dir) => {
      getChannelData();
      Axios.post(`http://${url}:4001/api/playlists`, {
        pageToken: direction ? plPageTokens[direction] : undefined
      })
        .then((result) => {
          console.log('data', result.data);
          setPlPageTokens({
            next: result.data.nextPageToken || '',
            prev: result?.data?.prevPageToken || ''
          });
          setData(result.data.items);
          setPlaylistRecords(result?.data?.pageInfo.totalResults);
          if (selectedPl) {
            rowClicked(selectedPl);
          }
        })
        .catch((error) => {
          showGrowl({ severity: 'error', summary: 'Error fetching playlist data!', detail: error });
        });
    },
    [url, showGrowl, getChannelData, selectedPl, rowClicked, plPageTokens]
  );

  const refreshButton = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const generateReport = useCallback(() => {
    Axios.get(`http://${url}:4001/api/report`)
      .then((result) => {
        const element = document.createElement('a');
        element.setAttribute(
          'href',
          'data:text/plain;charset=utf-8,' + encodeURIComponent(result.data)
        );
        element.setAttribute(
          'download',
          `YouTube_report_${moment().format('MM-DD-YY--HH-mm')}.csv`
        );
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();

        document.body.removeChild(element);
      })
      .catch((error) => {
        console.log('report error', error);
      });
  }, [url]);

  const pageChange = useCallback(
    (event, direction, vTable) => {
      if (vTable) {
        if (videoPageTokens.next || videoPageTokens.prev) {
          rowClicked(selectedPl, direction);
        }
      } else {
        if (plPageTokens.next || plPageTokens.prev) {
          rowClicked(selectedPl, direction);
        }
      }
    },
    [rowClicked, selectedPl, videoPageTokens, plPageTokens]
  );

  useEffect(() => {
    if (!channel) {
      refreshData();
    }
  });

  return (
    <div className="main">
      <div className="main-header">
        <div className="main-buttons">
          <Button
            label="Refresh Channel Data"
            icon="pi pi-refresh"
            className="p-button-raised"
            onClick={refreshButton}
          />
          <Button
            label="Generate Report"
            icon="pi pi-table"
            className="p-button-success p-button-raised"
            onClick={generateReport}
          />
        </div>
        {channel && (
          <div className="main-stats">
            <div>Subscribers: {channel?.statistics?.subscriberCount}</div>
            <div>Views: {channel?.statistics?.viewCount}</div>
            <div>Videos: {channel?.statistics?.videoCount}</div>
            <div>Comments: {channel?.statistics?.commentCount}</div>
          </div>
        )}
      </div>
      <div className="main-wrapper">
        <div className="playlist-table">
          <h2>Playlists</h2>
          {data?.length && (
            <DatTable
              data={data}
              rowClicked={rowClicked}
              isPlaylists={true}
              totalRecords={playlistRecords}
              pageChange={pageChange}
              videosTable={false}
            />
          )}
        </div>
        <div className="videos-table">
          <h2>Videos from {plName}</h2>
          {videos?.length && (
            <DatTable
              data={videos}
              rowClicked={rowClicked}
              isPlaylists={false}
              totalRecords={videoRecords}
              pageChange={pageChange}
              videosTable={true}
            />
          )}
        </div>
      </div>
      <Growl ref={(el) => setGrowl(el)} />
    </div>
  );
};

export default Main;
