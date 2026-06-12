"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { leaveEvent } from "@/app/(app)/evenn/[id]/actions";

// Two-tap "leave event": completes the agenda (joined → completed,
// upcoming → skipped) and drops the user into the recap view.
export default function LeaveEventButton({ evennId }: { evennId: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!armed) return setArmed(true);
    setError(null);
    startTransition(async () => {
      const res = await leaveEvent(evennId);
      if (!res.ok) {
        setError(res.error ?? "Could not leave the event");
        setArmed(false);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        onBlur={() => setArmed(false)}
        disabled={pending}
        className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 ${
          armed
            ? "animate-pop border-red-300 bg-red-50 text-red-600"
            : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        }`}
      >
        {pending ? "Wrapping up…" : armed ? "Leave & finish? ✓" : "🚪 Leave event"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
