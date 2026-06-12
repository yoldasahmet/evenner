"use client";

import { useRef, useState } from "react";
import {
  groupByDay,
  SESSION_LABEL,
  type AgendaSession,
} from "@/lib/event-view";
import SessionDetail from "./SessionDetail";

const DOT: Record<string, string> = {
  keynote: "bg-brand-600",
  workshop: "bg-amber-500",
  panel: "bg-emerald-500",
  session: "bg-gray-300",
};

function Item({
  s,
  active,
  onClick,
}: {
  s: AgendaSession;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-brand-300 bg-brand-50 shadow-sm"
          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      <span className="w-14 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-gray-500">
        {s.startsAt}
      </span>
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[s.type] ?? DOT.session}`} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">
          {s.title}
        </span>
        <span className="mt-0.5 block text-xs text-gray-400">
          {SESSION_LABEL[s.type]}
          {s.track ? ` · ${s.track}` : ""}
          {s.hasPrize ? " · 🏆" : ""}
        </span>
      </span>
    </button>
  );
}

// Two-column agenda: a selectable list on the left, full session details on
// the right. On mobile the columns stack and the detail scrolls into view.
export default function AgendaExplorer({
  sessions,
}: {
  sessions: AgendaSession[];
}) {
  const [selected, setSelected] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);

  if (sessions.length === 0) {
    return <p className="text-sm text-gray-500">Agenda coming soon.</p>;
  }

  function pick(i: number) {
    setSelected(i);
    if (window.matchMedia("(max-width: 767px)").matches) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const days = groupByDay(sessions);
  let runningIndex = -1;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {/* Column 1 — list */}
      <div className="space-y-5">
        {days.map(({ day, items }) => (
          <div key={day}>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">{day}</h3>
            <div className="space-y-1">
              {items.map((s) => {
                runningIndex += 1;
                const idx = runningIndex;
                return (
                  <Item
                    key={`${s.title}-${idx}`}
                    s={s}
                    active={idx === selected}
                    onClick={() => pick(idx)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Column 2 — detail. Sticky + self-start so it stays pinned in view
          while the (often long) list on the left scrolls past it. */}
      <div
        ref={detailRef}
        className="md:sticky md:top-16 md:self-start md:max-h-[calc(100dvh-5rem)] md:overflow-y-auto"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SessionDetail s={sessions[selected]} />
        </div>
      </div>
    </div>
  );
}
