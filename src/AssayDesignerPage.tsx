import React, { useState, useEffect, useRef } from "react";
import "./assay.css";
// @ts-ignore
import NET from "vanta/dist/vanta.net.min";
import * as THREE from "three";

export default function AssayDesignerPage() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect) {
      const effect = NET({
        el: vantaRef.current,
        THREE, // pass in three.js
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x41afaf,
        backgroundColor: 0xffffff,
        points: 20.0,
        maxDistance: 40.0,
        spacing: 19.0,
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div className="assay-layout" ref={vantaRef}>
      <Sidebar />
      <main className="assay-main">
        <h1 className="assay-title">ASSAY DESIGNER</h1>
        <AssayDesignerCard />
      </main>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="assay-sidebar">
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
    </aside>
  );
}

/* --------- Main Card --------- */
function AssayDesignerCard() {
  const [primerMin, setPrimerMin] = useState<string>("28");
  const [primerMax, setPrimerMax] = useState<string>("36");

  const [crrnaMin, setCrrnaMin] = useState<string>("20");
  const [crrnaMax, setCrrnaMax] = useState<string>("24");

  const [ampMin, setAmpMin] = useState<string>("100");
  const [ampMax, setAmpMax] = useState<string>("200");

  const [gcMin, setGcMin] = useState<string>("30");
  const [gcMax, setGcMax] = useState<string>("70");

  const [targets, setTargets] = useState<string>("");
  const [background, setBackground] = useState<string>("");
  const [numSets, setNumSets] = useState<string>("");

  const handleGenerate = () => {
    // you can navigate or post these values
    // example: console.log them for now
    console.log({
      primerMin,
      primerMax,
      crrnaMin,
      crrnaMax,
      ampMin,
      ampMax,
      gcMin,
      gcMax,
      targets,
      background,
      numSets,
    });
    // If you’re using React Router, navigate here (e.g., to /assay/results)
    // navigate("/assay/results", { state: { ...values }});
  };

  return (
    <section className="assay-card">
      <div className="grid">
        {/* Primer Length */}
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

        {/* crRNA Length */}
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

      {/* NEW: Genome / Background Sequence */}
      <div className="target-row">
        <input
          className="target-input"
          placeholder="Paste genome/background sequence (optional)…"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
        />
        <button
          className="icon-btn"
          aria-label="Upload background"
          onClick={() => {
            /* file picker later */
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

/* --------- Small building blocks --------- */
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
