// Pure date helpers for the live-event flow. `day` is either an ISO date
// ("2026-08-18", DB events) or a demo label ("Day 1 · Tue 18 Aug 2026");
// session times are "HH:MM" strings.

import type { EvennSessionRow } from "./types";

const DEFAULT_SESSION_MINUTES = 60;

export function parseSessionStart(
  day: string | null,
  time: string | null
): Date | null {
  if (!day || !time) return null;

  let base = new Date(day);
  if (Number.isNaN(base.getTime())) {
    // Demo label: parse the date after the last "·" separator.
    const label = day.slice(day.lastIndexOf("·") + 1).trim();
    base = new Date(label);
    if (Number.isNaN(base.getTime())) return null;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;

  base.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return base;
}

function sessionWindow(session: EvennSessionRow): [Date, Date] | null {
  const start = parseSessionStart(session.day, session.starts_at);
  if (!start) return null;
  const end =
    parseSessionStart(session.day, session.ends_at) ??
    new Date(start.getTime() + DEFAULT_SESSION_MINUTES * 60_000);
  return [start, end];
}

// Index of the first session whose [start, end) window contains `now`.
export function currentSessionIndex(
  sessions: EvennSessionRow[],
  now: Date
): number {
  return sessions.findIndex((session) => {
    const window = sessionWindow(session);
    return window !== null && now >= window[0] && now < window[1];
  });
}

// Index of the first session the attendee can still take part in.
export function nextUpcomingIndex(sessions: EvennSessionRow[]): number {
  return sessions.findIndex(
    (session) => session.status === "upcoming" || session.status === "joined"
  );
}
