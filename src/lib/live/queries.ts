import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EvennRow,
  EvennSessionRow,
  Recommendation,
  SessionFeedback,
} from "./types";

// Loads an evenn and its snapshot sessions ordered by position.
// RLS scopes both tables to the owning profile, so no explicit user filter.
export async function getEvennWithSessions(
  supabase: SupabaseClient,
  id: string
): Promise<{ evenn: EvennRow; sessions: EvennSessionRow[] } | null> {
  const { data: evenn } = await supabase
    .from("evenns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!evenn) return null;

  const { data: sessions } = await supabase
    .from("evenn_sessions")
    .select("*")
    .eq("evenn_id", id)
    .order("position", { ascending: true });

  return {
    evenn: evenn as EvennRow,
    sessions: (sessions ?? []) as EvennSessionRow[],
  };
}

// Feedback the attendee left for the given evenn sessions.
export async function listFeedbackForEvenn(
  supabase: SupabaseClient,
  sessionIds: string[]
): Promise<SessionFeedback[]> {
  if (sessionIds.length === 0) return [];
  const { data } = await supabase
    .from("session_feedback")
    .select("*")
    .in("evenn_session_id", sessionIds)
    .order("created_at", { ascending: true });
  return (data ?? []) as SessionFeedback[];
}

export async function listRecommendations(
  supabase: SupabaseClient,
  evennId: string
): Promise<Recommendation[]> {
  const { data } = await supabase
    .from("recommendations")
    .select("*")
    .eq("evenn_id", evennId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Recommendation[];
}

// Every recommendation the user has collected, newest first.
export async function listRecommendationsForProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<Recommendation[]> {
  const { data } = await supabase
    .from("recommendations")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Recommendation[];
}
