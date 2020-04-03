import React, { FunctionComponent, useState, CSSProperties, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import moment from 'moment';
import './Table.scss';

interface IProps {
  data: any;
  rowClicked: Function;
  isPlaylists: boolean;
}

const DatTable: FunctionComponent<IProps> = ({ data, rowClicked, isPlaylists }) => {
  const [selected, setSelected] = useState(null);

  const rowSelected = useCallback(
    (row: any) => {
      setSelected(row.value);
      rowClicked(row);
    },
    [rowClicked]
  );

  const imageTemplate = useCallback((rowData: any) => {
    const imageStyle = {
      maxWidth: '4rem',
      maxHeight: '4rem',
      objectFit: 'cover',
      objectPosition: '50% 0%'
    } as CSSProperties;
    return (
      <img
        src={rowData.snippet.thumbnails?.default?.url}
        alt="playlist thumb"
        style={imageStyle}
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = 'Video-Game-Controller-Icon.svg.png';
        }}
      />
    );
  }, []);

  const determineClass = useCallback((row: any): object => {
    const title = row?.snippet?.title;
    if (title) {
      const tSplit = title.split('-');
      if (tSplit.length >= 3) {
        return { 'good-title': true };
      } else if (tSplit.length === 2) {
        return { 'warn-title': true };
      } else {
        return { 'bad-title': true };
      }
    } else {
      return { 'bad-title': true };
    }
  }, []);

  const highlightToday = useCallback((row: any): object => {
    const pDate = row?.snippet?.publishedAt;
    const pFormatted = pDate ? moment(pDate) : null;
    const today = moment();
    if (pDate) {
      return { today: pFormatted && moment(pFormatted).isSame(today, 'day') };
    } else {
      return { today: false };
    }
  }, []);

  const playlistsRows = () => {
    return (
      <DataTable
        value={data}
        paginator={true}
        rows={50}
        pageLinkSize={50}
        responsive={true}
        scrollable={true}
        selectionMode="single"
        selection={selected}
        onSelectionChange={rowSelected}
        rowClassName={highlightToday}
      >
        <Column header="Thumb" body={(e: any) => imageTemplate(e)} />
        <Column field="snippet.title" header="Title" />
        <Column field="snippet.description" header="Description" />
        <Column field="contentDetails.itemCount" header="# of videos" />
        <Column
          field="snippet.publishedAt"
          header="Last Updated"
          body={(e: any) => formatDate(e)}
        />
      </DataTable>
    );
  };

  const generateLink = useCallback((row) => {
    const stuidoLink = `https://studio.youtube.com/video/${row.contentDetails.videoId}/edit`;
    return (
      <a target="__blank" href={stuidoLink} style={{ wordWrap: 'break-word' }}>
        {stuidoLink}
      </a>
    );
  }, []);

  const formatDate = useCallback((row) => {
    return <span>{moment(row.snippet.publishedAt).format('MM/DD/YY HH:mm')}</span>;
  }, []);

  const videosRows = () => {
    return (
      <DataTable
        value={data}
        paginator={true}
        rows={50}
        pageLinkSize={50}
        responsive={true}
        scrollable={true}
        rowClassName={determineClass}
      >
        <Column header="Thumb" body={(e: any) => imageTemplate(e)} />
        <Column field="snippet.title" header="Title" />
        <Column field="snippet.description" header="Description" />
        <Column
          field="contentDetails.videoPublishedAt"
          header="Published"
          body={(e: any) => formatDate(e)}
        />
        <Column header="Link" body={(e: any) => generateLink(e)} />
      </DataTable>
    );
  };

  return (
    <div className="table-wrapper">
      {isPlaylists && playlistsRows()}
      {!isPlaylists && videosRows()}
    </div>
  );
};

//studio.youtube.com/video/<ID>/edit

export default DatTable;
