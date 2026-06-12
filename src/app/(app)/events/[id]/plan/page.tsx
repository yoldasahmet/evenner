import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PlanFlow from "@/components/evenn/PlanFlow";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getEventForPlanning } from "@/lib/evenn/queries";

// Plan "my evenn": answer a few preference questions, let the agent draft a
// personalised agenda, then review and approve it.
export default async function PlanEvennPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");

  const event = await getEventForPlanning(params.id);
  if (!event) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/events/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-brand-700 hover:gap-2 transition-all"
      >
        ← Back to event
      </Link>

      <header className="animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
          Create my evenn
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{event.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Answer a few questions and we&apos;ll curate a personalised path
          through all {event.sessions.length} sessions.
        </p>
      </header>

      <PlanFlow eventRef={params.id} sessions={event.sessions} />
    </article>
  );
}
