const FEATURES = [
  {
    icon: "🧠",
    title: "An agent that knows you",
    text: "A quick onboarding interview teaches your AI agent your stack, interests and goals — it gets smarter with every event.",
  },
  {
    icon: "🔴",
    title: "Live companion",
    text: "Join the session happening now, record the talk, and rate it on the way out. Your evenn keeps pace with the day.",
  },
  {
    icon: "🤝",
    title: "Micro-meetups",
    text: "Nothing relevant for an hour? We slot in a meetup with attendees who share your interests instead of dead time.",
  },
  {
    icon: "🏆",
    title: "Prize sessions",
    text: "Sessions with draws and giveaways are flagged on the agenda, so the fun stops never catch you by surprise.",
  },
  {
    icon: "📊",
    title: "Organiser dashboards",
    text: "Joins and feedback stream into a realtime dashboard, so organisers see what's landing while it's happening.",
  },
  {
    icon: "📚",
    title: "A recap worth keeping",
    text: "Ratings, transcripts and AI-curated follow-ups live on your profile — your personal library across every event.",
  },
];

// "And more": the rest of the product at a glance.
export default function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="animate-fade-up text-sm font-semibold uppercase tracking-wider text-brand-700">
          And more
        </p>
        <h2 className="animate-fade-up delay-1 mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Built for the whole event, end to end.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`animate-fade-up delay-${(i % 6) + 1} group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-lg`}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-xl ring-1 ring-brand-100 transition group-hover:scale-110">
              {f.icon}
            </span>
            <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
