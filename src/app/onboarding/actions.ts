"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

// The "goal" answer decides which template the user lands in.
function roleFromGoal(goal: string | undefined): UserRole {
  if (!goal) return "attendee";
  return /organis|both/i.test(goal) ? "organiser" : "attendee";
}

// Persists whatever answers are present and mirrors a couple of them onto the
// profile so the rest of the app (header, greetings) can read them directly.
async function persist(answers: Record<string, string>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = Object.entries(answers)
    .filter(([, value]) => value?.trim())
    .map(([question_key, answer]) => ({
      profile_id: user.id,
      question_key,
      answer,
    }));

  if (rows.length) {
    await supabase
      .from("onboarding_answers")
      .upsert(rows, { onConflict: "profile_id,question_key" });
  }

  const role = roleFromGoal(answers.goal);
  const update: Record<string, unknown> = { onboarded: true, role };
  if (answers.name?.trim()) update.full_name = answers.name.trim();
  if (answers.profession?.trim()) update.headline = answers.profession.trim();

  await supabase.from("profiles").update(update).eq("id", user.id);
  return role;
}

/**
 * Completes onboarding and routes into the role-appropriate home.
 */
export async function saveOnboarding(answers: Record<string, string>) {
  const role = await persist(answers);
  redirect(role === "organiser" ? "/organiser" : "/events");
}

/**
 * "I'll finish this later" — saves any answers given so far, marks the profile
 * complete (so the gate stops redirecting here) and drops the user on Profile,
 * where the remaining questions can be answered any time.
 */
export async function skipToProfile(answers: Record<string, string>) {
  await persist(answers);
  redirect("/profile");
}
