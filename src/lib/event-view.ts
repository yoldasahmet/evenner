import type { EventFormat, SessionType } from "./types";

// Presentation-facing event shapes. Both the static demo events and rows
// loaded from Supabase are normalised into these so the UI has one shape.

export interface AgendaSession {
  day: string; // group label, e.g. "Day 1 · Mon 17 Aug"
  startsAt: string; // display time, e.g. "09:00"
  endsAt: string;
  type: SessionType;
  title: string;
  description?: string;
  track?: string;
  speaker?: string;
  speakerTitle?: string;
  room?: string;
  hasPrize?: boolean;
}

export interface EventSponsor {
  name: string;
  tier?: string;
  websiteUrl?: string;
  logoUrl?: string;
}

export interface EventDetail {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  category?: string;
  format: EventFormat;
  location?: string;
  startsAt: string; // display string, e.g. "17–18 Aug 2026"
  endsAt?: string;
  capacity?: number;
  websiteUrl?: string;
  highlights?: string[];
  sponsors: EventSponsor[];
  sessions: AgendaSession[];
}

export interface EventSummary {
  id: string;
  title: string;
  tagline?: string;
  category?: string;
  format: EventFormat;
  location?: string;
  startsAt: string;
  sessionCount: number;
  sponsorCount: number;
}

export const FORMAT_LABEL: Record<EventFormat, string> = {
  in_person: "In person",
  virtual: "Virtual",
  hybrid: "Hybrid",
};

export const SESSION_LABEL: Record<SessionType, string> = {
  keynote: "Keynote",
  session: "Session",
  workshop: "Workshop",
  panel: "Panel",
};

export function toSummary(e: EventDetail): EventSummary {
  return {
    id: e.id,
    title: e.title,
    tagline: e.tagline,
    category: e.category,
    format: e.format,
    location: e.location,
    startsAt: e.startsAt,
    sessionCount: e.sessions.length,
    sponsorCount: e.sponsors.length,
  };
}

/** Groups an agenda into ordered day buckets for rendering. */
export function groupByDay(sessions: AgendaSession[]) {
  const days = new Map<string, AgendaSession[]>();
  for (const s of sessions) {
    if (!days.has(s.day)) days.set(s.day, []);
    days.get(s.day)!.push(s);
  }
  return Array.from(days, ([day, items]) => ({ day, items }));
}
