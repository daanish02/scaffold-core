import { useEffect, useRef, useState } from "react";
import ParamSlider from "./ParamSlider.js";

type DistName = "normal" | "exponential" | "uniform";

function normalPdf(x: number, mean: number, std: number): number {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}
function exponentialPdf(x: number, rate: number): number {
  return x < 0 ? 0 : rate * Math.exp(-rate * x);
}
function uniformPdf(x: number, lo: number, hi: number): number {
  return x >= lo && x <= hi ? 1 / (hi - lo) : 0;
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Plots the PDF of a chosen distribution family with adjustable parameters. */
export default function DistributionExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dist, setDist] = useState<DistName>("normal");
  const [mean, setMean] = useState(0);
  const [std, setStd] = useState(1);
  const [rate, setRate] = useState(1);
  const [lo, setLo] = useState(-2);
  const [hi, setHi] = useState(2);

  const domain: [number, number] = [-8, 8];

  function pdf(x: number): number {
    if (dist === "normal") return normalPdf(x, mean, std);
    if (dist === "exponential") return exponentialPdf(x, rate);
    return uniformPdf(x, lo, hi);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const [xMin, xMax] = domain;

    let yMax = 0;
    for (let px = xMin; px <= xMax; px += (xMax - xMin) / 300) {
      yMax = Math.max(yMax, pdf(px));
    }
    yMax = yMax || 1;

    function toScreen(px: number, py: number): [number, number] {
      const sx = ((px - xMin) / (xMax - xMin)) * W;
      const sy = H - (py / yMax) * (H - 20) - 10;
      return [sx, sy];
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getCssVar("--bg-raised");
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = getCssVar("--rule-strong");
    ctx.lineWidth = 1;
    const [zx, zy] = toScreen(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, zy);
    ctx.lineTo(W, zy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(zx, 0);
    ctx.lineTo(zx, H);
    ctx.stroke();

    ctx.strokeStyle = getCssVar("--accent");
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = xMin; px <= xMax; px += (xMax - xMin) / 300) {
      const [sx, sy] = toScreen(px, pdf(px));
      if (px === xMin) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }, [dist, mean, std, rate, lo, hi]);

  return (
    <div className="demo">
      <div className="demo-header">
        <span>Interactive · Distribution explorer</span>
        <span>{dist}</span>
      </div>
      <div className="demo-body">
        <div className="step-nav">
          {(["normal", "exponential", "uniform"] as const).map((name) => (
            <button
              key={name}
              type="button"
              className="step-nav-btn"
              disabled={dist === name}
              onClick={() => setDist(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <canvas ref={canvasRef} width={600} height={280} />
        <div className="sliders">
          {dist === "normal" && (
            <>
              <ParamSlider label="mean" value={mean} min={-4} max={4} onChange={setMean} />
              <ParamSlider label="std" value={std} min={0.2} max={3} onChange={setStd} />
            </>
          )}
          {dist === "exponential" && (
            <ParamSlider label="rate (λ)" value={rate} min={0.1} max={3} onChange={setRate} />
          )}
          {dist === "uniform" && (
            <>
              <ParamSlider label="low" value={lo} min={-6} max={hi - 0.1} onChange={setLo} />
              <ParamSlider label="high" value={hi} min={lo + 0.1} max={6} onChange={setHi} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
