import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import OrganiserBoard from "@/components/organiser/OrganiserBoard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import type { Event, Session, Sponsor } from "@/lib/types";

export type EventWithRelations = Event & {
  sessions: Session[];
  sponsors: Sponsor[];
};

// Organiser-only console: create events, build their agenda and add sponsors.
// Attendees are redirected away (role is set during onboarding).
export default async function OrganiserPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) redirect("/login");
  if (profile.role !== "organiser") redirect("/events");

  const { data } = await supabase
    .from("events")
    .select("*, sessions(*), sponsors(*)")
    .eq("organiser_id", profile.id)
    .order("created_at", { ascending: false });

  const events = (data ?? []) as EventWithRelations[];

  return (
    <>
      <PageHeader
        title="Organise"
        subtitle="Create events, build the agenda and add sponsors."
      />
      <OrganiserBoard events={events} />
    </>
  );
}
