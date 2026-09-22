import { useId, useState } from "react";

export interface SymbolTooltipProps {
  /** The rendered symbol, e.g. "λ" or a KaTeX span's children. */
  children: React.ReactNode;
  /** Plain-English name, e.g. "eigenvalue". */
  name: string;
  /** How to read it aloud, e.g. "lambda". */
  pronunciation?: string;
  /** Plain-English meaning of the symbol. */
  meaning: string;
  /** Link to the full entry on the notation sheet. */
  href?: string;
}

/**
 * Wraps a rendered math symbol with a hover (desktop) / tap (mobile)
 * tooltip showing its name, pronunciation, and meaning, linking back to
 * the notation sheet for the full entry.
 */
export default function SymbolTooltip({
  children,
  name,
  pronunciation,
  meaning,
  href,
}: SymbolTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="symbol-tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="term" tabIndex={0} aria-describedby={tooltipId} aria-expanded={open}>
        {children}
      </span>
      {open && (
        <span role="tooltip" id={tooltipId} className="symbol-tooltip-bubble">
          <strong>{name}</strong>
          {pronunciation && <em>{pronunciation}</em>}
          <span>{meaning}</span>
          {href && <a href={href}>See notation sheet →</a>}
        </span>
      )}
    </span>
  );
}
