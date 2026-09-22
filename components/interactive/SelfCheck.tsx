import { useState } from "react";

export interface SelfCheckQuestion {
  question: string;
  answer: string;
  /** One-sentence explanation of why the answer is correct, per brief section 4. */
  why: string;
}

export interface SelfCheckProps {
  questions: SelfCheckQuestion[];
}

/**
 * Revealable self-check Q&A — a mirror, not a test: no scoring, no
 * separate answer key. Each question toggles its own answer inline.
 */
export default function SelfCheck({ questions }: SelfCheckProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="self-check">
      {questions.map((q, i) => (
        <div key={i} className="self-check-item">
          <p className="self-check-question">{q.question}</p>
          <button type="button" className="step-nav-btn" onClick={() => toggle(i)}>
            {revealed.has(i) ? "Hide answer" : "Show answer"}
          </button>
          {revealed.has(i) && (
            <div className="self-check-answer">
              <p>{q.answer}</p>
              <p className="self-check-why">{q.why}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
