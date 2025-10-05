import { useState, useEffect, useRef, type ChangeEvent } from "react";
import Sidebar from "./components/Sidebar";
import "./assay.css";
import "./output.css";
import FieldPair from "./components/FieldPair";
import UploadIcon from "./components/UploadIcon";
import OutputCard from "./components/OutputCard";
// @ts-ignore
import NET from "vanta/dist/vanta.net.min";
import * as THREE from "three";
import { downloadCSV } from "./utils";

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
    setAssayData([]);
    setIsGenerated(true);
  };

  const handleLiveReceived = (stream: string) => {
    setLiveStream(stream);
  };

  useEffect(() => {
    if (!vantaEffect) {
      const effect = NET({
        el: vantaRef.current,
        THREE,
        mouseControls: false,
        minHeight: 800.0,
        minWidth: 800.0,
        scale: 1,
        scaleMobile: 1.0,
        color: 0x64d2ff,
        backgroundColor: 0xffffff,
        points: 5.0,
        maxDistance: 19.0,
        spacing: 40.0,
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div className="assay-layout" ref={vantaRef}>
      <Sidebar
        isVisible={isSidebarVisible}
        setIsVisible={setIsSidebarVisible}
      />
      <main
        className="assay-main"
        style={{ marginLeft: isSidebarVisible ? "330px" : "0" }}
      >
        <h1 className="assay-title">ASSAY DESIGNER</h1>
        <AssayDesignerCard
          onRequestSucceed={handleSuccessfulRequest}
          onDataReceived={handleDataReceived}
          onLiveReceived={handleLiveReceived}
        />
        <OutputCard
          isVisible={isGenerated}
          isSidebarVisible={isSidebarVisible}
          data={assayData}
          liveStream={liveStream}
        />
      </main>
    </div>
  );
}

type AssayDesignerCardProps = {
  onDataReceived: (data: any[]) => void;
  onRequestSucceed: () => void;
  onLiveReceived: (data: string) => void;
};

function AssayDesignerCard({
  onDataReceived,
  onRequestSucceed,
  onLiveReceived,
}: AssayDesignerCardProps) {
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
    var updates = "";
    onRequestSucceed();
    const config = {
      min_primer_length:
        Number(primerMin) <= 0 ? Number(28) : Number(primerMin),
      max_primer_length:
        Number(primerMax) <= 0 ? Number(36) : Number(primerMax),
      min_amplicon_length: Number(ampMin) <= 0 ? Number(100) : Number(ampMin),
      max_amplicon_length: Number(ampMax) <= 0 ? Number(200) : Number(ampMax),
      min_crrna_length: Number(crrnaMin) <= 0 ? Number(20) : Number(crrnaMin),
      max_crrna_length: Number(crrnaMax) <= 0 ? Number(24) : Number(crrnaMax),
      min_gc_content: Number(gcMin) <= 0 ? Number(30) : Number(gcMin),
      max_gc_content:
        Number(gcMax) >= 100 || Number(gcMax) <= 0 ? Number(70) : Number(gcMax),
      num_sets:
        Number(numSets) <= 0
          ? Number(10)
          : Number(numSets) >= 1000
          ? 1000
          : Number(numSets),
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
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          try {
            const update = JSON.parse(line);

            console.log("Status:", update.status);
            updates += update.status + "\n";
            onLiveReceived(updates);

            if (update.status === "complete" && update.data) {
              console.log("Received final data:", update.data.jsonData);
              onDataReceived(update.data.jsonData);
              downloadCSV(update.data.csvData);
            }
          } catch (e) {
            console.error(
              "Error parsing streamed JSON line:",
              e,
              "Line:",
              line
            );
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
          style={{ display: "none" }}
          accept=".fasta,.fa,.fna,.ffn,.faa,.frn" // Accept common FASTA extensions
        />
      </div>

      {/* Footer controls */}
      <div className="footer-controls">
        <span style={{ marginTop: "12px" }}>Number of Sets (Max 1000): </span>

        <input
          className="sets-input"
          placeholder="10"
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
