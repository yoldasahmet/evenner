import Link from "next/link";
import { FORMAT_LABEL, type EventSummary } from "@/lib/event-view";

// Compact, tappable event card used in the events grid.
export default function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 animate-fade-up hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100/60"
    >
      <div className="bg-aurora flex h-28 items-end p-4">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
          {FORMAT_LABEL[event.format]}
        </span>
      </div>
      <div className="p-4">
        {event.category && (
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
            {event.category}
          </p>
        )}
        <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-brand-700">
          {event.title}
        </h3>
        {event.tagline && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {event.tagline}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>📅 {event.startsAt}</span>
          {event.location && <span>📍 {event.location}</span>}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {event.sessionCount} sessions · {event.sponsorCount} sponsors
        </div>
      </div>
    </Link>
  );
}
