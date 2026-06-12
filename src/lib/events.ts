import { createClient } from "./supabase/server";
import { shiftToNow } from "./demo-clock";
import { toSummary, type EventDetail, type EventSummary } from "./event-view";
import type { Event, Session } from "./types";

// All events live in the database (seeded by migration 0007); rows are
// normalised into the EventDetail presentation shape here.

type EventRow = Event & { sessions?: Session[]; sponsors?: { name: string; tier: string | null; website_url: string | null; logo_url: string | null }[] };

function fmtDate(value: string | null): string {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Session days are DATE columns; render them as parse-friendly labels
// ("Thu, 11 Jun 2026") so grouping and live-clock logic both work.
function fmtDay(value: string | null): string {
  if (!value) return "Agenda";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapRow(row: EventRow): EventDetail {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline ?? undefined,
    description: row.description ?? "",
    category: row.category ?? undefined,
    format: row.format,
    location: row.location ?? undefined,
    startsAt: fmtDate(row.starts_at),
    endsAt: row.ends_at ? fmtDate(row.ends_at) : undefined,
    capacity: row.capacity ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    highlights: row.highlights ?? undefined,
    sponsors: (row.sponsors ?? []).map((s) => ({
      name: s.name,
      tier: s.tier ?? undefined,
      websiteUrl: s.website_url ?? undefined,
      logoUrl: s.logo_url ?? undefined,
    })),
    sessions: shiftToNow(row.sessions ?? [])
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        day: fmtDay(s.day),
        startsAt: s.starts_at ?? "",
        endsAt: s.ends_at ?? "",
        type: s.type,
        title: s.title,
        description: s.description ?? undefined,
        track: s.track ?? undefined,
        speaker: s.speaker ?? undefined,
        speakerTitle: s.speaker_title ?? undefined,
        room: s.room ?? undefined,
        hasPrize: s.has_prize || undefined,
      })),
  };
}

/** All published events, soonest first. */
export async function listEvents(): Promise<EventSummary[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("*, sessions(*), sponsors(*)")
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  return ((data ?? []) as EventRow[]).map((r) => toSummary(mapRow(r)));
}

/** One event by uuid, or null. */
export async function getEvent(id: string): Promise<EventDetail | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("*, sessions(*), sponsors(*)")
    .eq("id", id)
    .maybeSingle();

  return data ? mapRow(data as EventRow) : null;
}
