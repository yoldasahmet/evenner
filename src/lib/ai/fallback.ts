import type { AgendaSession } from "@/lib/event-view";
import { toMinutes } from "@/lib/evenn/time";

// Deterministic agenda picker used when no LLM API key is configured (or an
// LLM call fails). Packs each day: walks the schedule chronologically and
// picks the best-scoring session in every parallel slot, so the day stays
// full rather than only keeping exact interest matches.

export interface AgendaPick {
  index: number;
  reason: string;
}

function keywords(...values: (string | undefined)[]): string[] {
  return values
    .flatMap((v) => (v ?? "").split(/[,;/]/))
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 2);
}

export function localAgenda(
  sessions: AgendaSession[],
  answers: Record<string, string>,
  preferences: Record<string, string>
): AgendaPick[] {
  const topics = keywords(
    answers.interests,
    answers.primary_domain,
    answers.learning_goal,
    preferences.topics
  );
  const handsOn = `${answers.session_format ?? ""} ${preferences.style ?? ""}`
    .toLowerCase()
    .includes("hands-on");
  const highlightsOnly = (preferences.pace ?? "")
    .toLowerCase()
    .includes("highlight");

  const scored = sessions.map((s, index) => {
    const haystack =
      `${s.title} ${s.track ?? ""} ${s.description ?? ""}`.toLowerCase();
    const topic = topics.find((t) => haystack.includes(t));
    let score = topic ? 3 : 0;
    if (s.type === "keynote") score += 2;
    if (handsOn && s.type === "workshop") score += 2;
    const reason = topic
      ? `Matches your interest in ${topic}`
      : s.type === "keynote"
        ? "A headline keynote worth catching"
        : handsOn && s.type === "workshop"
          ? "Hands-on, the format you prefer"
          : "Keeps your day full between favourites";
    const start = toMinutes(s.startsAt) ?? index * 60;
    const end = toMinutes(s.endsAt) ?? start + 50;
    return { index, day: s.day, score, reason, start, end };
  });

  // Per day: chronological walk, best score wins each overlapping slot.
  const byDay = new Map<string, typeof scored>();
  for (const s of scored) {
    if (!byDay.has(s.day)) byDay.set(s.day, []);
    byDay.get(s.day)!.push(s);
  }
  let picks: typeof scored = [];
  for (const day of Array.from(byDay.values())) {
    day.sort((a, b) => a.start - b.start || b.score - a.score);
    let lastEnd = -1;
    for (const s of day) {
      if (s.start >= lastEnd) {
        picks.push(s);
        lastEnd = s.end;
      }
    }
  }

  if (highlightsOnly) {
    picks = picks.sort((a, b) => b.score - a.score).slice(0, 4);
  }
  return picks
    .sort((a, b) => a.index - b.index)
    .map(({ index, reason }) => ({ index, reason }));
}
