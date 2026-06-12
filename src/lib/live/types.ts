// Minimal row types for the live-event flow. The evenn tables are created by
// migration 0005; these mirror only the columns this feature reads/writes.

export type EvennStatus = "draft" | "approved" | "live" | "completed";
export type EvennSessionStatus = "upcoming" | "joined" | "completed" | "skipped";

export interface EvennRow {
  id: string;
  profile_id: string;
  event_ref: string; // DB event uuid as text OR a demo id like "io-connect-2026"
  event_id: string | null; // null for demo events
  event_title: string;
  event_starts_at: string | null;
  status: EvennStatus;
}

export interface EvennSessionRow {
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
}

export interface SessionJoin {
  id: string;
  profile_id: string;
  evenn_session_id: string;
  event_ref: string;
  event_id: string | null;
  session_ref: string;
  session_title: string;
  joined_at: string;
}

export interface SessionFeedback {
  id: string;
  profile_id: string;
  evenn_session_id: string;
  event_ref: string;
  event_id: string | null;
  session_ref: string;
  session_title: string;
  transcript: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
}

export type RecommendationKind = "article" | "repo" | "video";

export interface Recommendation {
  id: string;
  profile_id: string;
  evenn_id: string;
  kind: RecommendationKind;
  title: string;
  url: string;
  reason: string | null;
  created_at: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
