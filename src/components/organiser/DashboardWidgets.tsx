import Link from "next/link";
import type { OrganiserStats, SessionPointer } from "@/lib/organiser-stats";

// Presentational widgets for the organiser dashboard (dark "studio" theme).

export function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-400">
        {icon} {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function SessionLine({ session }: { session: SessionPointer }) {
  return (
    <>
      <p className="mt-1 truncate text-lg font-bold text-white">{session.title}</p>
      <p className="truncate text-sm text-slate-400">
        {session.eventTitle}
        {session.room ? ` · ${session.room}` : ""}
        {session.speaker ? ` · ${session.speaker}` : ""}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {session.startsAt}
        {session.endsAt ? ` – ${session.endsAt}` : ""}
      </p>
    </>
  );
}

// Spotlight: what is happening right now across the organiser's events.
export function LiveNowCard({ stats }: { stats: OrganiserStats }) {
  const { liveNow, activeToday } = stats;
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-amber-500/15 via-transparent to-teal-500/15" />
      <div className="relative">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          Live now · {activeToday.length} event{activeToday.length === 1 ? "" : "s"} active today
        </p>

        {liveNow ? (
          <SessionLine session={liveNow} />
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            No session is on stage at this moment.
          </p>
        )}

        {liveNow && (
          <Link
            href={`/events/${liveNow.eventId}`}
            className="mt-3 inline-block text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Open event page →
          </Link>
        )}
      </div>
    </section>
  );
}

// What's coming next on any of the organiser's agendas.
export function NextUpCard({ next }: { next: SessionPointer | null }) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
        ⏭ Next up
      </p>
      {next ? (
        <SessionLine session={next} />
      ) : (
        <p className="mt-2 text-sm text-slate-400">
          Nothing scheduled ahead — add sessions in the console.
        </p>
      )}
    </section>
  );
}

// Aggregate registrations vs capacity across all events.
export function RegistrationCard({ stats }: { stats: OrganiserStats }) {
  const { registrations, totalCapacity, registrationPercent } = stats;
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        🎟 Registrations
      </p>
      <p className="mt-1 text-2xl font-bold text-white">
        {registrationPercent}%
        <span className="ml-2 text-sm font-normal text-slate-500">
          {registrations} of {totalCapacity || "—"} seats
        </span>
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-teal-400"
          style={{ width: `${Math.max(registrationPercent, 2)}%` }}
        />
      </div>
    </section>
  );
}
