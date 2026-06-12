import type { AgendaSession } from "@/lib/event-view";
import type { DraftSession } from "@/lib/evenn/types";
import { anthropicJson } from "./anthropic";
import { openAiCompatJson, type CompatProvider } from "./openrouter";
import { localAgenda, type AgendaPick } from "./fallback";
import { fillGapsWithMeetups } from "./gaps";

// Generates a personalised agenda: an ordered subset of the event's sessions
// with a one-line reason each. Provider is chosen via LLM_PROVIDER, falling
// back to whichever API key is present, then to a local heuristic.

const AGENDA_SCHEMA = {
  type: "object",
  properties: {
    sessions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["index", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["sessions"],
  additionalProperties: false,
};

export interface GenerateAgendaInput {
  profileAnswers: Record<string, string>;
  preferences: Record<string, string>;
  eventTitle: string;
  sessions: AgendaSession[];
  // Ratings the attendee gave at past events — taste signals from the DB.
  pastFeedback?: { title: string; rating: number | null }[];
}

type Provider = "anthropic" | CompatProvider | "local";

function pickProvider(): Provider {
  const pref = process.env.LLM_PROVIDER;
  if (pref === "anthropic" || pref === "openrouter" || pref === "openai" || pref === "local") {
    return pref;
  }
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  
  return "local";
}

function buildPrompt(input: GenerateAgendaInput): string {
  const list = input.sessions
    .map((s, i) => {
      const bits = [
        s.day,
        `${s.startsAt}–${s.endsAt}`,
        s.type,
        `"${s.title}"`,
        s.speaker && `${s.speaker}${s.speakerTitle ? ` (${s.speakerTitle})` : ""}`,
        s.track && `track: ${s.track}`,
        s.description && s.description.slice(0, 160),
      ].filter(Boolean);
      return `[${i}] ${bits.join(" | ")}`;
    })
    .join("\n");
  const fmt = (o: Record<string, string>) =>
    Object.entries(o)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n") || "- (none)";

  return `You are planning a personalised agenda for a conference attendee.

Event: ${input.eventTitle}

Sessions, each tagged with its index:
${list}

Attendee profile (from onboarding):
${fmt(input.profileAnswers)}

Their preferences for this event:
${fmt(input.preferences)}
${
  input.pastFeedback?.length
    ? `\nSessions they rated at past events (taste signal):\n${input.pastFeedback
        .map((f) => `- "${f.title}"${f.rating ? `: ${f.rating}/5` : ""}`)
        .join("\n")}\n`
    : ""
}
Pick the sessions that form a realistic, personalised path:
- Pack the day: in every time slot pick the single best-matching session among
  parallel tracks. Leave no gap longer than an hour while sessions are running,
  even if a slot is only loosely related — pick the closest fit and say why.
- Exception: if the pace preference is "Just the highlights", pick only the
  few standout sessions instead of packing the day.
- Keep chronological order within each day and never pick two overlapping sessions.
- Favour sessions matching the attendee's interests, experience level and preferred formats.
- Give each pick one short reason (under 15 words) written to the attendee.
- The order of your "sessions" array is the recommended path order.
Respond with JSON only.`;
}

async function llmPicks(
  provider: Exclude<Provider, "local">,
  input: GenerateAgendaInput
): Promise<AgendaPick[]> {
  const prompt = buildPrompt(input);
  const raw =
    provider === "anthropic"
      ? await anthropicJson(prompt, AGENDA_SCHEMA)
      : await openAiCompatJson(provider, prompt, AGENDA_SCHEMA);
  return (JSON.parse(raw) as { sessions: AgendaPick[] }).sessions;
}

export async function generateAgenda(
  input: GenerateAgendaInput
): Promise<DraftSession[]> {
  const provider = pickProvider();
  let picks: AgendaPick[];
  if (provider === "local") {
    picks = localAgenda(input.sessions, input.profileAnswers, input.preferences);
  } else {
    try {
      picks = await llmPicks(provider, input);
    } catch (e) {
      console.error(`[evenner] ${provider} agenda generation failed:`, e);
      picks = localAgenda(input.sessions, input.profileAnswers, input.preferences);
    }
  }

  const seen = new Set<number>();
  const draft = picks
    .filter((p) => {
      if (seen.has(p.index) || !input.sessions[p.index]) return false;
      seen.add(p.index);
      return true;
    })
    .map((p) => {
      const s = input.sessions[p.index];
      return {
        index: p.index,
        day: s.day,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        title: s.title,
        speaker: s.speaker,
        room: s.room,
        track: s.track,
        type: s.type,
        reason: p.reason,
      };
    });

  // Long holes in a day become micro-meetups with like-minded attendees.
  const topics = [
    input.preferences.topics,
    input.profileAnswers.interests,
    input.profileAnswers.primary_domain,
  ]
    .flatMap((v) => (v ?? "").split(/[,;/]/))
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  return fillGapsWithMeetups(draft, topics);
}
