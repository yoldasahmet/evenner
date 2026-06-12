import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadSession } from "@/lib/profile";
import { listOnboardingQuestions } from "@/lib/onboarding-questions";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import OnboardingHero from "@/components/illustrations/OnboardingHero";

// The profile-setup interview. Shown automatically after every login until
// it is completed; afterwards it stays reachable from Profile for editing.
export default async function OnboardingPage() {
  const supabase = createClient();
  const session = await loadSession(supabase);

  if (session.status === "anonymous") redirect("/login");
  if (session.status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-gray-500">
        We couldn&apos;t load your profile. Please check the database setup and
        refresh.
      </div>
    );
  }

  const profile = session.profile;

  // Pre-fill any answers the user gave before, so editing resumes in place.
  const [questions, { data: rows }] = await Promise.all([
    listOnboardingQuestions(supabase),
    supabase
      .from("onboarding_answers")
      .select("question_key, answer")
      .eq("profile_id", profile.id),
  ]);

  const initial = Object.fromEntries(
    (rows ?? []).map((r) => [r.question_key, r.answer])
  );

  const firstName =
    initial.name?.split(" ")[0] ?? profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-4 py-10">
      {/* soft ambient blobs */}
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-2 flex justify-center">
          <OnboardingHero className="h-32 w-auto animate-pop" />
        </div>
        <p className="mb-1 text-center text-sm font-semibold text-brand-700 animate-fade-up">
          Hi {firstName} 👋
        </p>
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900 animate-fade-up delay-1">
          {profile.onboarded
            ? "Update your AI agent"
            : "Let's set up your AI agent"}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 animate-fade-up delay-2">
          A few quick questions so we can tailor events to you.
        </p>
        <div className="animate-fade-up delay-3">
          <OnboardingWizard questions={questions} initialAnswers={initial} />
        </div>
      </div>
    </div>
  );
}
