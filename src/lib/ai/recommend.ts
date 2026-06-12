// Post-event recommendations. With an Anthropic key: call 1 uses web search
// to find real resources, call 2 extracts structured JSON (web search
// force-enables citations, which are incompatible with output_config — the
// two must stay separate calls). Without one, falls back to OpenAI/OpenRouter
// drawing on model knowledge. Capped at MAX_ITEMS links.

import { LLM_MODEL, anthropicJson } from "./anthropic";
import { openAiCompatJson, type CompatProvider } from "./openrouter";
import type { RecommendationKind } from "@/lib/live/types";

export interface SessionSignal {
  title: string;
  speaker: string | null;
  rating: number | null;
  feedback: string | null;
  transcript: string | null;
}

export interface RecItem {
  kind: RecommendationKind;
  title: string;
  url: string;
  reason: string;
}

const API_URL = "https://api.anthropic.com/v1/messages";
const KINDS: RecommendationKind[] = ["article", "repo", "video"];
const MAX_ITEMS = 10;

const REC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "title", "url", "reason"],
        properties: {
          kind: { type: "string", enum: KINDS },
          title: { type: "string" },
          url: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
};

interface Block {
  type: string;
  text?: string;
}

interface MessagesResponse {
  content: Block[];
  stop_reason: string;
}

async function callMessages(body: object): Promise<MessagesResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as MessagesResponse;
}

// Web-search call. Long searches can return stop_reason "pause_turn"; we
// append the partial assistant turn and continue (max 5 continuations).
async function searchForResources(prompt: string): Promise<string> {
  const base = {
    model: LLM_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    tools: [{ type: "web_search_20260209", name: "web_search" }],
  };
  const messages: { role: string; content: unknown }[] = [
    { role: "user", content: prompt },
  ];

  let response = await callMessages({ ...base, messages });
  for (let i = 0; i < 5 && response.stop_reason === "pause_turn"; i++) {
    messages.push({ role: "assistant", content: response.content });
    response = await callMessages({ ...base, messages });
  }

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");
}

function buildSearchPrompt(eventTitle: string, sessions: SessionSignal[]) {
  const lines = sessions.map((s) => {
    const parts = [
      `- "${s.title}"${s.speaker ? ` by ${s.speaker}` : ""}`,
      s.rating ? `rated ${s.rating}/5` : "not rated",
    ];
    if (s.feedback) parts.push(`feedback: ${s.feedback.slice(0, 300)}`);
    if (s.transcript) {
      parts.push(`talk excerpt: ${s.transcript.slice(0, 1200)}`);
    }
    return parts.join(" — ");
  });

  return [
    `An attendee just finished the event "${eventTitle}". Their sessions:`,
    ...lines,
    "",
    "Use web search to find follow-up resources matching the themes of the",
    "sessions they rated highest and the topics in their feedback/excerpts:",
    "2-3 recent articles, 2-3 GitHub repositories and 2-3 YouTube videos.",
    "For each, give the exact URL, the title and one sentence on why it fits.",
  ].join("\n");
}

// Without web search, ask for well-known resources the model is sure exist.
function buildKnowledgePrompt(eventTitle: string, sessions: SessionSignal[]) {
  const lines = sessions.map(
    (s) =>
      `- "${s.title}"${s.speaker ? ` by ${s.speaker}` : ""}` +
      (s.rating ? ` — rated ${s.rating}/5` : "") +
      (s.feedback ? ` — feedback: ${s.feedback.slice(0, 200)}` : "")
  );
  return [
    `An attendee just finished the event "${eventTitle}". Their sessions:`,
    ...lines,
    "",
    `Recommend up to ${MAX_ITEMS} follow-up resources matching the themes of`,
    "the sessions they rated highest: a mix of articles, GitHub repositories",
    '(kind "repo") and YouTube videos (kind "video"). Only include resources',
    "you are confident exist, with canonical long-lived URLs (official docs",
    "or blogs, github.com/org/repo, well-known conference talks). One short",
    "reason each, written to the attendee. Respond with JSON only.",
  ].join("\n");
}

function compatProvider(): CompatProvider | null {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  return null;
}

export async function recommendResources(
  eventTitle: string,
  sessions: SessionSignal[]
): Promise<RecItem[]> {
  let extracted: string;
  if (process.env.ANTHROPIC_API_KEY) {
    const findings = await searchForResources(
      buildSearchPrompt(eventTitle, sessions)
    );
    extracted = await anthropicJson(
      "Extract every recommended resource from the notes below into items of " +
        'kind "article", "repo" (GitHub repositories) or "video" (YouTube). ' +
        "Keep exact URLs; drop anything without a URL.\n\n" + findings,
      REC_SCHEMA
    );
  } else {
    const provider = compatProvider();
    if (!provider) throw new Error("No LLM API key configured");
    extracted = await openAiCompatJson(
      provider,
      buildKnowledgePrompt(eventTitle, sessions),
      REC_SCHEMA
    );
  }

  const parsed = JSON.parse(extracted) as { items: RecItem[] };
  return parsed.items
    .filter(
      (item) => KINDS.includes(item.kind) && /^https?:\/\//.test(item.url)
    )
    .slice(0, MAX_ITEMS);
}
