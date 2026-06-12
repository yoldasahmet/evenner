"use client";

import { useState, useTransition } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { TextArea } from "@progress/kendo-react-inputs";
import type { AgentQuestion } from "@/lib/onboarding-questions";
import { saveOnboarding, skipToProfile } from "@/app/onboarding/actions";
import ChoiceField from "./ChoiceField";

/**
 * Single-question-at-a-time interview. Collects answers in state and submits
 * them all at the end. Users can skip a question, or bail to their profile and
 * finish later — every answer captured so far is still saved.
 */
export default function OnboardingWizard({
  questions,
  initialAnswers = {},
}: {
  questions: AgentQuestion[];
  initialAnswers?: Record<string, string>;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [pending, startTransition] = useTransition();

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        The interview questions aren&apos;t available yet — apply migration
        0007 to the database and refresh.
      </div>
    );
  }

  const q = questions[step];
  const total = questions.length;
  const isLast = step === total - 1;
  const value = answers[q.key] ?? "";
  const progress = Math.round(((step + 1) / total) * 100);

  function set(val: string) {
    setAnswers((a) => ({ ...a, [q.key]: val }));
  }

  function advance() {
    if (isLast) startTransition(() => saveOnboarding(answers));
    else setStep((s) => s + 1);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-brand-100/40">
      {/* progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-gray-400">
          {step + 1}/{total}
        </span>
      </div>

      {/* question — keyed so it re-animates each step */}
      <div key={q.key} className="animate-fade-up">
        <h2 className="flex items-start gap-2 text-lg font-semibold text-gray-900">
          {q.icon && <span className="text-xl leading-none">{q.icon}</span>}
          <span>{q.prompt}</span>
        </h2>
        {q.hint && <p className="mt-1 text-sm text-gray-400">{q.hint}</p>}

        <div className="mt-4">
          {q.choices ? (
            <ChoiceField
              choices={q.choices}
              multi={q.multi}
              value={value}
              onChange={set}
            />
          ) : (
            <TextArea
              rows={3}
              placeholder={q.placeholder}
              value={value}
              onChange={(e) => set(String(e.value))}
            />
          )}
        </div>
      </div>

      {/* navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          fillMode="flat"
          disabled={step === 0 || pending}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button fillMode="flat" disabled={pending} onClick={advance}>
            Skip
          </Button>
          <Button
            themeColor="primary"
            disabled={pending || !value.trim()}
            onClick={advance}
          >
            {pending ? "Saving…" : isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>

      {/* finish later */}
      <div className="mt-4 border-t border-gray-100 pt-4 text-center">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => skipToProfile(answers))}
          className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline disabled:opacity-50"
        >
          Skip for now — take me to My Profile →
        </button>
      </div>
    </div>
  );
}
