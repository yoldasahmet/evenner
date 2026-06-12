import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import {
  LiveNowCard,
  NextUpCard,
  RegistrationCard,
  StatTile,
} from "@/components/organiser/DashboardWidgets";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import {
  computeOrganiserStats,
  type OrganiserEvent,
} from "@/lib/organiser-stats";

export const dynamic = "force-dynamic";

// Organiser dashboard: live + upcoming agenda spotlights and aggregate stats
// across the organiser's events. Organisers without events of their own see
// the platform showcase events so the dashboard is demoable immediately.
export default async function OrganiserDashboardPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) redirect("/login");
  if (profile.role !== "organiser") redirect("/events");

  const { data: own } = await supabase
    .from("events")
    .select("*, sessions(*)")
    .eq("organiser_id", profile.id);

  let events = (own ?? []) as OrganiserEvent[];
  const showcase = events.length === 0;
  if (showcase) {
    const { data: seeded } = await supabase
      .from("events")
      .select("*, sessions(*)")
      .is("organiser_id", null);
    events = (seeded ?? []) as OrganiserEvent[];
  }

  // Registrations = attendee evenns per event (readable via RLS for owned
  // and platform-seeded events, migration 0008).
  const registrations = new Map<string, number>();
  if (events.length > 0) {
    const { data: regs } = await supabase
      .from("evenns")
      .select("event_id")
      .in("event_id", events.map((e) => e.id));
    for (const r of regs ?? []) {
      if (!r.event_id) continue;
      registrations.set(r.event_id, (registrations.get(r.event_id) ?? 0) + 1);
    }
  }

  const stats = computeOrganiserStats(events, registrations);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={
          showcase
            ? "Showing the platform showcase events — create your own in the console to take over."
            : "How your events are doing right now."
        }
      />

      <div className="space-y-4">
        <LiveNowCard stats={stats} />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            icon="📅"
            label="Total events"
            value={stats.totalEvents}
            sub={`${stats.publishedEvents} published`}
          />
          <StatTile
            icon="⚡"
            label="Active today"
            value={stats.activeToday.length}
            sub="events with sessions today"
          />
          <StatTile
            icon="🎤"
            label="Sessions"
            value={stats.totalSessions}
            sub={`${stats.speakerCount} speakers`}
          />
          <StatTile
            icon="🤝"
            label="Capacity"
            value={stats.totalCapacity || "—"}
            sub="seats across all events"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NextUpCard next={stats.nextUp} />
          <RegistrationCard stats={stats} />
        </div>
      </div>
    </>
  );
}
