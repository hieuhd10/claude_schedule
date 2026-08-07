import type { ReactNode } from "react";

interface StepSectionProps {
  label: string;
  /** Small right-aligned note, e.g. an item count. */
  meta?: ReactNode;
  /** Puts the body on a sunken panel so the label cannot blend into the text. */
  panel?: boolean;
  tone?: "default" | "risk";
  children: ReactNode;
}

export function StepSection({ label, meta, panel, tone = "default", children }: StepSectionProps) {
  return (
    <section className="step-section">
      <div className="step-section__head">
        <span className="t-overline">{label}</span>
        {meta && <span className="t-tiny">{meta}</span>}
      </div>
      <div
        className={[
          "step-section__body",
          panel ? "step-section__body--panel" : "",
          tone === "risk" ? "step-section__body--risk" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
