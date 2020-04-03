import React, { FunctionComponent, useCallback, useState } from 'react';
import { Button } from 'primereact/button';
import Axios from 'axios';
import DatTable from './components/Table';
import './Main.scss';
import moment from 'moment';

const Main: FunctionComponent<any> = () => {
  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [plName, setPlName] = useState('Selected Playlist');
  const url = process.env.REACT_APP_PI === 'true' ? '192.168.0.152' : 'localhost';

  const refreshData = useCallback(() => {
    Axios.get(`http://${url}:4001/api/playlists`)
      .then((result) => {
        console.log('data', result);
        setData(result.data.items);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, [url]);

  const rowClicked = useCallback(
    (row: any) => {
      console.log('row', row.value);
      setPlName(row.value.snippet.title);
      Axios.post(`http://${url}:4001/api/playlist`, { playlistId: row.value.id })
        .then((result) => {
          console.log('playlistItems data', result);
          setVideos(result.data.items);
        })
        .catch((error) => {
          console.log('playlistItems error', error);
        });
    },
    [url]
  );

  const generateReport = useCallback(() => {
    Axios.get(`http://${url}:4001/api/report`)
      .then((result) => {
        console.log('result report', result);
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
  }, []);

  // useEffect(() => {
  //   refreshData();
  // });

  return (
    <div className="main">
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
    </div>
  );
};

export default Main;
