"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { generateAgenda } from "@/lib/ai/agenda";
import { getEventForPlanning } from "@/lib/evenn/queries";
import { isUuid, type DraftSession } from "@/lib/evenn/types";

type DraftResult =
  | { ok: true; draft: DraftSession[] }
  | { ok: false; error: string };

/** Generates a personalised agenda draft. No DB writes. */
export async function generateDraft(
  eventRef: string,
  preferences: Record<string, string>
): Promise<DraftResult> {
  try {
    const supabase = createClient();
    const profile = await getCurrentProfile(supabase);
    if (!profile) return { ok: false, error: "Not authenticated" };

    const event = await getEventForPlanning(eventRef);
    if (!event) return { ok: false, error: "Event not found" };

    // Everything the model sees comes from the DB: the attendee's onboarding
    // interview plus ratings they gave at past events.
    const [{ data: answers }, { data: pastRatings }] = await Promise.all([
      supabase
        .from("onboarding_answers")
        .select("question_key, answer")
        .eq("profile_id", profile.id),
      supabase
        .from("session_feedback")
        .select("session_title, rating")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    const profileAnswers = Object.fromEntries(
      (answers ?? []).map((a) => [a.question_key, a.answer])
    );

    const draft = await generateAgenda({
      profileAnswers,
      preferences,
      eventTitle: event.title,
      sessions: event.sessions,
      pastFeedback: (pastRatings ?? []).map((r) => ({
        title: r.session_title as string,
        rating: r.rating as number | null,
      })),
    });
    if (draft.length === 0) {
      return { ok: false, error: "Could not build an agenda for this event" };
    }
    return { ok: true, draft };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// The evenns tables come from migration 0005; surface a clear hint when the
// migration hasn't been run against the Supabase project yet.
function friendly(message: string): string {
  return message.includes("schema cache")
    ? "Database not migrated yet — run supabase/migrations/0005_evenns.sql in the Supabase SQL editor, then try again."
    : message;
}

export interface ApproveInput {
  eventRef: string;
  preferences: Record<string, string>;
  sessions: DraftSession[];
}

/** Persists the approved agenda as an evenn + session snapshots. */
export async function approveEvenn(
  input: ApproveInput
): Promise<{ ok: false; error: string }> {
  try {
    const supabase = createClient();
    const profile = await getCurrentProfile(supabase);
    if (!profile) return { ok: false, error: "Not authenticated" };
    if (input.sessions.length === 0) {
      return { ok: false, error: "Keep at least one session" };
    }

    const event = await getEventForPlanning(input.eventRef);
    if (!event) return { ok: false, error: "Event not found" };

    const { data: evenn, error } = await supabase
      .from("evenns")
      .insert({
        profile_id: profile.id,
        event_ref: input.eventRef,
        event_id: isUuid(input.eventRef) ? input.eventRef : null,
        event_title: event.title,
        event_starts_at: event.startsAt,
        preferences: input.preferences,
        status: "approved",
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: friendly(error.message) };

    const rows = input.sessions.map((s, position) => ({
      evenn_id: evenn.id,
      // Negative indexes are synthetic micro-meetups, not event sessions.
      session_ref:
        s.index < 0
          ? `${input.eventRef}#micro-${position}`
          : `${input.eventRef}#${s.index}`,
      position,
      day: s.day || null,
      starts_at: s.startsAt || null,
      ends_at: s.endsAt || null,
      title: s.title,
      speaker: s.speaker ?? null,
      room: s.room ?? null,
      track: s.track ?? null,
      type: s.type,
      reason: s.reason || null,
    }));
    const { error: sessionsError } = await supabase
      .from("evenn_sessions")
      .insert(rows);
    if (sessionsError) return { ok: false, error: friendly(sessionsError.message) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  revalidatePath("/attendee");
  redirect("/attendee");
}
