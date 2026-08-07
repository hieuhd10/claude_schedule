import type { ActivityItem } from "../api/types";
import { Timeline } from "../design-system/lift-tailux";
import { TimelineItem } from "./timeline-item";

interface ActivityTimelineProps {
  items: ActivityItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return <p className="t-caption">No activity yet.</p>;
  }

  return (
    <Timeline lineSpace className="activity-timeline">
      {items.map((item, index) => (
        // Activity items have no stable id from the backend; index is safe since the
        // list is re-derived wholesale on every refresh, never reordered in place.
        // The list is newest-first, so only the first entry pings.
        <TimelineItem key={index} item={item} isLatest={index === 0} />
      ))}
    </Timeline>
  );
}
