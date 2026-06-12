import { SESSION_LABEL, type AgendaSession } from "@/lib/event-view";

const TYPE_STYLES: Record<string, string> = {
  keynote: "bg-brand-100 text-brand-700",
  workshop: "bg-amber-100 text-amber-700",
  panel: "bg-emerald-100 text-emerald-700",
  session: "bg-gray-100 text-gray-600",
};

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base leading-5">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// The right-hand panel of the agenda explorer: everything about one session.
export default function SessionDetail({ s }: { s: AgendaSession }) {
  return (
    <div key={s.title} className="animate-fade-up">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            TYPE_STYLES[s.type] ?? TYPE_STYLES.session
          }`}
        >
          {SESSION_LABEL[s.type]}
        </span>
        {s.hasPrize && (
          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
            🏆 Prize session
          </span>
        )}
      </div>

      <h3 className="mt-3 text-xl font-bold leading-snug text-gray-900">
        {s.title}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Fact icon="🗓️" label="Day" value={s.day.replace(/^Day \d+ · /, "")} />
        <Fact
          icon="⏰"
          label="Time"
          value={s.endsAt ? `${s.startsAt} – ${s.endsAt}` : s.startsAt}
        />
        {s.track && <Fact icon="🧭" label="Track" value={s.track} />}
        {s.room && <Fact icon="📍" label="Room" value={s.room} />}
      </div>

      {s.speaker && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50/70 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-200 font-bold text-brand-700">
            {s.speaker.replace(/^Moderated by /, "").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {s.speaker}
            </p>
            {s.speakerTitle && (
              <p className="truncate text-xs text-gray-500">{s.speakerTitle}</p>
            )}
          </div>
        </div>
      )}

      {s.description && (
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {s.description}
        </p>
      )}
    </div>
  );
}
