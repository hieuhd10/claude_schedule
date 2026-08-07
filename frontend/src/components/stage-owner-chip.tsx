import type { StageOwner } from "../api/types";
import { Avatar } from "../design-system/lift-tailux";
import { formatDateTime } from "../lib/format-time";

interface StageOwnerChipProps {
  owner: StageOwner | null;
  /** Shown when no owner has been recorded for the step yet. */
  fallback?: string;
}

export function StageOwnerChip({ owner, fallback = "No owner recorded yet" }: StageOwnerChipProps) {
  if (!owner?.actor) {
    return <p className="t-caption">{fallback}</p>;
  }

  return (
    <div className="owner-chip">
      <Avatar name={owner.actor} size={7} initialColor="auto" initialVariant="soft" />
      <div className="owner-chip__text">
        <span className="owner-chip__name">
          {owner.source_url ? (
            <a href={owner.source_url} target="_blank" rel="noreferrer">
              {owner.actor}
            </a>
          ) : (
            owner.actor
          )}
        </span>
        <span className="t-tiny">
          {owner.role}
          {owner.recorded_at && ` · ${formatDateTime(owner.recorded_at)}`}
        </span>
      </div>
    </div>
  );
}
