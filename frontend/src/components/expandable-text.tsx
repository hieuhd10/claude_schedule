import { useEffect, useRef, useState } from "react";

interface ExpandableTextProps {
  text: string;
  /** Lines shown before the toggle appears. */
  lines?: number;
  className?: string;
}

/**
 * Long prose clamped to a few lines. The toggle only appears when the text is
 * actually taller than the clamp, measured after render, so short reports never
 * grow a pointless "Show more".
 */
export function ExpandableText({ text, lines = 5, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    setOverflows(node.scrollHeight - node.clientHeight > 4);
  }, [text, lines]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={expanded ? "expandable__text" : "expandable__text expandable__text--clamped"}
        style={{ "--clamp-lines": lines } as React.CSSProperties}
      >
        {text}
      </p>
      {(overflows || expanded) && (
        <button type="button" className="link-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
