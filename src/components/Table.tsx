import React, { FunctionComponent, useState, CSSProperties, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface IProps {
  data: any;
}

const DatTable: FunctionComponent<IProps> = ({ data }) => {
  const [selected, setSelected] = useState(null);

  const imageTemplate = useCallback((rowData: any) => {
    const imageStyle = {
      maxWidth: '5rem',
      maxHeight: '5rem',
      objectFit: 'cover',
      objectPosition: '50% 0%'
    } as CSSProperties;
    return (
      <img
        src={rowData.snippet.thumbnails.default.url}
        alt="playlist thumb"
        style={imageStyle}
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = 'Video-Game-Controller-Icon.svg.png';
        }}
      />
    );
  }, []);

  return (
    <DataTable
      value={data}
      paginator={true}
      rows={10}
      pageLinkSize={10}
      responsive={true}
      scrollable={true}
      selectionMode="single"
      selection={selected}
      onSelectionChange={(e) => setSelected(e.value)}
    >
      <Column header="Thumb" body={(e: any) => imageTemplate(e)} />
      <Column field="snippet.title" header="Title" />
      <Column field="snippet.description" header="Description" />
      <Column field="contentDetails.itemCount" header="# of videos" />
    </DataTable>
  );
};

export default DatTable;
