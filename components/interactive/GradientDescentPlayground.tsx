import { useEffect, useRef, useState } from "react";
import ParamSlider from "./ParamSlider.js";

export interface GradientDescentPlaygroundProps {
  /** f(x) — the 1D loss function to descend. Defaults to a simple convex bowl. */
  fn?: (x: number) => number;
  /** f'(x) — derivative of fn. */
  grad?: (x: number) => number;
  xMin?: number;
  xMax?: number;
}

const defaultFn = (x: number) => x * x;
const defaultGrad = (x: number) => 2 * x;

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** A 1D gradient descent playground — shows the loss curve and the ball rolling down it step by step. */
export default function GradientDescentPlayground({
  fn = defaultFn,
  grad = defaultGrad,
  xMin = -5,
  xMax = 5,
}: GradientDescentPlaygroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lr, setLr] = useState(0.1);
  const [start, setStart] = useState(4);
  const [x, setX] = useState(start);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setX(start);
  }, [start]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setX((prev) => {
        const next = prev - lr * grad(prev);
        return Math.max(xMin, Math.min(xMax, next));
      });
    }, 200);
    return () => clearInterval(id);
  }, [running, lr, grad, xMin, xMax]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const yMax = Math.max(fn(xMin), fn(xMax));

    function toScreen(px: number, py: number): [number, number] {
      const sx = ((px - xMin) / (xMax - xMin)) * W;
      const sy = H - (py / yMax) * (H - 20) - 10;
      return [sx, sy];
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getCssVar("--bg-raised");
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = getCssVar("--rule-strong");
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = xMin; px <= xMax; px += (xMax - xMin) / 200) {
      const [sx, sy] = toScreen(px, fn(px));
      if (px === xMin) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    const [bx, by] = toScreen(x, fn(x));
    ctx.fillStyle = getCssVar("--accent");
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fill();
  }, [x, fn, xMin, xMax]);

  return (
    <div className="demo">
      <div className="demo-header">
        <span>Interactive · Gradient descent</span>
        <span>{running ? "running" : "paused"}</span>
      </div>
      <div className="demo-body">
        <canvas ref={canvasRef} width={600} height={280} />
        <div className="sliders">
          <ParamSlider label="learning rate" value={lr} min={0.01} max={1} onChange={setLr} />
          <ParamSlider label="start x" value={start} min={xMin} max={xMax} onChange={setStart} />
        </div>
        <div className="step-nav">
          <button type="button" className="step-nav-btn" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Run"}
          </button>
          <button
            type="button"
            className="step-nav-btn"
            onClick={() => setX((prev) => Math.max(xMin, Math.min(xMax, prev - lr * grad(prev))))}
          >
            Step →
          </button>
          <button type="button" className="step-nav-btn" onClick={() => setX(start)}>
            Reset
          </button>
        </div>
        <div className="demo-note">
          x = {x.toFixed(3)}, f(x) = {fn(x).toFixed(3)}
        </div>
      </div>
    </div>
  );
}
