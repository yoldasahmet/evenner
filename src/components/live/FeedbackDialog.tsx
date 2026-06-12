"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { Rating, TextArea } from "@progress/kendo-react-inputs";
import { endSession } from "@/app/(app)/evenn/[id]/actions";

// Rate + comment on a session you just attended; saving stores the captured
// transcript alongside and marks the session completed.
export default function FeedbackDialog({
  sessionId,
  sessionTitle,
  transcript,
  onClose,
}: {
  sessionId: string;
  sessionTitle: string;
  transcript: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    const res = await endSession(sessionId, transcript, rating, feedback);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong");
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <Dialog title={`How was “${sessionTitle}”?`} onClose={onClose} width={420}>
      <div className="space-y-4 py-2">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Your rating</p>
          <Rating value={rating} onChange={(e) => setRating(Number(e.value))} />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Feedback</p>
          <TextArea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(String(e.value ?? ""))}
            placeholder="What stood out? What could be better?"
            className="w-full"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <DialogActionsBar>
        <Button onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button themeColor="primary" onClick={submit} disabled={pending || rating < 1}>
          {pending ? "Saving…" : "Save & continue"}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
