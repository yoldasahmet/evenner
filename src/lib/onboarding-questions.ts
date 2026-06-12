import type { SupabaseClient } from "@supabase/supabase-js";

// The post-login onboarding interview. Question definitions live in the
// `onboarding_questions` table (seeded by migration 0007); answers seed the
// AI agent's understanding of the user. Keys are stable — stored verbatim.

export type QuestionCategory = "identity" | "tech" | "events";

export interface AgentQuestion {
  key: string;
  prompt: string;
  hint?: string; // short helper line under the prompt
  icon?: string; // emoji shown beside the prompt
  placeholder?: string;
  choices?: string[];
  multi?: boolean; // multi-select choices, stored comma-separated
  category?: QuestionCategory;
}

interface QuestionRow {
  key: string;
  prompt: string;
  hint: string | null;
  icon: string | null;
  placeholder: string | null;
  choices: string[] | null;
  multi: boolean;
  category: string | null;
  position: number;
}

/** All onboarding questions, in interview order. */
export async function listOnboardingQuestions(
  supabase: SupabaseClient
): Promise<AgentQuestion[]> {
  const { data, error } = await supabase
    .from("onboarding_questions")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    console.error("[evenner] listOnboardingQuestions:", error.message);
    return [];
  }

  return ((data ?? []) as QuestionRow[]).map((r) => ({
    key: r.key,
    prompt: r.prompt,
    hint: r.hint ?? undefined,
    icon: r.icon ?? undefined,
    placeholder: r.placeholder ?? undefined,
    choices: r.choices ?? undefined,
    multi: r.multi || undefined,
    category: (r.category as QuestionCategory) ?? undefined,
  }));
}
