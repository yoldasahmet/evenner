"use client";

import { useEffect, useRef, useState } from "react";
import { TextArea } from "@progress/kendo-react-inputs";

// Minimal surface of the Web Speech API (not in TS's DOM lib).
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return (SR as new () => SpeechRecognitionLike) ?? null;
}

// Captures the speaker's talk via speech-to-text while `recording` is true,
// reporting the accumulated final transcript to the parent on every update.
export default function SpeechRecorder({
  recording,
  onTranscript,
}: {
  recording: boolean;
  onTranscript: (transcript: string) => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const finalRef = useRef("");
  const recordingRef = useRef(recording);
  recordingRef.current = recording;

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!recording || !Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalRef.current = `${finalRef.current} ${result[0].transcript}`.trim();
        } else {
          interimText += result[0].transcript;
        }
      }
      setFinalText(finalRef.current);
      setInterim(interimText);
      onTranscript(finalRef.current);
    };
    // Chrome stops recognition after a stretch of silence — restart while
    // the session is still being recorded.
    recognition.onend = () => {
      if (recordingRef.current) {
        try {
          recognition.start();
        } catch {
          /* already restarted */
        }
      }
    };
    recognition.start();

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, supported]);

  if (supported === null) return null;

  if (!supported) {
    return (
      <div className="mt-4">
        <p className="mb-2 text-sm text-amber-700">
          Browser doesn&apos;t support speech recognition — type notes instead.
        </p>
        <TextArea
          rows={5}
          placeholder="Your notes on this talk…"
          onChange={(e) => onTranscript(String(e.value ?? ""))}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-red-600">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        Recording the talk…
      </div>
      <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
        {finalText}
        {interim && <span className="text-gray-400"> {interim}</span>}
        {!finalText && !interim && (
          <span className="text-gray-400">Listening — speak near the mic.</span>
        )}
      </p>
    </div>
  );
}
