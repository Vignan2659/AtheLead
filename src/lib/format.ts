const inr = new Intl.NumberFormat('en-IN');
export const formatIN = (n: number): string => inr.format(Math.round(n));
export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** "now", "12 min", "3 h", "2 d" — compact, for notice rows. */
export function timeAgo(at: number, now = Date.now()): string {
  const min = Math.max(0, Math.round((now - at) / 60_000));
  if (min < 1) return 'now';
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}
