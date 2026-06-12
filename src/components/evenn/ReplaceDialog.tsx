"use client";

import { Dialog } from "@progress/kendo-react-dialogs";
import type { DraftSession } from "@/lib/evenn/types";
import type { AgendaSession } from "@/lib/event-view";

// Modal listing the sessions that run in the same slot (same day & start
// time) as the selected agenda item, so the attendee can swap tracks.
export default function ReplaceDialog({
  item,
  alternatives,
  onChoose,
  onClose,
}: {
  item: DraftSession;
  alternatives: { index: number; session: AgendaSession }[];
  onChoose: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <Dialog title={`Same slot · ${item.startsAt}`} onClose={onClose} width={420}>
      <p className="mb-3 text-sm text-gray-500">
        Swap <span className="font-medium text-gray-800">{item.title}</span>{" "}
        for another session starting at {item.startsAt}:
      </p>

      {alternatives.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          Nothing else runs at {item.startsAt} on this day.
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {alternatives.map(({ index, session }, i) => (
            <li
              key={index}
              className={`animate-fade-up delay-${(i % 6) + 1} flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-brand-500/50 hover:shadow-sm`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">
                  {session.startsAt}–{session.endsAt}
                  {session.track ? ` · ${session.track}` : ""}
                  {session.room ? ` · ${session.room}` : ""}
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
                onClick={() => onChoose(index)}
                className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:scale-105 hover:bg-brand-700 active:scale-95"
              >
                Swap in
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
