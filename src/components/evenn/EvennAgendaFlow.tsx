import type { EvennSessionRow } from "@/lib/live/types";

// The evenn's full agenda as day-grouped, animated timeline sections.
// `highlightId` marks the next session to join with a pulsing accent.

const DOT: Record<string, string> = {
  upcoming: "bg-gray-300 ring-gray-200",
  joined: "bg-brand-600 ring-brand-100",
  completed: "bg-green-500 ring-green-200",
  skipped: "bg-gray-200 ring-gray-100",
};

const BADGE: Record<string, { label: string; cls: string }> = {
  joined: { label: "Joined", cls: "bg-brand-50 text-brand-700" },
  completed: { label: "Done ✓", cls: "bg-green-100 text-green-700" },
  skipped: { label: "Skipped", cls: "bg-gray-100 text-gray-500" },
};

function groupByDay(sessions: EvennSessionRow[]) {
  const days = new Map<string, EvennSessionRow[]>();
  for (const s of sessions) {
    const day = s.day ?? "Agenda";
    if (!days.has(day)) days.set(day, []);
    days.get(day)!.push(s);
  }
  return Array.from(days, ([day, items]) => ({ day, items }));
}

export default function EvennAgendaFlow({
  sessions,
  highlightId,
}: {
  sessions: EvennSessionRow[];
  highlightId: string | null;
}) {
  return (
    <div className="space-y-6">
      {groupByDay(sessions).map(({ day, items }, d) => (
        <section key={day} className="animate-fade-in">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
              {day}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-xs text-gray-400">
              {items.filter((s) => s.status === "completed").length}/{items.length} done
            </span>
          </div>

          <ol>
            {items.map((s, i) => {
              const next = s.id === highlightId;
              const skipped = s.status === "skipped";
              const badge = next ? null : BADGE[s.status];
              return (
                <li
                  key={s.id}
                  className={`animate-fade-up delay-${((d + i) % 6) + 1} relative flex gap-3 pb-3`}
                >
                  {i < items.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[5px] top-5 h-full w-px bg-gray-200"
                    />
                  )}
                  <span
                    aria-hidden
                    className={`animate-pop delay-${((d + i) % 6) + 1} relative mt-3 h-[11px] w-[11px] shrink-0 rounded-full ring-2 ${
                      next ? "animate-pulse bg-brand-600 ring-brand-100" : DOT[s.status]
                    }`}
                  />
                  <div
                    className={`min-w-0 flex-1 rounded-2xl border p-3.5 transition-all duration-300 ${
                      next
                        ? "border-brand-500 bg-gradient-to-r from-brand-50 to-white shadow-md ring-1 ring-brand-500/30"
                        : "border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                    } ${skipped ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs tabular-nums text-gray-400">
                        {s.starts_at}
                        {s.ends_at ? `–${s.ends_at}` : ""}
                        {s.room ? ` · ${s.room}` : ""}
                      </p>
                      {next ? (
                        <span className="animate-pulse rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          ▶ Up next
                        </span>
                      ) : (
                        badge && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )
                      )}
                    </div>
                    <h3
                      className={`mt-0.5 text-sm font-semibold ${
                        skipped ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {s.type === "micro" ? "🤝 " : ""}
                      {s.title}
                    </h3>
                    {s.speaker && (
                      <p className="text-xs text-gray-500">{s.speaker}</p>
                    )}
                    {next && s.reason && (
                      <p className="mt-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-xs text-brand-700">
                        ✨ {s.reason}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
