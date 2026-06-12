"use client";

import { useState, useTransition } from "react";
import { deleteEvenn } from "@/app/(app)/attendee/actions";

// Two-tap delete: first tap arms it, second confirms. Arms back off on blur.
export default function DeleteEvennButton({ evennId }: { evennId: string }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!armed) return setArmed(true);
    setError(null);
    startTransition(async () => {
      const res = await deleteEvenn(evennId);
      if (!res.ok) {
        setError(res.error ?? "Could not delete");
        setArmed(false);
      }
    });
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={armed ? "Confirm delete" : "Delete evenn"}
        title={armed ? "Confirm delete" : "Delete evenn"}
        onClick={onClick}
        onBlur={() => setArmed(false)}
        disabled={pending}
        className={`flex h-7 items-center justify-center rounded-lg border px-2 text-xs transition-all duration-200 active:scale-95 disabled:opacity-50 ${
          armed
            ? "animate-pop border-red-300 bg-red-50 font-semibold text-red-600"
            : "w-7 border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        {pending ? "…" : armed ? "Delete?" : "🗑"}
      </button>
      {error && (
        <span className="absolute -bottom-5 right-0 whitespace-nowrap text-[11px] text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
