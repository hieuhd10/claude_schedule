const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

/** Compact elapsed label such as "2d 4h" or "35m". */
export function formatDuration(fromIso: string, toIso: string | null): string {
  const from = new Date(fromIso).getTime();
  const to = toIso ? new Date(toIso).getTime() : Date.now();
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return "—";

  const elapsed = to - from;
  if (elapsed < HOUR) return `${Math.max(1, Math.round(elapsed / MINUTE))}m`;
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    const minutes = Math.round((elapsed % HOUR) / MINUTE);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  const days = Math.floor(elapsed / DAY);
  const hours = Math.round((elapsed % DAY) / HOUR);
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

export function relativeTime(value: string | null): string {
  if (!value) return "—";
  const elapsed = formatDuration(value, null);
  return elapsed === "—" ? "—" : `${elapsed} ago`;
}

export function initials(name: string | null): string {
  if (!name) return "—";
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "—";
}
