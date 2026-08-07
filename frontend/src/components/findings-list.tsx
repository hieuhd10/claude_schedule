import { useState } from "react";

interface FindingsListProps {
  findings: string[];
  /** Shown instead of the list when nothing was reported; omit to render nothing. */
  empty?: string;
  /** Items shown before the list collapses behind a toggle. */
  max?: number;
}

export function FindingsList({ findings, empty, max = 3 }: FindingsListProps) {
  const [expanded, setExpanded] = useState(false);

  if (findings.length === 0) {
    return empty ? <p className="t-caption">{empty}</p> : null;
  }

  const collapsed = !expanded && findings.length > max;
  const shown = collapsed ? findings.slice(0, max) : findings;

  return (
    <>
      <ul className="step-detail__findings">
        {shown.map((finding, index) => (
          <li key={index}>{finding}</li>
        ))}
      </ul>
      {findings.length > max && (
        <button type="button" className="link-button" onClick={() => setExpanded(!expanded)}>
          {collapsed ? `Show all ${findings.length}` : "Show fewer"}
        </button>
      )}
    </>
  );
}
