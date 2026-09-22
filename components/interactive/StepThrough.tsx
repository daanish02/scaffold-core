import { useState, type ReactNode } from "react";

export interface StepThroughProps {
  /** One React node per step, shown one at a time. */
  steps: ReactNode[];
}

/** A next/back walkthrough — reveals one step at a time, for worked examples and derivations. */
export default function StepThrough({ steps }: StepThroughProps) {
  const [index, setIndex] = useState(0);
  const atStart = index === 0;
  const atEnd = index === steps.length - 1;

  return (
    <div className="demo">
      <div className="demo-header">
        <span>
          Step {index + 1} of {steps.length}
        </span>
      </div>
      <div className="demo-body">
        <div className="prose">{steps[index]}</div>
        <div className="step-nav">
          <button
            type="button"
            className="step-nav-btn"
            disabled={atStart}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            ← Back
          </button>
          <button
            type="button"
            className="step-nav-btn"
            disabled={atEnd}
            onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
