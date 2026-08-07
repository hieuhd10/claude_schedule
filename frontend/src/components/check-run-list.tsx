import type { CheckRun } from "../api/types";
import { Badge } from "../design-system/lift-tailux";
import { checkState } from "../lib/check-state";
import { CHECK_STATE_COLORS } from "../lib/ds-colors";

interface CheckRunListProps {
  checks: CheckRun[];
}

export function CheckRunList({ checks }: CheckRunListProps) {
  if (checks.length === 0) {
    return <p className="t-caption">No checks reported.</p>;
  }

  return (
    <ul className="check-list">
      {checks.map((check) => {
        const state = checkState(check);
        return (
          <li key={check.name} className="check-list__item">
            <span className="check-list__name">
              {check.html_url ? (
                <a href={check.html_url} target="_blank" rel="noreferrer">
                  {check.name}
                </a>
              ) : (
                check.name
              )}
            </span>
            <Badge component="span" variant="soft" color={CHECK_STATE_COLORS[state]}>
              {check.conclusion ?? check.status}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
