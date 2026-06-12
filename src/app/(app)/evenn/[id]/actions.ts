"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { recommendResources, type SessionSignal } from "@/lib/ai/recommend";
import { listFeedbackForEvenn } from "@/lib/live/queries";
import type { EvennRow, EvennSessionRow } from "@/lib/live/types";

type ActionResult = { ok: boolean; error?: string };

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

// RLS scopes both tables to the owner, so a found row implies ownership.
async function loadSessionWithEvenn(
  supabase: SupabaseClient,
  evennSessionId: string
) {
  const { data: session } = await supabase
    .from("evenn_sessions")
    .select("*")
    .eq("id", evennSessionId)
    .maybeSingle();
  if (!session) throw new Error("Session not found");

  const { data: evenn } = await supabase
    .from("evenns")
    .select("*")
    .eq("id", session.evenn_id)
    .maybeSingle();
  if (!evenn) throw new Error("Evenn not found");

  return { session: session as EvennSessionRow, evenn: evenn as EvennRow };
}

// Marks the evenn completed once no sessions are left to attend.
async function completeEvennIfDone(supabase: SupabaseClient, evennId: string) {
  const { data } = await supabase
    .from("evenn_sessions")
    .select("id")
    .eq("evenn_id", evennId)
    .in("status", ["upcoming", "joined"])
    .limit(1);
  if ((data ?? []).length === 0) {
    await supabase.from("evenns").update({ status: "completed" }).eq("id", evennId);
  }
}

export async function joinSession(evennSessionId: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId();
    const { session, evenn } = await loadSessionWithEvenn(supabase, evennSessionId);

    const { error } = await supabase.from("session_joins").insert({
      profile_id: userId,
      evenn_session_id: session.id,
      event_ref: evenn.event_ref,
      event_id: evenn.event_id,
      session_ref: session.session_ref,
      session_title: session.title,
    });
    if (error) return { ok: false, error: error.message };

    await supabase
      .from("evenn_sessions")
      .update({ status: "joined" })
      .eq("id", session.id);
    if (evenn.status === "approved") {
      await supabase.from("evenns").update({ status: "live" }).eq("id", evenn.id);
    }

    revalidatePath(`/evenn/${evenn.id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function endSession(
  evennSessionId: string,
  transcript: string,
  rating: number,
  feedback: string
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId();
    const { session, evenn } = await loadSessionWithEvenn(supabase, evennSessionId);

    const { error } = await supabase.from("session_feedback").insert({
      profile_id: userId,
      evenn_session_id: session.id,
      event_ref: evenn.event_ref,
      event_id: evenn.event_id,
      session_ref: session.session_ref,
      session_title: session.title,
      transcript: transcript.trim() || null,
      rating: rating >= 1 && rating <= 5 ? rating : null,
      feedback: feedback.trim() || null,
    });
    if (error) return { ok: false, error: error.message };

    await supabase
      .from("evenn_sessions")
      .update({ status: "completed" })
      .eq("id", session.id);
    await completeEvennIfDone(supabase, evenn.id);

    revalidatePath(`/evenn/${evenn.id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function skipSession(evennSessionId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUserId();
    const { session, evenn } = await loadSessionWithEvenn(supabase, evennSessionId);

    await supabase
      .from("evenn_sessions")
      .update({ status: "skipped" })
      .eq("id", session.id);
    await completeEvennIfDone(supabase, evenn.id);

    revalidatePath(`/evenn/${evenn.id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Leaves the event early: joined sessions count as completed, everything
// still upcoming is skipped, and the evenn moves to its recap.
export async function leaveEvent(evennId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUserId();
    const { data: evenn } = await supabase
      .from("evenns")
      .select("id")
      .eq("id", evennId)
      .maybeSingle();
    if (!evenn) return { ok: false, error: "Evenn not found" };

    await supabase
      .from("evenn_sessions")
      .update({ status: "completed" })
      .eq("evenn_id", evennId)
      .eq("status", "joined");
    await supabase
      .from("evenn_sessions")
      .update({ status: "skipped" })
      .eq("evenn_id", evennId)
      .eq("status", "upcoming");
    await supabase
      .from("evenns")
      .update({ status: "completed" })
      .eq("id", evennId);

    revalidatePath(`/evenn/${evennId}`);
    revalidatePath("/attendee");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function generateRecommendations(
  evennId: string
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId();
    const { data: evenn } = await supabase
      .from("evenns")
      .select("*")
      .eq("id", evennId)
      .maybeSingle();
    if (!evenn) return { ok: false, error: "Evenn not found" };

    const { data: sessions } = await supabase
      .from("evenn_sessions")
      .select("*")
      .eq("evenn_id", evennId)
      .order("position", { ascending: true });
    const rows = (sessions ?? []) as EvennSessionRow[];
    const feedback = await listFeedbackForEvenn(supabase, rows.map((s) => s.id));
    const byId = new Map(feedback.map((f) => [f.evenn_session_id, f]));

    const signals: SessionSignal[] = rows.map((s) => ({
      title: s.title,
      speaker: s.speaker,
      rating: byId.get(s.id)?.rating ?? null,
      feedback: byId.get(s.id)?.feedback ?? null,
      transcript: byId.get(s.id)?.transcript ?? null,
    }));

    const items = await recommendResources(evenn.event_title, signals);
    if (items.length > 0) {
      const { error } = await supabase.from("recommendations").insert(
        items.map((item) => ({ profile_id: userId, evenn_id: evennId, ...item }))
      );
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath(`/evenn/${evennId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
