"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea, Checkbox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { createEvent } from "@/app/(app)/organiser/actions";

const FORMATS = [
  { text: "In person", value: "in_person" },
  { text: "Virtual", value: "virtual" },
  { text: "Hybrid", value: "hybrid" },
];

export default function EventForm({
  onCreated,
}: {
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [format, setFormat] = useState(FORMATS[0]);
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    formData.set("format", format.value);
    startTransition(async () => {
      const res = await createEvent(formData);
      if (!res.ok) return setError(res.error ?? "Something went wrong");
      if (res.id) onCreated?.(res.id);
      router.refresh();
    });
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <Input name="title" placeholder="Event title *" required />
      <Input name="tagline" placeholder="Short tagline" />
      <TextArea name="description" placeholder="Description" rows={3} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input name="category" placeholder="Category (e.g. Conference)" className="flex-1" />
        <DropDownList
          data={FORMATS}
          textField="text"
          dataItemKey="value"
          value={format}
          onChange={(e) => setFormat(e.value)}
          className="sm:w-44"
        />
      </div>

      <Input name="location" placeholder="Location" />
      <Input name="website_url" placeholder="https://event-site.com" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-xs text-gray-500">
          Starts
          <Input name="starts_at" type="datetime-local" aria-label="Start" />
        </label>
        <label className="flex-1 text-xs text-gray-500">
          Ends
          <Input name="ends_at" type="datetime-local" aria-label="End" />
        </label>
        <label className="text-xs text-gray-500">
          Capacity
          <Input name="capacity" type="number" className="max-w-[8rem]" />
        </label>
      </div>

      <Checkbox name="is_published" label="Publish immediately" />

      <div className="flex items-center gap-3">
        <Button themeColor="primary" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create event"}
        </Button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
