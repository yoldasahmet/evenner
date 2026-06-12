// Row shapes for the evenns / evenn_sessions tables (migration 0005) plus
// the draft shape passed between agenda generation and approval.

export type EvennStatus = "draft" | "approved" | "live" | "completed";
export type EvennSessionStatus = "upcoming" | "joined" | "completed" | "skipped";

export interface Evenn {
  id: string;
  profile_id: string;
  event_ref: string;
  event_id: string | null;
  event_title: string;
  event_starts_at: string | null;
  preferences: Record<string, string>;
  status: EvennStatus;
  created_at: string;
}

export interface EvennSession {
  id: string;
  evenn_id: string;
  session_ref: string;
  position: number;
  day: string | null;
  starts_at: string | null;
  ends_at: string | null;
  title: string;
  speaker: string | null;
  room: string | null;
  track: string | null;
  type: string;
  reason: string | null;
  status: EvennSessionStatus;
  created_at: string;
}

export type EvennWithSessions = Evenn & { evenn_sessions: EvennSession[] };

// A generated agenda item, still keyed by its index in the event's sessions.
export interface DraftSession {
  index: number;
  day: string;
  startsAt: string;
  endsAt: string;
  title: string;
  speaker?: string;
  room?: string;
  track?: string;
  type: string;
  reason: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
