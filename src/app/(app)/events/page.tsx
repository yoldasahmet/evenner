import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/events/EventCard";
import { listEvents } from "@/lib/events";

// Attendee-facing browse. Shows the curated demo events plus any published
// events created by organisers.
export default async function EventsPage() {
  const events = await listEvents();

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Discover conferences, summits and workshops to attend."
      />

      {events.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No events yet"
          description="Published events will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </>
  );
}
