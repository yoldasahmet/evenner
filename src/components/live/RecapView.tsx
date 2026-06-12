"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { generateRecommendations } from "@/app/(app)/evenn/[id]/actions";
import type {
  EvennSessionRow,
  Recommendation,
  SessionFeedback,
} from "@/lib/live/types";
import RecommendationList from "./RecommendationList";

// Post-event recap: per-session ratings plus AI follow-up recommendations.
export default function RecapView({
  evennId,
  eventTitle,
  sessions,
  feedback,
  recommendations,
}: {
  evennId: string;
  eventTitle: string;
  sessions: EvennSessionRow[];
  feedback: SessionFeedback[];
  recommendations: Recommendation[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bySession = new Map(feedback.map((f) => [f.evenn_session_id, f]));

  const generate = async () => {
    setPending(true);
    setError(null);
    const res = await generateRecommendations(evennId);
    setPending(false);
    if (!res.ok) setError(res.error ?? "Something went wrong");
    else router.refresh();
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Your {eventTitle} recap
        </h2>
        <ul className="space-y-2">
          {sessions.map((s) => {
            const fb = bySession.get(s.id);
            return (
              <li key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{s.title}</p>
                    {fb?.feedback && (
                      <p className="mt-1 text-sm text-gray-600">{fb.feedback}</p>
                    )}
                  </div>
                  {s.status === "skipped" ? (
                    <span className="text-xs text-gray-400">Skipped</span>
                  ) : (
                    <span className="text-sm text-amber-500" aria-label="rating">
                      {"★".repeat(fb?.rating ?? 0)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - (fb?.rating ?? 0))}
                      </span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">Keep learning</h2>
        {recommendations.length > 0 ? (
          <RecommendationList items={recommendations} />
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-600">
              Get articles, repos and videos matched to the talks you loved.
            </p>
            <Button themeColor="primary" disabled={pending} onClick={generate}>
              {pending ? "Searching the web — takes ~30s…" : "Get recommendations"}
            </Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </>
        )}
      </section>

      <Link href="/attendee" className="inline-block text-sm font-medium text-indigo-700 hover:underline">
        ← Back to your events
      </Link>
    </div>
  );
}
