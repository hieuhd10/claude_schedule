import type { ActivityItem } from "../api/types";

const CATEGORY_LABELS: Record<ActivityItem["category"], string> = {
  human_command: "Human command",
  claude_response: "Claude response",
  github_system: "GitHub/System",
  ci_workflow: "CI/Workflow",
};

interface TimelineItemProps {
  item: ActivityItem;
}

export function TimelineItem({ item }: TimelineItemProps) {
  return (
    <li className={`timeline-item timeline-item--${item.category}`}>
      <div className="timeline-item__meta">
        <span className="timeline-item__category">{CATEGORY_LABELS[item.category]}</span>
        <span className="timeline-item__source">{item.source}</span>
        {item.actor && <span className="timeline-item__actor">@{item.actor}</span>}
        {item.created_at && (
          <span className="timeline-item__time">{new Date(item.created_at).toLocaleString()}</span>
        )}
      </div>
      <div className="timeline-item__summary">{item.summary}</div>
      {item.html_url && (
        <a href={item.html_url} target="_blank" rel="noreferrer">
          View on GitHub ↗
        </a>
      )}
    </li>
  );
}
