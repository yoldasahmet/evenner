import type { Event, Session } from "./types";
import { toMinutes } from "./evenn/time";

// Pure stat computations for the organiser dashboard. Works on real DB dates
// (sessions.day + "HH:MM" clock strings) — the display-time demo clock in
// demo-clock.ts is intentionally not applied here.

export type OrganiserEvent = Event & { sessions: Session[] };

export interface SessionPointer {
  eventId: string;
  eventTitle: string;
  title: string;
  speaker: string | null;
  room: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface OrganiserStats {
  totalEvents: number;
  publishedEvents: number;
  totalSessions: number;
  speakerCount: number;
  /** Events with at least one agenda item today. */
  activeToday: OrganiserEvent[];
  /** A session running at this moment (latest-started one wins). */
  liveNow: SessionPointer | null;
  /** The next session starting after now (today or a later day). */
  nextUp: SessionPointer | null;
  registrations: number;
  totalCapacity: number;
  registrationPercent: number;
}

function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toPointer(e: OrganiserEvent, s: Session): SessionPointer {
  return {
    eventId: e.id,
    eventTitle: e.title,
    title: s.title,
    speaker: s.speaker,
    room: s.room,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
  };
}

export function computeOrganiserStats(
  events: OrganiserEvent[],
  registrationsByEvent: Map<string, number>,
  now = new Date()
): OrganiserStats {
  const today = isoDate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const activeToday = events.filter((e) =>
    e.sessions.some((s) => s.day === today)
  );

  // Live now: today's sessions whose clock window contains "now".
  let liveNow: SessionPointer | null = null;
  let liveStart = -1;
  // Next up: the soonest session still ahead of us (today first, then later days).
  let nextUp: SessionPointer | null = null;
  let nextKey = "";

  for (const e of events) {
    for (const s of e.sessions) {
      if (!s.day) continue;
      const start = toMinutes(s.starts_at);
      const end = toMinutes(s.ends_at);
      if (s.day === today && start !== null) {
        if (start <= nowMin && (end === null || nowMin < end) && start > liveStart) {
          liveNow = toPointer(e, s);
          liveStart = start;
        }
      }
      const upcoming =
        s.day > today || (s.day === today && start !== null && start > nowMin);
      if (upcoming && start !== null) {
        const key = `${s.day} ${s.starts_at}`;
        if (!nextUp || key < nextKey) {
          nextUp = toPointer(e, s);
          nextKey = key;
        }
      }
    }
  }

  const totalSessions = events.reduce((n, e) => n + e.sessions.length, 0);
  const speakerCount = new Set(
    events.flatMap((e) => e.sessions.map((s) => s.speaker).filter(Boolean))
  ).size;

  const totalCapacity = events.reduce((n, e) => n + (e.capacity ?? 0), 0);
  const registrations = events.reduce(
    (n, e) => n + (registrationsByEvent.get(e.id) ?? 0),
    0
  );
  const registrationPercent =
    totalCapacity > 0
      ? Math.min(100, Math.round((registrations / totalCapacity) * 100))
      : 0;

  return {
    totalEvents: events.length,
    publishedEvents: events.filter((e) => e.is_published).length,
    totalSessions,
    speakerCount,
    activeToday,
    liveNow,
    nextUp,
    registrations,
    totalCapacity,
    registrationPercent,
  };
}
