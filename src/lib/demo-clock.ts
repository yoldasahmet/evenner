import type { Session } from "./types";
import { toClock, toMinutes } from "./evenn/time";

// Testing clock: presents every event as if its final day were today and its
// last session were starting right now. Purely display-time — computed when
// the page is opened, never written back to the database. This lets
// during-event and after-event features be exercised on any date.

const DAY_MS = 86_400_000;

function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function shiftToNow(rows: Session[], now = new Date()): Session[] {
  const days = Array.from(
    new Set(rows.map((r) => r.day).filter((d): d is string => !!d))
  ).sort();
  if (days.length === 0) return rows;
  const lastDay = days[days.length - 1];

  // Whole days between the event's final day and today.
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const lastMid = new Date(lastDay);
  lastMid.setHours(0, 0, 0, 0);
  const dayShift = Math.round((today.getTime() - lastMid.getTime()) / DAY_MS);

  // Minutes to move the final day so its last session starts one minute ago.
  const lastDayStarts = rows
    .filter((r) => r.day === lastDay)
    .map((r) => toMinutes(r.starts_at))
    .filter((m): m is number => m !== null);
  const lastStart = lastDayStarts.length ? Math.max(...lastDayStarts) : null;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const delta = lastStart === null ? 0 : nowMin - 1 - lastStart;

  const clampClock = (t: string | null) => {
    const m = toMinutes(t);
    return m === null ? t : toClock(Math.min(Math.max(m + delta, 0), 1439));
  };

  return rows.map((r) => {
    if (!r.day) return r;
    const onLastDay = r.day === lastDay;
    const shifted = new Date(new Date(r.day).getTime() + dayShift * DAY_MS);
    return {
      ...r,
      day: isoDate(shifted),
      starts_at: onLastDay ? clampClock(r.starts_at) : r.starts_at,
      ends_at: onLastDay ? clampClock(r.ends_at) : r.ends_at,
    };
  });
}
