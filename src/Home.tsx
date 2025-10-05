import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import FOG from "vanta/dist/vanta.fog.min";
import "./home.css";

export default function Home() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect) {
      const effect = FOG({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0xffffff,
        midtoneColor: 0xb9e9ff,
        lowlightColor: 0xffffff,
          baseColor: 0xffffff,
        blurFactor: 0.90,
        speed: 2.60,
        zoom: 0.90
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <section id="hero" className="hero" ref={vantaRef}>
      <div className="content">
        <h1 className="title">CASPER</h1>
        <p className="subtitle">Integrated RPA + CRISPR-Cas12 Assay Designer</p>
        <div className="buttons">
          <a href="#about" className="pill">About</a>
          <a href="/assay" className="pill">Generate Set</a>
          <a href="#rank" className="pill">Evaluate Custom Set</a>
        </div>
      </div>
    </section>
  );
}
