import type { ActivityItem } from "../api/types";
import { Badge, TimelineItem as DsTimelineItem } from "../design-system/lift-tailux";
import { ACTIVITY_COLORS } from "../lib/ds-colors";
import { formatDateTime } from "../lib/format-time";

const CATEGORY_LABELS: Record<ActivityItem["category"], string> = {
  human_command: "Human comment",
  claude_response: "Claude response",
  github_system: "GitHub / System",
  ci_workflow: "CI / Workflow",
};

interface TimelineItemProps {
  item: ActivityItem;
  /** The newest entry pings to mark live activity, as the design system does. */
  isLatest?: boolean;
}

export function TimelineItem({ item, isLatest = false }: TimelineItemProps) {
  const color = ACTIVITY_COLORS[item.category];

  return (
    <DsTimelineItem color={color} isPing={isLatest} className="activity-item">
      <div className="activity-item__head">
        <span className="t-body activity-item__summary">{item.summary}</span>
        <Badge component="span" variant="soft" color={color}>
          {CATEGORY_LABELS[item.category]}
        </Badge>
      </div>
      <p className="t-tiny">
        {item.actor ? `@${item.actor}` : item.source}
        {item.created_at && ` · ${formatDateTime(item.created_at)}`}
        {item.actor && ` · ${item.source}`}
      </p>
      {item.html_url && (
        <a className="t-tiny" href={item.html_url} target="_blank" rel="noreferrer">
          View on GitHub ↗
        </a>
      )}
    </DsTimelineItem>
  );
}
