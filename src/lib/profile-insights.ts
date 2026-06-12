import type { AgentQuestion } from "./onboarding-questions";

// Derives the display data the Profile graphics need from the raw answer map.

export interface ProfileInsights {
  completeness: number; // 0–100, share of questions answered
  answeredCount: number;
  totalCount: number;
  domain?: string; // primary_domain
  experience?: string; // experience_level
  community?: string;
  interests: string[]; // flattened multi-select topics + languages + tools
  languages: string[];
  aiTools: string[];
}

const MULTI_KEYS = ["interests", "languages", "ai_tools", "session_format"];

function split(value?: string): string[] {
  return value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
}

export function deriveInsights(
  answers: Record<string, string>,
  questions: AgentQuestion[]
): ProfileInsights {
  const total = Math.max(questions.length, 1);
  const answered = questions.filter((q) => answers[q.key]?.trim()).length;

  const interests = MULTI_KEYS.flatMap((k) => split(answers[k]));

  return {
    completeness: Math.round((answered / total) * 100),
    answeredCount: answered,
    totalCount: total,
    domain: answers.primary_domain,
    experience: answers.experience_level,
    community: answers.community,
    interests,
    languages: split(answers.languages),
    aiTools: split(answers.ai_tools),
  };
}
