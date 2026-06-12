import styles from "./landing.module.css";

const NODES = [
  { time: "09:00", title: "Opening Keynote: The agentic era", reason: "A headline keynote worth catching", micro: false },
  { time: "10:30", title: "Building production RAG", reason: "Matches your interest in AI agents", micro: false },
  { time: "11:45", title: "Micro-meetup: LLMs", reason: "Free hour — meet attendees like you", micro: true },
  { time: "13:00", title: "Codelab: Ship an AI agent", reason: "Hands-on, the format you prefer", micro: false },
  { time: "15:30", title: "Panel: AI-assisted development", reason: "Ends your day with the big picture", micro: false },
];

// "Create my evenn": a looping demo of the AI drafting a personalised path.
export default function AgendaSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center">
      <div className="animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
          Personalised agenda
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Thirty sessions. <span className="text-brand-700">Your</span> path
          through them.
        </h2>
        <p className="mt-4 text-gray-600">
          Answer four quick questions and our agent reads the full agenda
          against your profile — interests, experience, favourite formats —
          then drafts your <em>evenn</em>: an ordered day with a reason for
          every stop. Swap parallel tracks, add or drop sessions, approve.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-700">
          {[
            ["🎯", "Picks the best session in every time slot — no overlaps"],
            ["🤝", "Fills empty hours with micro-meetups of like-minded attendees"],
            ["⇄", "One tap to swap any stop for a parallel-track alternative"],
          ].map(([icon, text], i) => (
            <li key={text} className={`animate-fade-up delay-${i + 1} flex items-start gap-3`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
                {icon}
              </span>
              <span className="pt-1.5">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* looping draft animation */}
      <div className="animate-fade-up delay-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-brand-100/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`${styles.thinkdot} h-1.5 w-1.5 rounded-full bg-brand-600`}
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
          Crafting your agenda…
        </div>

        <ol className="relative mt-5">
          <span
            aria-hidden
            className={`${styles.vline} absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px bg-brand-100`}
          />
          {NODES.map((n, i) => (
            <li
              key={n.title}
              className={`${styles.node} relative flex gap-3 pb-4 last:pb-0`}
              style={{ animationDelay: `${0.6 + i * 1.5}s` }}
            >
              <span
                aria-hidden
                className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-2 ${
                  n.micro ? "bg-amber-400 ring-amber-200" : "bg-brand-600 ring-brand-100"
                }`}
              />
              <div className="min-w-0">
                <p className="text-xs tabular-nums text-gray-400">{n.time}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {n.micro ? "🤝 " : ""}
                  {n.title}
                </p>
                <p className="mt-0.5 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  ✨ {n.reason}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
