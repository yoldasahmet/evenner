"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string; id?: string };

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

const str = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim() || null;

// Creates an event owned by the current organiser.
export async function createEvent(form: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId();
    const title = str(form, "title");
    if (!title) return { ok: false, error: "Title is required" };

    const { data, error } = await supabase
      .from("events")
      .insert({
        organiser_id: userId,
        title,
        tagline: str(form, "tagline"),
        description: str(form, "description"),
        category: str(form, "category"),
        format: str(form, "format") ?? "in_person",
        location: str(form, "location"),
        website_url: str(form, "website_url"),
        starts_at: str(form, "starts_at"),
        ends_at: str(form, "ends_at"),
        capacity: Number(form.get("capacity")) || null,
        is_published: form.get("is_published") === "on",
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath("/organiser");
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Adds an agenda item (keynote / session / workshop / panel) to an event.
export async function addSession(form: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireUserId();
    const event_id = str(form, "event_id");
    const title = str(form, "title");
    if (!event_id || !title) return { ok: false, error: "Missing fields" };

    const { error } = await supabase.from("sessions").insert({
      event_id,
      title,
      type: str(form, "type") ?? "session",
      day: str(form, "day"),
      track: str(form, "track"),
      speaker: str(form, "speaker"),
      speaker_title: str(form, "speaker_title"),
      room: str(form, "room"),
      starts_at: str(form, "starts_at"),
      ends_at: str(form, "ends_at"),
      description: str(form, "description"),
      position: Number(form.get("position")) || 0,
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/organiser");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Attaches a sponsor to an event.
export async function addSponsor(form: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireUserId();
    const event_id = str(form, "event_id");
    const name = str(form, "name");
    if (!event_id || !name) return { ok: false, error: "Missing fields" };

    const { error } = await supabase.from("sponsors").insert({
      event_id,
      name,
      tier: str(form, "tier"),
      website_url: str(form, "website_url"),
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/organiser");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
