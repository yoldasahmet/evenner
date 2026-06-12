import type { SessionFeedback } from "@/lib/live/types";

// Live feedback feed: star rating + comment per attendee submission.
export default function FeedbackList({ feedback }: { feedback: SessionFeedback[] }) {
  if (feedback.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Feedback shows up here as attendees finish sessions.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {feedback.map((f) => (
        <li key={f.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">{f.session_title}</p>
            {f.rating !== null && (
              <span className="shrink-0 text-sm text-amber-500" aria-label={`${f.rating} of 5`}>
                {"★".repeat(f.rating)}
                <span className="text-gray-300">{"★".repeat(5 - f.rating)}</span>
              </span>
            )}
          </div>
          {f.feedback && (
            <p className="mt-1 text-sm text-gray-600">{f.feedback}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
