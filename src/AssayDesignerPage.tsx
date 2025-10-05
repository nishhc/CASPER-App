import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./assay.css";
import "./output.css";
// @ts-ignore
import NET from "vanta/dist/vanta.net.min";
import * as THREE from "three";
import { motion } from "framer-motion";
import { DataGrid, type GridColDef } from '@mui/x-data-grid';


export default function AssayDesignerPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [assayData, setAssayData] = useState<any[]>([]);

  const handleDataReceived = (data: any[]) => {
    setAssayData(data);
    setIsGenerated(true);
  };

  useEffect(() => {
    if (!vantaEffect) {
      const effect = NET({
        el: vantaRef.current,
        THREE,
  mouseControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1,
  scaleMobile: 1.00,
  color: 0x64d2ff,
  backgroundColor: 0xffffff,
  points: 5.00,
  maxDistance: 19.00,
  spacing:40.00
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div className="assay-layout" ref={vantaRef}>
      <Sidebar isVisible={isSidebarVisible} setIsVisible={setIsSidebarVisible}/>
      <main className="assay-main">
        <h1 className="assay-title">ASSAY DESIGNER</h1>
        <AssayDesignerCard onDataReceived={handleDataReceived} />
        <OutputCard isVisible={isGenerated} isSidebarVisible={isSidebarVisible} data={assayData}/>
      </main>
    </div>
  );
}

type SidebarProps = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

function Sidebar({ isVisible, setIsVisible }: SidebarProps) {

  return (
    <div className="sidebar-container">
      <motion.aside
        className="assay-sidebar"
        initial={{ x: -350 }}
        animate={{ x: isVisible ? 0 : -350 }} 
        transition={{ duration: 0.1, ease: "easeInOut" }}
        style={{position: isVisible ? 'sticky' : 'absolute'}}
      >
        <div className="brand">
          <div className="brand-row">
            <span className="brand-letter">C A S P E R</span>
          </div>
          <small className="brand-sub">
            Integrated RPA + CRISPR-Cas12 Assay Designer
          </small>
        </div>

        <nav className="side-nav">
          <div className="side-group">
            <span className="side-heading">Projects</span>
          </div>
          <div className="side-divider" />
          <div className="side-group">
            <span className="side-heading">Designs</span>
          </div>
          <div className="side-group">
            <span className="side-heading">Rankings</span>
          </div>
        </nav>

      {isVisible && (
          <div className="hide-sidebar-btn-container">
            <button className="sidebar-btn" onClick={() => setIsVisible(false)}>
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </motion.aside>

      {!isVisible && (
        <div className="show-sidebar-btn-container">
          <button className="sidebar-btn" onClick={() => setIsVisible(true)}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

type AssayDesignerCardProps = {
  onDataReceived: (data: any[]) => void;
};

function AssayDesignerCard({ onDataReceived }:AssayDesignerCardProps) {
  const [primerMin, setPrimerMin] = useState<string>("");
  const [primerMax, setPrimerMax] = useState<string>("");

  const [crrnaMin, setCrrnaMin] = useState<string>("");
  const [crrnaMax, setCrrnaMax] = useState<string>("");

  const [ampMin, setAmpMin] = useState<string>("");
  const [ampMax, setAmpMax] = useState<string>("");

  const [gcMin, setGcMin] = useState<string>("");
  const [gcMax, setGcMax] = useState<string>("");

  const [targets, setTargets] = useState<string>("");
  const [numSets, setNumSets] = useState<string>("");

  const handleGenerate = async () => {

    const config = {
    min_primer_length: Number(primerMin),
    max_primer_length: Number(primerMax),
    min_amplicon_length: Number(ampMin),
    max_amplicon_length: Number(ampMax),
    min_crrna_length: Number(crrnaMin),
    max_crrna_length: Number(crrnaMax),
    min_gc_content: Number(gcMin),
    max_gc_content: Number(gcMax),
    num_sets: Number(numSets),
    generation: true,
  };

  const formData = new FormData();
  formData.append("config", JSON.stringify(config));

  if (targets) {
    const fastaBlob = new Blob([targets], { type: "text/plain" });
    formData.append("target_fasta", fastaBlob, "input.fasta");
  }

  try {
    const res = await fetch("http://localhost:8000/process", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Backend error: " + res.status);

    const responseData = await res.json();
      console.log(responseData.jsonData)
      onDataReceived(responseData.jsonData);
      console.log(responseData.csvData) 
      downloadCSV(responseData.csvData);
  } catch (err) {
    console.error("Error generating assay:", err);
  }
};


  return (
    <section className="assay-card">
      <div className="grid">
        <FieldPair
          required
          label="Primer Length"
          leftProps={{
            type: "number",
            value: primerMin,
            onChange: (e) => setPrimerMin(e.target.value),
            placeholder: "28",
            min: 10,
            max: 80,
          }}
          rightProps={{
            type: "number",
            value: primerMax,
            onChange: (e) => setPrimerMax(e.target.value),
            placeholder: "36",
            min: 10,
            max: 80,
          }}
        />

        <FieldPair
          required
          label="crRNA Length"
          leftProps={{
            type: "number",
            value: crrnaMin,
            onChange: (e) => setCrrnaMin(e.target.value),
            placeholder: "20",
            min: 10,
            max: 40,
          }}
          rightProps={{
            type: "number",
            value: crrnaMax,
            onChange: (e) => setCrrnaMax(e.target.value),
            placeholder: "24",
            min: 10,
            max: 40,
          }}
        />

        {/* Amplicon Length */}
        <FieldPair
          required
          label="Amplicon Length"
          leftProps={{
            type: "number",
            value: ampMin,
            onChange: (e) => setAmpMin(e.target.value),
            placeholder: "100",
            min: 40,
            max: 1000,
          }}
          rightProps={{
            type: "number",
            value: ampMax,
            onChange: (e) => setAmpMax(e.target.value),
            placeholder: "200",
            min: 40,
            max: 1000,
          }}
        />

        {/* GC Content Percentage */}
        <FieldPair
          required
          label="GC Content Percentage"
          leftProps={{
            type: "number",
            value: gcMin,
            onChange: (e) => setGcMin(e.target.value),
            placeholder: "30",
            min: 0,
            max: 100,
          }}
          rightProps={{
            type: "number",
            value: gcMax,
            onChange: (e) => setGcMax(e.target.value),
            placeholder: "70",
            min: 0,
            max: 100,
          }}
        />
      </div>

      {/* Target Sequences */}
      <div className="target-row">
        <input
          className="target-input"
          placeholder="Paste target sequences (FASTA or plain)…"
          value={targets}
          onChange={(e) => setTargets(e.target.value)}
        />
        <button
          className="icon-btn"
          aria-label="Upload sequences"
          onClick={() => {
            /* hook up file picker later */
          }}
        >
          <UploadIcon />
        </button>
      </div>

      {/* Footer controls */}
      <div className="footer-controls">
        <input
          className="sets-input"
          placeholder="Number of Sets"
          value={numSets}
          onChange={(e) => setNumSets(e.target.value)}
          type="number"
          min={1}
        />
        <button className="generate-btn" onClick={handleGenerate}>
          Generate
        </button>
      </div>
    </section>
  );
}

type OutputCardProps = {
  isVisible: boolean
  isSidebarVisible: boolean;
  data: any[];
};

function OutputCard({ isVisible, isSidebarVisible, data }: OutputCardProps) {
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

  if (!isVisible || !data || data.length === 0) {
    return null;
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

function downloadCSV(csvString: string, fileName: string = "ranked.csv") {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName); 

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function FieldPair(props: {
  label: string;
  required?: boolean;
  leftProps?: InputProps;
  rightProps?: InputProps;
}) {
  const { label, required, leftProps, rightProps } = props;
  return (
    <div className="field-pair">
      <label className="field-label">
        {required && <span className="req">*</span>} {label}
      </label>
      <div className="pair">
        <input className="pill-input" {...leftProps} />
        <span className="to">to</span>
        <input className="pill-input" {...rightProps} />
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 16V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8.5 10.5 12 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
      />
    </svg>
  );
}
