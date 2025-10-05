import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
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
  const [liveStream, setLiveStream] = useState<string>("");
  const [assayData, setAssayData] = useState<any[]>([]);

  const handleDataReceived = (data: any[]) => {
    setAssayData(data);
  };

  const handleSuccessfulRequest = () => {
    setIsGenerated(true);
  };
  
  const handleLiveReceived = (stream: string) => {
    setLiveStream(stream);
  }

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
        <AssayDesignerCard onRequestSucceed={handleSuccessfulRequest} onDataReceived={handleDataReceived} onLiveReceived={handleLiveReceived}/>
        <OutputCard isVisible={isGenerated} isSidebarVisible={isSidebarVisible} data={assayData} liveStream={liveStream}/>
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
  onRequestSucceed: () => void;
  onLiveReceived: (data: string) => void;
};

function AssayDesignerCard({ onDataReceived, onRequestSucceed, onLiveReceived }:AssayDesignerCardProps) {
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

  const fileInputRef = useRef<HTMLInputElement>(null);


const handleGenerate = async () => {
  var updates = ""
  onRequestSucceed();
  const config = {
    min_primer_length: Number(primerMin) <= 0 ? 28 : Number(primerMin),
    max_primer_length: Number(primerMax) <= 0 ? 36 : Number(primerMax),
    min_amplicon_length: Number(ampMin) <= 0 ? 100 : Number(ampMin),
    max_amplicon_length: Number(ampMax) <=  0 ? 200 : Number(ampMax),
    min_crrna_length: Number(crrnaMin)  <= 0 ? 20 : Number(crrnaMin),
    max_crrna_length: Number(crrnaMax) <= 0 ? 24 : Number(crrnaMax),
    min_gc_content: Number(gcMin) <=  0 ? 30 : Number(gcMin),
    max_gc_content: Number(gcMax) >= 100 ? 70 : Number(gcMax),
    num_sets: Number(numSets) <= 0 ? 10 : Number(numSets),
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

    if (!res.body) throw new Error("Response has no body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        try {
          const update = JSON.parse(line);
          
          console.log("Status:", update.status);
          updates += update.status + "\n"
          onLiveReceived(updates);

          if (update.status === "complete" && update.data) {
            console.log("Received final data:", update.data.jsonData);
            onDataReceived(update.data.jsonData);
            downloadCSV(update.data.csvData);
          }
        } catch (e) {
          console.error("Error parsing streamed JSON line:", e, "Line:", line);
        }
      }
    }
  } catch (err) {
    console.error("Error generating assay:", err);
  }
};
 // 2. Create a handler to trigger the hidden file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Create a handler to read the file content once selected
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Use optional chaining for safety
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContents = e.target?.result as string;
      // Update the state with the file's content
      setTargets(fileContents);
    };
    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
      alert("Failed to read the file.");
    };
    reader.readAsText(file);
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
        <textarea
          className="target-input"
          placeholder="Paste target sequences (FASTA or plain)…"
          value={targets}
          onChange={(e) => setTargets(e.target.value)}
        />
        <button
          className="upload-icon-btn"
          aria-label="Upload sequences"
          onClick={handleUploadClick}
        >
          <UploadIcon />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".fasta,.fa,.fna,.ffn,.faa,.frn" // Accept common FASTA extensions
        />
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
