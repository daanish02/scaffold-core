import { useEffect, useRef, useState } from "react";
import ParamSlider from "./ParamSlider.js";

export interface TransformVizProps {
  initial?: { a: number; b: number; c: number; d: number };
}

/** Finds the (real) eigenvector directions of a 2x2 matrix [[a,b],[c,d]], normalized. */
function eigen2x2(a: number, b: number, c: number, d: number): [number, number][] {
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc < 0) return [];
  const sq = Math.sqrt(disc);
  const l1 = (tr + sq) / 2;
  const l2 = (tr - sq) / 2;
  const vecs: [number, number][] = [];
  for (const l of [l1, l2]) {
    let vx: number, vy: number;
    if (Math.abs(b) > 1e-6) {
      vx = b;
      vy = l - a;
    } else if (Math.abs(c) > 1e-6) {
      vx = l - d;
      vy = c;
    } else {
      vx = 1;
      vy = 0;
    }
    const norm = Math.hypot(vx, vy) || 1;
    vecs.push([vx / norm, vy / norm]);
  }
  return vecs;
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * A 2D grid-warp visualizer for a 2x2 matrix — shows how it transforms the
 * plane, and draws its real eigenvector directions (the lines that only
 * scale, never rotate) in the accent color. Ported from the approved
 * prototype's transform-visualizer demo.
 */
export default function TransformViz({
  initial = { a: 1.6, b: 0.4, c: 0.4, d: 0.9 },
}: TransformVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matrix, setMatrix] = useState(initial);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { a, b, c, d } = matrix;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const scale = 40;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getCssVar("--bg-raised");
    ctx.fillRect(0, 0, W, H);

    const rule = getCssVar("--rule");
    const ruleStrong = getCssVar("--rule-strong");
    const accent = getCssVar("--accent");
    const ink = getCssVar("--ink-soft");

    function toScreen(x: number, y: number): [number, number] {
      return [cx + x * scale, cy - y * scale];
    }

    ctx.strokeStyle = rule;
    ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      for (let t = -6; t <= 6; t += 0.25) {
        const x = i,
          y = t;
        const tx = a * x + b * y,
          ty = c * x + d * y;
        const [sx, sy] = toScreen(tx, ty);
        if (t === -6) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let t = -6; t <= 6; t += 0.25) {
        const x = t,
          y = i;
        const tx = a * x + b * y,
          ty = c * x + d * y;
        const [sx, sy] = toScreen(tx, ty);
        if (t === -6) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = ruleStrong;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.stroke();

    const vecs = eigen2x2(a, b, c, d);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    vecs.forEach(([vx, vy]) => {
      const len = 8;
      const [x1, y1] = toScreen(vx * len, vy * len);
      const [x2, y2] = toScreen(-vx * len, -vy * len);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    if (vecs.length === 0) {
      ctx.fillStyle = ink;
      ctx.font = "13px sans-serif";
      ctx.fillText("No real eigenvectors — this matrix rotates", 14, 22);
    }
  }, [matrix]);

  return (
    <div className="demo">
      <div className="demo-header">
        <span>Interactive · Transform visualizer</span>
        <span>drag or use sliders</span>
      </div>
      <div className="demo-body">
        <canvas ref={canvasRef} width={600} height={340} />
        <div className="sliders">
          <ParamSlider
            label="a"
            value={matrix.a}
            min={-2}
            max={2}
            onChange={(a) => setMatrix((m) => ({ ...m, a }))}
          />
          <ParamSlider
            label="b"
            value={matrix.b}
            min={-2}
            max={2}
            onChange={(b) => setMatrix((m) => ({ ...m, b }))}
          />
          <ParamSlider
            label="c"
            value={matrix.c}
            min={-2}
            max={2}
            onChange={(c) => setMatrix((m) => ({ ...m, c }))}
          />
          <ParamSlider
            label="d"
            value={matrix.d}
            min={-2}
            max={2}
            onChange={(d) => setMatrix((m) => ({ ...m, d }))}
          />
        </div>
        <div className="demo-note">
          The teal lines mark the eigenvector directions — the only lines through the origin that
          don't rotate under this transformation, only scale.
        </div>
      </div>
    </div>
  );
}
