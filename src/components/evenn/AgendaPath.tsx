import type { EvennSession, EvennSessionStatus } from "@/lib/evenn/types";

// Vertical agenda path: one node per session, connected by a line, with a
// staggered entrance animation. Node colour reflects the session status.

const DOT: Record<EvennSessionStatus, string> = {
  upcoming: "bg-gray-300 ring-gray-200",
  joined: "bg-brand-600 ring-brand-100",
  completed: "bg-green-500 ring-green-200",
  skipped: "bg-gray-200 ring-gray-100",
};

const TITLE: Record<EvennSessionStatus, string> = {
  upcoming: "text-gray-700",
  joined: "text-brand-700",
  completed: "text-green-700",
  skipped: "text-gray-400 line-through",
};

export default function AgendaPath({
  sessions,
  limit = 6,
}: {
  sessions: EvennSession[];
  limit?: number;
}) {
  const shown = sessions.slice(0, limit);
  const hidden = sessions.length - shown.length;

  return (
    <ol aria-label="Agenda path">
      {shown.map((s, i) => (
        <li
          key={s.id}
          className={`animate-fade-up delay-${(i % 6) + 1} relative flex gap-3 pb-4 last:pb-0`}
        >
          {i < shown.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[5px] top-4 h-full w-px bg-gray-200"
            />
          )}
          <span
            aria-hidden
            className={`animate-pop delay-${(i % 6) + 1} relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-2 ${DOT[s.status]}`}
          />
          <div className="min-w-0">
            <p className="text-xs tabular-nums text-gray-400">
              {s.starts_at}
              {s.ends_at ? `–${s.ends_at}` : ""}
            </p>
            <p className={`truncate text-sm font-medium ${TITLE[s.status]}`}>
              {s.type === "micro" ? "🤝 " : ""}
              {s.title}
            </p>
          </div>
        </li>
      ))}
      {hidden > 0 && (
        <li className="animate-fade-in pl-6 text-xs text-gray-400">
          +{hidden} more session{hidden > 1 ? "s" : ""}
        </li>
      )}
    </ol>
  );
}
