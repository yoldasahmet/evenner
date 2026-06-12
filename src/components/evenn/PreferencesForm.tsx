"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";

const GOALS = [
  "Learn new skills",
  "Meet people & network",
  "Find inspiration",
  "Evaluate tools & vendors",
];
const PACES = ["Full schedule", "Just the highlights"];
const STYLES = ["Balanced mix", "Hands-on workshops", "Talks & keynotes"];

// Quick per-event questions that steer the AI agenda generation.
export default function PreferencesForm({
  pending,
  onGenerate,
}: {
  pending: boolean;
  onGenerate: (preferences: Record<string, string>) => void;
}) {
  const [goal, setGoal] = useState(GOALS[0]);
  const [pace, setPace] = useState(PACES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [topics, setTopics] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({ goal, pace, style, topics: topics.trim() });
  }

  return (
    <form
      onSubmit={submit}
      className="animate-fade-up flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <Field label="What's your main goal for this event?">
        <DropDownList data={GOALS} value={goal} onChange={(e) => setGoal(e.value)} />
      </Field>
      <Field label="How packed should your day be?">
        <DropDownList data={PACES} value={pace} onChange={(e) => setPace(e.value)} />
      </Field>
      <Field label="What kind of sessions do you enjoy?">
        <DropDownList data={STYLES} value={style} onChange={(e) => setStyle(e.value)} />
      </Field>
      <Field label="Any topics to prioritise?">
        <Input
          value={topics}
          onChange={(e) => setTopics(String(e.value ?? ""))}
          placeholder="e.g. AI agents, design systems…"
        />
      </Field>

      <Button themeColor="primary" type="submit" disabled={pending}>
        {pending ? "Crafting your agenda…" : "Generate my agenda"}
      </Button>
      {pending && (
        <p className="animate-fade-in text-center text-sm text-gray-500">
          Our agent is reading the agenda and matching it to your profile —
          this can take up to 30 seconds.
        </p>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      {children}
    </label>
  );
}
