import {
  groupByDay,
  SESSION_LABEL,
  type AgendaSession,
} from "@/lib/event-view";

const TYPE_STYLES: Record<string, string> = {
  keynote: "bg-brand-100 text-brand-700",
  workshop: "bg-amber-100 text-amber-700",
  panel: "bg-emerald-100 text-emerald-700",
  session: "bg-gray-100 text-gray-600",
};

function SessionRow({ s }: { s: AgendaSession }) {
  return (
    <li className="flex gap-3 py-3">
      <div className="w-16 shrink-0 text-xs font-medium text-gray-500">
        {s.startsAt}
        {s.endsAt && <div className="text-gray-300">{s.endsAt}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              TYPE_STYLES[s.type] ?? TYPE_STYLES.session
            }`}
          >
            {SESSION_LABEL[s.type]}
          </span>
          {s.track && (
            <span className="text-[11px] text-gray-400">{s.track}</span>
          )}
          {s.room && (
            <span className="text-[11px] text-gray-400">· {s.room}</span>
          )}
          {s.hasPrize && (
            <span className="text-[13px]">🏆</span>
          )}
        </div>
        <p className="mt-1 font-medium text-gray-900">{s.title}</p>
        {s.description && (
          <p className="mt-0.5 text-sm text-gray-500">{s.description}</p>
        )}
        {s.speaker && (
          <p className="mt-1 text-xs text-gray-500">
            {s.speaker}
            {s.speakerTitle && (
              <span className="text-gray-400"> — {s.speakerTitle}</span>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

// Renders the full agenda grouped by day.
export default function AgendaList({ sessions }: { sessions: AgendaSession[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-gray-500">Agenda coming soon.</p>;
  }

  return (
    <div className="space-y-6">
      {groupByDay(sessions).map(({ day, items }) => (
        <div key={day}>
          <h3 className="mb-1 text-sm font-semibold text-gray-900">{day}</h3>
          <ul className="divide-y divide-gray-100">
            {items.map((s, i) => (
              <SessionRow key={`${s.title}-${i}`} s={s} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
