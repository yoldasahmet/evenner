"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { joinSession, skipSession } from "@/app/(app)/evenn/[id]/actions";
import type { EvennSessionRow } from "@/lib/live/types";
import SpeechRecorder from "./SpeechRecorder";
import FeedbackDialog from "./FeedbackDialog";

// The "happening now" card: join → record the talk → end → rate & review.
// Parent should key this by session id so recorder state resets per session.
export default function LiveSessionCard({ session }: { session: EvennSessionRow }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef("");
  const recording = session.status === "joined";

  const run = async (action: (id: string) => Promise<{ ok: boolean; error?: string }>) => {
    setPending(true);
    setError(null);
    const res = await action(session.id);
    setPending(false);
    if (!res.ok) setError(res.error ?? "Something went wrong");
    else router.refresh();
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
        {recording ? "You're in this session" : "Happening now"}
      </p>
      <h2 className="mt-1 text-lg font-bold text-gray-900">{session.title}</h2>
      <p className="mt-1 text-sm text-gray-600">
        {[session.starts_at && `${session.starts_at}–${session.ends_at ?? "?"}`,
          session.speaker, session.room, session.track]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {session.reason && (
        <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
          <span className="font-semibold">Why it&apos;s on your evenn: </span>
          {session.reason}
        </p>
      )}

      {!recording && (
        <div className="mt-4 flex gap-2">
          <Button
            themeColor="primary"
            disabled={pending}
            onClick={() => run(joinSession)}
          >
            {pending ? "Joining…" : "Join session"}
          </Button>
          <Button disabled={pending} onClick={() => run(skipSession)}>
            Skip
          </Button>
        </div>
      )}

      {recording && (
        <>
          <SpeechRecorder
            recording={recording && !showFeedback}
            onTranscript={(t) => (transcriptRef.current = t)}
          />
          <div className="mt-4">
            <Button themeColor="primary" onClick={() => setShowFeedback(true)}>
              End session
            </Button>
          </div>
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {showFeedback && (
        <FeedbackDialog
          sessionId={session.id}
          sessionTitle={session.title}
          transcript={transcriptRef.current}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}
