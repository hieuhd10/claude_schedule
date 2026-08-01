import type { ActivityItem } from "../api/types";
import { TimelineItem } from "./timeline-item";

interface ActivityTimelineProps {
  items: ActivityItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return <p className="activity-timeline__empty">No activity yet.</p>;
  }

  return (
    <ul className="activity-timeline">
      {items.map((item, index) => (
        // Activity items have no stable id from the backend; index is safe since the
        // list is re-derived wholesale on every refresh, never reordered in place.
        <TimelineItem key={index} item={item} />
      ))}
    </ul>
  );
}
