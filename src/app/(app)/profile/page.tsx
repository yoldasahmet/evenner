import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ProfileHeader from "@/components/profile/ProfileHeader";
import InterestGraphics from "@/components/profile/InterestGraphics";
import AnswersSection from "@/components/profile/AnswersSection";
import OrganiserCompanyCard from "@/components/profile/OrganiserCompanyCard";
import RecommendationList from "@/components/live/RecommendationList";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { listOnboardingQuestions } from "@/lib/onboarding-questions";
import { deriveInsights } from "@/lib/profile-insights";
import { listRecommendationsForProfile } from "@/lib/live/queries";
import type { Profile } from "@/lib/types";

// Profile view. Attendees see their tech profile, onboarding answers and
// saved recommendations; organisers see their company/organisation details
// instead (no answers / recommendations).
export default async function ProfilePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    return (
      <>
        <PageHeader title="Profile" />
        <EmptyState
          icon="👤"
          title="Profile unavailable"
          description="We couldn't load your profile. Try signing in again."
        />
      </>
    );
  }

  if (profile.role === "organiser") return <OrganiserProfile profile={profile} />;

  const [questions, recommendations, { data: rows }] = await Promise.all([
    listOnboardingQuestions(supabase),
    listRecommendationsForProfile(supabase, profile.id),
    supabase
      .from("onboarding_answers")
      .select("question_key, answer")
      .eq("profile_id", profile.id),
  ]);
  const answers = Object.fromEntries(
    (rows ?? []).map((r) => [r.question_key, r.answer])
  );
  const insights = deriveInsights(answers, questions);

  return (
    <>
      <PageHeader title="Profile" subtitle="Your evenner identity." />

      <div className="space-y-6">
        <ProfileHeader profile={profile} completeness={insights.completeness} />

        <div className="animate-fade-up delay-1">
          <InterestGraphics insights={insights} />
        </div>

        <AnswersSection
          questions={questions}
          answers={answers}
          completeness={insights.completeness}
        />

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm animate-fade-up delay-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">📚 Recommendations</h2>
            {recommendations.length > 0 && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {recommendations.length} saved
              </span>
            )}
          </div>
          {recommendations.length > 0 ? (
            <RecommendationList items={recommendations} />
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
              Nothing saved yet — finish an event in your hub and tap
              &ldquo;Get recommendations&rdquo; to collect articles, repos and
              videos matched to the talks you loved.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

// Organiser template: identity + editable company details, styled to match
// the dark "studio" shell.
function OrganiserProfile({ profile }: { profile: Profile }) {
  const fields = [
    profile.full_name,
    profile.company_name,
    profile.company_website,
    profile.company_role,
    profile.company_about,
  ];
  const completeness = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100
  );

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="You and the organisation behind your events."
      />
      <div className="space-y-6">
        <ProfileHeader
          profile={profile}
          completeness={completeness}
          variant="organiser"
        />
        <OrganiserCompanyCard profile={profile} />
      </div>
    </>
  );
}
