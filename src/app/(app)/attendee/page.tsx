import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import EvennCard from "@/components/evenn/EvennCard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { listEvennsForProfile } from "@/lib/evenn/queries";

// The attendee's personal hub: their evenns (personalised event instances),
// each with an animated agenda path.
export default async function AttendeePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) redirect("/login");
  if (profile.role !== "attendee") redirect("/organiser");

  const evenns = await listEvennsForProfile(supabase, profile.id);

  return (
    <>
      <PageHeader
        title="My hub"
        subtitle="Your evenns — personalised paths through the events you attend."
      />
      {evenns.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No evenns yet"
          description="Open an event and tap “Create my evenn” to get a personalised agenda."
          action={
            <Link
              href="/events"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Browse events
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {evenns.map((evenn, i) => (
            <EvennCard key={evenn.id} evenn={evenn} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
