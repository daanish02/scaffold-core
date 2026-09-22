import { useRef, useState } from "react";

export interface PyodideCellProps {
  code: string;
  /** Pre-rendered static output shown before the reader opts in to running Python. */
  staticOutput: string;
}

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL: string }) => Promise<PyodideInterface>;
  }
}
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
}

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideLoadPromise: Promise<PyodideInterface> | null = null;

function loadPyodideOnce(): Promise<PyodideInterface> {
  if (pyodideLoadPromise) return pyodideLoadPromise;
  pyodideLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PYODIDE_CDN}pyodide.js`;
    script.onload = () => {
      if (!window.loadPyodide) {
        reject(new Error("Pyodide script loaded but window.loadPyodide is missing"));
        return;
      }
      window.loadPyodide({ indexURL: PYODIDE_CDN }).then(resolve, reject);
    };
    script.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
    document.head.appendChild(script);
  });
  return pyodideLoadPromise;
}

/**
 * A Python code cell that shows static pre-rendered output by default (per
 * the brief's hardware-constraints note: Pyodide is ~10-25MB and
 * memory-hungry, so it must always have a static fallback) and only loads
 * the ~10-25MB Pyodide runtime when the reader explicitly asks to run it.
 */
export default function PyodideCell({ code, staticOutput }: PyodideCellProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [output, setOutput] = useState(staticOutput);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  async function runLive() {
    setStatus("loading");
    try {
      if (!pyodideRef.current) {
        pyodideRef.current = await loadPyodideOnce();
      }
      const result = await pyodideRef.current.runPythonAsync(code);
      setOutput(result === undefined ? "" : String(result));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="demo">
      <div className="demo-header">
        <span>Python</span>
        <span>
          {status === "idle" && "static output shown — run for live execution"}
          {status === "loading" && "loading Python runtime…"}
          {status === "ready" && "live"}
          {status === "error" && "failed to load — showing static output"}
        </span>
      </div>
      <div className="demo-body">
        <pre className="code">{code}</pre>
        <pre className="code">{output}</pre>
        <button
          type="button"
          className="step-nav-btn"
          disabled={status === "loading"}
          onClick={runLive}
        >
          {status === "loading" ? "Loading…" : "Run live"}
        </button>
      </div>
    </div>
  );
}
