// Explains the post-session quiz prize mechanic. Rendered only when the event
// has at least one prize session (🏆 in the agenda).

const STEPS = [
  {
    icon: "🎤",
    title: "Attend a 🏆 session",
    body: "Sessions marked with a trophy in the agenda are prize-eligible. Show up and pay attention.",
  },
  {
    icon: "🧠",
    title: "Take the quiz",
    body: "Right after the session ends, a short timed quiz unlocks in the app. Answer while it's fresh.",
  },
  {
    icon: "📊",
    title: "Climb the leaderboard",
    body: "Points are awarded for correct answers and speed. Live standings update after each question.",
  },
  {
    icon: "🏆",
    title: "Win the prize",
    body: "The highest scorer for that session takes the prize. Ties are broken by who finished fastest.",
  },
];

export default function PrizeSection() {
  return (
    <section className="animate-fade-up">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">
        How prize sessions work
      </h2>
      <p className="mb-4 text-sm text-gray-500">
        Some sessions reward the sharpest minds in the room. Here&apos;s the play.
      </p>

      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className={`animate-fade-up delay-${i + 1} relative rounded-2xl border border-amber-100/80 bg-white p-4 shadow-sm`}
            >
              <span className="absolute right-3 top-3 text-xs font-bold text-amber-300">
                {i + 1}
              </span>
              <div className="text-2xl">{s.icon}</div>
              <p className="mt-2 text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Prizes vary by session — think swag, credits and the occasional headline gadget. 🎁
        </p>
      </div>
    </section>
  );
}
