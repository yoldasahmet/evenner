"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { approveEvenn } from "@/app/(app)/events/[id]/plan/actions";
import type { DraftSession } from "@/lib/evenn/types";
import type { AgendaSession } from "@/lib/event-view";
import { toMinutes } from "@/lib/evenn/time";
import AddSessions from "./AddSessions";
import ReplaceDialog from "./ReplaceDialog";

// Review step: the generated agenda as an animated, editable timeline. The
// attendee can drop, reorder or add sessions before approving their evenn.
export default function PlanEditor({
  eventRef,
  preferences,
  draft,
  sessions,
  onBack,
}: {
  eventRef: string;
  preferences: Record<string, string>;
  draft: DraftSession[];
  sessions: AgendaSession[];
  onBack?: () => void;
}) {
  const [items, setItems] = useState(draft);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [replacingPos, setReplacingPos] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dayOrder = useMemo(() => {
    const m = new Map<string, number>();
    sessions.forEach((s, i) => {
      if (!m.has(s.day)) m.set(s.day, i);
    });
    return m;
  }, [sessions]);

  const available = useMemo(
    () =>
      sessions
        .map((session, index) => ({ session, index }))
        .filter(({ index }) => !items.some((it) => it.index === index)),
    [sessions, items]
  );

  const rank = (s: { day: string; startsAt: string }) =>
    (dayOrder.get(s.day) ?? 999) * 10000 + (toMinutes(s.startsAt) ?? 0);

  function add(index: number) {
    const item = toDraft(index, "Hand-picked by you");
    setItems((prev) => {
      const at = prev.findIndex((p) => rank(p) > rank(item));
      const next = [...prev];
      next.splice(at === -1 ? next.length : at, 0, item);
      return next;
    });
    setJustAdded(index);
  }

  const toDraft = (index: number, reason: string): DraftSession => {
    const s = sessions[index];
    return {
      index,
      day: s.day,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      title: s.title,
      speaker: s.speaker,
      room: s.room,
      track: s.track,
      type: s.type,
      reason,
    };
  };

  // Parallel-track sessions sharing the slot of the item being replaced.
  const replacing = replacingPos !== null ? items[replacingPos] : null;
  const slotAlternatives = replacing
    ? sessions
        .map((session, index) => ({ session, index }))
        .filter(
          ({ session: s, index }) =>
            index !== replacing.index &&
            s.day === replacing.day &&
            s.startsAt === replacing.startsAt &&
            !items.some((it) => it.index === index)
        )
    : [];

  function replaceWith(index: number) {
    setItems((prev) =>
      prev.map((it, pos) =>
        pos === replacingPos ? toDraft(index, "Swapped in by you") : it
      )
    );
    setJustAdded(index);
    setReplacingPos(null);
  }

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await approveEvenn({ eventRef, preferences, sessions: items });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="animate-fade-up space-y-5">
      <ol>
        {items.map((s, i) => {
          const micro = s.type === "micro";
          return (
            <Fragment key={s.index}>
              {(i === 0 || items[i - 1].day !== s.day) && (
                <li className="animate-fade-in mb-3 mt-5 first:mt-0">
                  <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                    {s.day}
                  </span>
                </li>
              )}
              <li
                className={`${
                  justAdded === s.index
                    ? "animate-pop"
                    : `animate-fade-up delay-${(i % 6) + 1}`
                } relative flex gap-3 pb-3`}
              >
                {i < items.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[5px] top-5 h-full w-px bg-brand-100"
                  />
                )}
                <span
                  aria-hidden
                  className={`relative mt-2.5 h-[11px] w-[11px] shrink-0 rounded-full ring-2 transition ${
                    micro
                      ? "bg-amber-400 ring-amber-200"
                      : "bg-brand-600 ring-brand-100"
                  }`}
                />
                <div
                  className={`group flex min-w-0 flex-1 items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    micro
                      ? "border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-white"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tabular-nums text-gray-400">
                      {s.startsAt}–{s.endsAt}
                      {s.room ? ` · ${s.room}` : ""}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-gray-900">
                      {micro ? "🤝 " : ""}
                      {s.title}
                    </h3>
                    {s.speaker && (
                      <p className="text-sm text-gray-500">{s.speaker}</p>
                    )}
                    <p
                      className={`mt-1.5 rounded-lg px-2.5 py-1.5 text-sm ${
                        micro
                          ? "bg-amber-100/60 text-amber-800"
                          : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      ✨ {s.reason}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 opacity-60 transition group-hover:opacity-100">
                    {!micro && (
                      <IconBtn label="Replace with a parallel session" onClick={() => setReplacingPos(i)}>⇄</IconBtn>
                    )}
                    <IconBtn label="Remove" onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}>✕</IconBtn>
                  </div>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Everything removed — add at least one session to approve.
        </p>
      )}

      <AddSessions available={available} onAdd={add} />

      {replacing && (
        <ReplaceDialog
          item={replacing}
          alternatives={slotAlternatives}
          onChoose={replaceWith}
          onClose={() => setReplacingPos(null)}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          themeColor="primary"
          onClick={approve}
          disabled={pending || items.length === 0}
          className={pending ? "animate-pulse" : ""}
        >
          {pending ? "Saving…" : `Approve my evenn (${items.length} stops)`}
        </Button>
        {onBack && (
          <Button fillMode="flat" onClick={onBack} disabled={pending}>
            ← Tweak preferences
          </Button>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500 transition hover:scale-110 hover:bg-gray-50 active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
