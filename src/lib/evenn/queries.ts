import type { SupabaseClient } from "@supabase/supabase-js";
import { getEvent } from "@/lib/events";
import type { EventDetail } from "@/lib/event-view";
import type { EvennWithSessions } from "./types";

/** All evenns for a profile, newest first, sessions ordered by position. */
export async function listEvennsForProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<EvennWithSessions[]> {
  const { data, error } = await supabase
    .from("evenns")
    .select("*, evenn_sessions(*)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[evenner] listEvennsForProfile:", error.message);
    return [];
  }

  return ((data ?? []) as EvennWithSessions[]).map((evenn) => ({
    ...evenn,
    evenn_sessions: [...evenn.evenn_sessions].sort(
      (a, b) => a.position - b.position
    ),
  }));
}

/**
 * Loads an event (demo or DB) for agenda planning. Returns null when the
 * event doesn't exist or has no sessions to plan with.
 */
export async function getEventForPlanning(
  eventRef: string
): Promise<EventDetail | null> {
  const event = await getEvent(eventRef);
  if (!event || event.sessions.length === 0) return null;
  return event;
}
