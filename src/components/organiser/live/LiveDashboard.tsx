"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SessionFeedback, SessionJoin } from "@/lib/live/types";
import JoinFeed from "./JoinFeed";
import FeedbackList from "./FeedbackList";

// Organiser realtime view: subscribes to INSERTs on session_joins and
// session_feedback for this event and folds them into the initial lists.
export default function LiveDashboard({
  eventRef,
  initialJoins,
  initialFeedback,
}: {
  eventRef: string;
  initialJoins: SessionJoin[];
  initialFeedback: SessionFeedback[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [joins, setJoins] = useState(initialJoins);
  const [feedback, setFeedback] = useState(initialFeedback);

  useEffect(() => {
    const channel = supabase
      .channel(`live-${eventRef}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_joins",
          filter: `event_ref=eq.${eventRef}`,
        },
        (payload) =>
          setJoins((prev) => [...prev, payload.new as SessionJoin])
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_feedback",
          filter: `event_ref=eq.${eventRef}`,
        },
        (payload) =>
          setFeedback((prev) => [payload.new as SessionFeedback, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, eventRef]);

  const attendeeCount = new Set(joins.map((j) => j.profile_id)).size;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <span
          key={attendeeCount}
          className="animate-[pulse_0.6s_ease-in-out_1] text-4xl font-extrabold text-indigo-700"
        >
          {attendeeCount}
        </span>
        <div>
          <p className="font-semibold text-indigo-900">Live attendees</p>
          <p className="text-sm text-indigo-700">
            {joins.length} session joins · updating in realtime
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Joins per session
        </h2>
        <JoinFeed joins={joins} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Feedback
        </h2>
        <FeedbackList feedback={feedback} />
      </section>
    </div>
  );
}
