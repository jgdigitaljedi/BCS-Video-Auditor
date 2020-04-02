import React, { FunctionComponent, useCallback, useState } from 'react';
import { Button } from 'primereact/button';
import Axios from 'axios';
import DatTable from './components/Table';
import './Main.scss';

const Main: FunctionComponent<any> = () => {
  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [plName, setPlName] = useState('Selected Playlist');

  const refreshData = useCallback(() => {
    Axios.get('http://localhost:4001/api/playlists')
      .then((result) => {
        console.log('data', result);
        setData(result.data.items);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, []);

  const rowClicked = useCallback((row: any) => {
    console.log('row', row.value);
    setPlName(row.value.snippet.title);
    Axios.post('http://localhost:4001/api/playlist', { playlistId: row.value.id })
      .then(result => {
        console.log('playlistItems data', result);
        setVideos(result.data.items);
      })
      .catch(error => {
        console.log('playlistItems error', error);
      })
  }, []);

  // useEffect(() => {
  //   refreshData();
  // });

  return (
    <div className="main">
      <Button label="Refresh Channel Data" icon="pi pi-refresh" onClick={refreshData} />
      <div className="main-wrapper">
        <div className="half-width">
          <h2>Playlists</h2>
          {data?.length && (
            <DatTable data={data} rowClicked={rowClicked} isPlaylists={true} />
          )}
        </div>
        <div className="half-width">
          <h2>Videos from {plName}</h2>
          {videos?.length && (
            <DatTable data={videos} rowClicked={rowClicked} isPlaylists={false} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;
