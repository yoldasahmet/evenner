import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import type {
  AgentQuestion,
  QuestionCategory,
} from "@/lib/onboarding-questions";

const CATEGORIES = [
  { id: "identity" as QuestionCategory, label: "Identity", emoji: "👤" },
  { id: "tech" as QuestionCategory, label: "Tech Profile", emoji: "💻" },
  { id: "events" as QuestionCategory, label: "Events & Community", emoji: "🌐" },
] as const;

// The full editable list of onboarding answers, grouped by category.
export default function AnswersSection({
  questions,
  answers,
  completeness,
}: {
  questions: AgentQuestion[];
  answers: Record<string, string>;
  completeness: number;
}) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm animate-fade-up delay-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">All answers</h2>
        <Link href="/onboarding">
          <Button size="small" fillMode="outline" themeColor="primary">
            {completeness === 100 ? "Edit" : "Continue setup"}
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map(({ id, label, emoji }) => {
          const qs = questions.filter((q) => q.category === id);
          return (
            <div key={id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {emoji} {label}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {qs.map((q) => {
                  const val = answers[q.key];
                  return (
                    <div
                      key={q.key}
                      className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                    >
                      <span className="mt-0.5 shrink-0 text-sm leading-none">
                        {q.icon ?? "•"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400">{q.prompt}</p>
                        <p className="truncate text-xs font-medium text-gray-900">
                          {val ?? (
                            <span className="font-normal italic text-gray-400">
                              Not answered
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
