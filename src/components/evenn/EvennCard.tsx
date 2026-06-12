import Link from "next/link";
import AgendaPath from "./AgendaPath";
import DeleteEvennButton from "./DeleteEvennButton";
import type { EvennStatus, EvennWithSessions } from "@/lib/evenn/types";

const STATUS_BADGE: Record<EvennStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  approved: "bg-brand-50 text-brand-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
};

// One evenn (personalised event instance) in the attendee hub.
export default function EvennCard({
  evenn,
  index = 0,
}: {
  evenn: EvennWithSessions;
  index?: number;
}) {
  return (
    <article
      className={`animate-fade-up delay-${(index % 6) + 1} flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-gray-900">
            {evenn.event_title}
          </h2>
          {evenn.event_starts_at && (
            <p className="text-sm text-gray-500">🗓️ {evenn.event_starts_at}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[evenn.status]}`}
          >
            {evenn.status}
          </span>
          <DeleteEvennButton evennId={evenn.id} />
        </div>
      </header>

      <div className="flex-1">
        <AgendaPath sessions={evenn.evenn_sessions} />
      </div>

      <Link
        href={`/evenn/${evenn.id}`}
        className="mt-4 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Open evenner →
      </Link>
    </article>
  );
}
