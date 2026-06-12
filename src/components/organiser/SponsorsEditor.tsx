"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { addSponsor } from "@/app/(app)/organiser/actions";
import type { EventWithRelations } from "@/app/(app)/organiser/page";

export default function SponsorsEditor({
  event,
}: {
  event: EventWithRelations;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    formData.set("event_id", event.id);
    startTransition(async () => {
      const res = await addSponsor(formData);
      if (!res.ok) return setError(res.error ?? "Failed to add sponsor");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="space-y-2">
        {event.sponsors.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <span className="font-medium text-gray-900">{s.name}</span>
            {s.tier && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                {s.tier}
              </span>
            )}
          </li>
        ))}
        {event.sponsors.length === 0 && (
          <p className="text-sm text-gray-500">No sponsors yet.</p>
        )}
      </ul>

      <form action={action} className="flex flex-col gap-3">
        <Input name="name" placeholder="Sponsor name *" required />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input name="tier" placeholder="Tier (e.g. Gold)" className="flex-1" />
          <Input
            name="website_url"
            placeholder="https://sponsor.com"
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button themeColor="primary" type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add sponsor"}
          </Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
