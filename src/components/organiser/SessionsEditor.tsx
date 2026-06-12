"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { addSession } from "@/app/(app)/organiser/actions";
import type { EventWithRelations } from "@/app/(app)/organiser/page";

const TYPES = ["keynote", "session", "workshop", "panel"];

// Build an event's agenda: keynotes, sessions, workshops and panels.
export default function SessionsEditor({
  event,
}: {
  event: EventWithRelations;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState("session");
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    formData.set("event_id", event.id);
    formData.set("type", type);
    formData.set("position", String(event.sessions.length));
    startTransition(async () => {
      const res = await addSession(formData);
      if (!res.ok) return setError(res.error ?? "Failed to add session");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="space-y-2">
        {event.sessions
          .sort((a, b) => a.position - b.position)
          .map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-gray-900">{s.title}</span>
              <span className="ml-2 text-xs text-gray-400">
                {s.type}
                {s.day ? ` · ${s.day}` : ""}
              </span>
            </li>
          ))}
        {event.sessions.length === 0 && (
          <p className="text-sm text-gray-500">No agenda items yet.</p>
        )}
      </ul>

      <form action={action} className="flex flex-col gap-3">
        <Input name="title" placeholder="Session title *" required />
        <div className="flex flex-col gap-3 sm:flex-row">
          <DropDownList
            data={TYPES}
            value={type}
            onChange={(e) => setType(e.value)}
            className="sm:w-40"
          />
          <Input name="day" placeholder="Day (e.g. Day 1)" className="flex-1" />
          <Input name="track" placeholder="Track" className="flex-1" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input name="starts_at" placeholder="Start (e.g. 09:00)" className="flex-1" />
          <Input name="ends_at" placeholder="End (e.g. 10:00)" className="flex-1" />
          <Input name="room" placeholder="Room" className="flex-1" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input name="speaker" placeholder="Speaker" className="flex-1" />
          <Input
            name="speaker_title"
            placeholder="Speaker title"
            className="flex-1"
          />
        </div>
        <TextArea name="description" placeholder="Description" rows={2} />
        <div className="flex items-center gap-3">
          <Button themeColor="primary" type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add to agenda"}
          </Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
