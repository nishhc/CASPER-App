import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from "react";

type OutputCardProps = {
  isVisible: boolean
  isSidebarVisible: boolean;
  data: any[];
  liveStream: string;
};

function OutputCard({ isVisible, isSidebarVisible, data, liveStream }: OutputCardProps) {
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    let timeoutId: number;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setResizeKey(prevKey => prevKey + 1);
      }, 200); 
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarVisible]); 

  if (!isVisible) {
    return null;
  }

  console.log(liveStream);
  // ctrl f live
  if (data.length === 0) {
    return ( (<section className="output-card">
      <h2 className="output-title">Output</h2>
      <div className="data-stream"> 
        <pre className="live-stream-text">{liveStream}</pre>
      </div>
    </section>) );
  }
  
  const columns: GridColDef[] = [
    { field: 'rank', headerName: 'Rank', width: 80 },
    { field: 'forward_primer', headerName: 'Forward Primer', flex: 1 },
    { field: 'backward_primer', headerName: 'Backward Primer', flex: 1 },
    { field: 'amplicon', headerName: 'Amplicon', flex: 1 },
    { field: 'crrna', headerName: 'crRNA', flex: 1 },
  ];

  const rows = data.map((item, index) => ({
    id: index,
    rank: index + 1,
    forward_primer: item.forward_primer,
    backward_primer: item.backward_primer,
    amplicon: item.amplicon,
    crrna: item.crrna,
  }));

  return (
    <section className="output-card">
      <h2 className="output-title">Output</h2>
      <div key={resizeKey} style={{ height: "80%", width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnResize={true}
          pageSizeOptions={[4, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 4, page: 0 },
            },
          }}
        />
      </div>
    </section>
  );
}

export default OutputCard;