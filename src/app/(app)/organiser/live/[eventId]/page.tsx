import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LiveDashboard from "@/components/organiser/live/LiveDashboard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { isUuid } from "@/lib/live/types";

// Organiser-only realtime dashboard for one event. `eventId` is an event_ref
// (a DB event uuid as text; older refs may be legacy demo slugs).
export default async function OrganiserLivePage({
  params,
}: {
  params: { eventId: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.role !== "organiser") redirect("/events");

  const eventRef = params.eventId;
  let title = eventRef;
  if (isUuid(eventRef)) {
    const { data } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventRef)
      .maybeSingle();
    title = data?.title ?? title;
  }

  const [{ data: joins }, { data: feedback }] = await Promise.all([
    supabase
      .from("session_joins")
      .select("*")
      .eq("event_ref", eventRef)
      .order("joined_at", { ascending: true }),
    supabase
      .from("session_feedback")
      .select("*")
      .eq("event_ref", eventRef)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <PageHeader
        title={`Live — ${title}`}
        subtitle="Joins and feedback stream in as they happen."
      />
      <LiveDashboard
        eventRef={eventRef}
        initialJoins={joins ?? []}
        initialFeedback={feedback ?? []}
      />
    </>
  );
}
