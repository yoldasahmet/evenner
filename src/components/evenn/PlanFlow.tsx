"use client";

import { useState, useTransition } from "react";
import { generateDraft } from "@/app/(app)/events/[id]/plan/actions";
import type { DraftSession } from "@/lib/evenn/types";
import type { AgendaSession } from "@/lib/event-view";
import PreferencesForm from "./PreferencesForm";
import PlanEditor from "./PlanEditor";

// Two-step client flow: preferences → AI-generated draft → review & approve.
export default function PlanFlow({
  eventRef,
  sessions,
}: {
  eventRef: string;
  sessions: AgendaSession[];
}) {
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<DraftSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate(prefs: Record<string, string>) {
    setError(null);
    setPreferences(prefs);
    startTransition(async () => {
      const res = await generateDraft(eventRef, prefs);
      if (res.ok) setDraft(res.draft);
      else setError(res.error);
    });
  }

  if (draft) {
    return (
      <PlanEditor
        eventRef={eventRef}
        preferences={preferences}
        draft={draft}
        sessions={sessions}
        onBack={() => setDraft(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <PreferencesForm pending={pending} onGenerate={generate} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
