import styles from "./landing.module.css";

const CARDS = [
  { icon: "📰", kind: "Article", title: "LLM-powered autonomous agents", host: "lilianweng.github.io" },
  { icon: "🐙", kind: "Repo", title: "langchain-ai/langchain", host: "github.com" },
  { icon: "▶️", kind: "Video", title: "Prompt caching, explained", host: "youtube.com" },
];

// How recommendations are made: feedback → AI → curated links.
export default function RecsSection() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-wider text-brand-700">
            After the event
          </p>
          <h2 className="animate-fade-up delay-1 mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The learning doesn&apos;t stop at the closing keynote.
          </h2>
          <p className="animate-fade-up delay-2 mt-4 text-gray-600">
            Leave an event and your ratings, reviews and talk transcripts
            become signals. An AI model — web search when available, model
            knowledge otherwise — turns them into up to ten hand-picked
            follow-ups: articles, GitHub repos and videos, each with a reason.
          </p>
        </div>

        {/* pipeline */}
        <div className="mt-12 flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-6">
          <div className="animate-fade-up delay-1 w-full max-w-xs rounded-3xl border border-gray-200 bg-white p-7 text-center shadow-md lg:w-80">
            <p className="text-4xl">🎙️</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">Your signals</p>
            <p className="mt-1.5 text-sm text-gray-500">
              ★ ratings · feedback · live transcripts
            </p>
          </div>

          <span className={`${styles.pulseArrow} rotate-90 text-2xl text-brand-500 lg:rotate-0`} aria-hidden>
            ➜
          </span>

          <div className="animate-fade-up delay-2 w-full max-w-xs rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-50 to-white p-7 text-center shadow-md lg:w-80">
            <p className="text-4xl">🤖</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">AI curation</p>
            <p className="mt-1.5 text-sm text-gray-500">
              matches themes of your highest-rated talks
            </p>
          </div>

          <span
            className={`${styles.pulseArrow} rotate-90 text-2xl text-brand-500 lg:rotate-0`}
            style={{ animationDelay: "0.4s" }}
            aria-hidden
          >
            ➜
          </span>

          <div className="flex w-full max-w-xs flex-col gap-3 lg:w-80">
            {CARDS.map((c, i) => (
              <div
                key={c.title}
                className="animate-float flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md"
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <span className="text-2xl" aria-hidden>{c.icon}</span>
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-400">
                    {c.kind} · {c.host}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
