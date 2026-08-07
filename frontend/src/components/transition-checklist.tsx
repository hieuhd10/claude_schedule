import type { TransitionCondition } from "../lib/lifecycle-progress";

interface TransitionChecklistProps {
  conditions: TransitionCondition[];
}

/**
 * Every entry reflects GitHub state or a recorded lifecycle marker, so these are
 * facts rather than inputs. They render as status glyphs, not checkboxes, so the
 * list never reads as something the user is expected to tick.
 */
export function TransitionChecklist({ conditions }: TransitionChecklistProps) {
  return (
    <ul className="transition-checklist">
      {conditions.map((condition) => (
        <li
          key={condition.label}
          className={`transition-checklist__item transition-checklist__item--${condition.met ? "met" : "pending"}`}
        >
          <span className="transition-checklist__mark" aria-hidden="true">
            {condition.met ? "✓" : ""}
          </span>
          <span className="transition-checklist__text">
            <span className="t-body">{condition.label}</span>
            <span className="t-tiny">{condition.detail}</span>
          </span>
          <span className="sr-only">{condition.met ? "met" : "not met"}</span>
        </li>
      ))}
    </ul>
  );
}
