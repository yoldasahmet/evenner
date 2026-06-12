"use client";

import { useState } from "react";
import type { AgendaSession } from "@/lib/event-view";

// Collapsible picker for event sessions that aren't in the agenda yet.
export default function AddSessions({
  available,
  onAdd,
}: {
  available: { index: number; session: AgendaSession }[];
  onAdd: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  if (available.length === 0) return null;

  return (
    <section className="rounded-2xl border border-dashed border-brand-500/40 bg-brand-50/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold text-brand-700"
      >
        <span>➕ Add a session ({available.length} more available)</span>
        <span
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {available.map(({ index, session }, i) => (
            <li
              key={index}
              className={`animate-fade-up delay-${(i % 6) + 1} flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-brand-500/50 hover:shadow-sm`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">
                  {session.day} · {session.startsAt}–{session.endsAt}
                </p>
                <p className="truncate text-sm font-medium text-gray-800">
                  {session.title}
                </p>
                {session.speaker && (
                  <p className="truncate text-xs text-gray-500">
                    {session.speaker}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={`Add ${session.title}`}
                onClick={() => onAdd(index)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:scale-110 hover:bg-brand-700 active:scale-95"
              >
                +
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
