import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import styles from "./landing.module.css";

const BARS = [40, 70, 55, 90, 65, 100, 75, 50, 85, 60, 95, 45, 80, 65, 55, 90, 70, 48, 84, 62];

const CAPTIONS = [
  "…so the trick with agent architectures is to keep the tool surface small…",
  "…we cut inference cost 40% with prompt caching alone…",
  "…your evaluation set is your real product spec…",
];

const UP_NEXT = [
  { time: "15:30", title: "Micro-meetup: AI agents", reason: "Free slot — meet attendees like you", micro: true },
  { time: "16:30", title: "Agent architectures and frameworks", reason: "Matches your interest in AI agents", micro: false },
  { time: "17:30", title: "Closing Keynote: AI for everyone", reason: "Ends your day with the big picture", micro: false },
];

// Hero: headline + a looping "video" of the live speech-to-text companion.
export default function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-gray-950 text-white">
      {/* ambient aurora blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-700/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-28 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Your AI event companion
          </span>
          <h1 className="animate-fade-up delay-1 mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Every tech event,
            <span className="block bg-gradient-to-r from-brand-500 via-violet-400 to-brand-100 bg-clip-text text-transparent">
              made yours.
            </span>
          </h1>
          <p className="animate-fade-up delay-2 mt-5 max-w-md text-base text-gray-300 sm:text-lg">
            evenner turns any conference into a personalised journey — an AI
            agent plans your day, records the talks you join, and hands you a
            recap worth keeping.
          </p>
          <div className="animate-fade-up delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button themeColor="primary" size="large">
                Get started — it&apos;s free
              </Button>
            </Link>
            <Link href="/events-preview">
              <Button fillMode="outline" themeColor="light" size="large">
                Browse events
              </Button>
            </Link>
          </div>
        </div>

        {/* the "video": live session being recorded & transcribed */}
        <div className="animate-pop delay-2 relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="flex items-center gap-2 font-semibold text-red-400">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                REC · Agent architectures and frameworks
              </span>
              <span className="tabular-nums">16:31</span>
            </div>

            <div className="mt-4 flex h-20 items-center gap-1" aria-hidden>
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className={`${styles.bar} w-1.5 rounded-full bg-gradient-to-t from-brand-600 to-violet-300`}
                  style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.13}s` }}
                />
              ))}
            </div>

            <div className="mt-4 min-h-[5.5rem] space-y-2">
              {CAPTIONS.map((line, i) => (
                <p
                  key={line}
                  className={`${styles.caption} text-sm leading-relaxed text-gray-200`}
                  style={{ animationDelay: `${i * 2.4}s` }}
                >
                  {line}
                </p>
              ))}
            </div>

            <div
              className={`${styles.toast} mt-3 inline-flex items-center gap-2 rounded-full bg-green-400/15 px-3 py-1 text-xs font-medium text-green-300`}
            >
              ✓ Transcript saved to your recap · rated ★★★★★
            </div>

            {/* your evenn, keeping pace with the day */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Up next on your evenn
                </p>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] tabular-nums text-gray-300">
                  4/7 done
                </span>
              </div>
              {/* rotates through the next stops, one at a time */}
              <div className="relative mt-3 h-12">
                {UP_NEXT.map((s, i) => (
                  <div
                    key={s.title}
                    className={`${styles.upnext} absolute inset-x-0 top-0 flex items-start gap-3`}
                    style={{ animationDelay: `${i * 3}s` }}
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full ring-2 ${
                        s.micro
                          ? "bg-amber-400 ring-amber-400/30"
                          : "bg-brand-500 ring-brand-500/30"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {s.time} · {s.micro ? "🤝 " : ""}
                        {s.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-brand-100">
                        ✨ {s.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-300">
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-amber-200">
                  🤝 Micro-meetup · 11:45 · AI agents
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  ⇄ Swapped to the Applied AI track
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
