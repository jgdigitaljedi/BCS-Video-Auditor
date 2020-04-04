import React, { FunctionComponent, useCallback, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Growl } from 'primereact/growl';
import Axios from 'axios';
import DatTable from './components/Table';
import './Main.scss';
import moment from 'moment';

const Main: FunctionComponent<any> = () => {
  const [channel, setChannel] = useState<any>(null);
  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [plName, setPlName] = useState('Selected Playlist');
  const [growl, setGrowl] = useState<any>(null);
  const [selectedPl, setSelectedPl] = useState<any>(null);
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
        console.log('channel', result.data);
        setChannel(result.data.items[0]);
      })
      .catch((error) => {
        showGrowl({ severity: 'error', summary: 'Error fetching channel data!', detail: error });
      });
  }, [showGrowl, setChannel, url]);

  const rowClicked = useCallback(
    (row: any, refresh?: boolean) => {
      setSelectedPl(row);
      setPlName(row.value.snippet.title);
      Axios.post(`http://${url}:4001/api/playlist`, { playlistId: row.value.id })
        .then((result) => {
          console.log('playlistItems data', result);
          setVideos(result.data.items);
        })
        .catch((error) => {
          showGrowl({ severity: 'error', summary: 'Error fetching videos data!', detail: error });
        });
    },
    [url, showGrowl]
  );

  const refreshData = useCallback(() => {
    getChannelData();
    Axios.get(`http://${url}:4001/api/playlists`)
      .then((result) => {
        console.log('data', result.data.items);
        setData(result.data.items);
        if (selectedPl) {
          rowClicked(selectedPl, true);
        }
      })
      .catch((error) => {
        showGrowl({ severity: 'error', summary: 'Error fetching playlist data!', detail: error });
      });
  }, [url, showGrowl, getChannelData, selectedPl, rowClicked]);

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
            onClick={refreshData}
          />
          <Button
            label="Generate Report"
            icon="pi pi-table"
            className="p-button-secondary p-button-raised"
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
          {data?.length && <DatTable data={data} rowClicked={rowClicked} isPlaylists={true} />}
        </div>
        <div className="videos-table">
          <h2>Videos from {plName}</h2>
          {videos?.length && <DatTable data={videos} rowClicked={rowClicked} isPlaylists={false} />}
        </div>
      </div>
      <Growl ref={(el) => setGrowl(el)} />
    </div>
  );
};

export default Main;
