import React, { FunctionComponent, useCallback, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import Axios from 'axios';
import DatTable from './components/Table';

const Main: FunctionComponent<any> = () => {
  const [data, setData] = useState([]);

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

  // useEffect(() => {
  //   refreshData();
  // });

  return (
    <div className="main-wrapper">
      <Button label="Refresh Channel Data" icon="pi pi-refresh" onClick={refreshData} />
      {data?.length && <DatTable data={data} />}
    </div>
  );
};

export default Main;
