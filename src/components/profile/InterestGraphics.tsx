import type { ProfileInsights } from "@/lib/profile-insights";

function Tile({
  icon,
  label,
  value,
  delay,
}: {
  icon: string;
  label: string;
  value?: string;
  delay: string;
}) {
  return (
    <div
      className={`animate-fade-up ${delay} rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-50/70 to-white p-4`}
    >
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">
        {value ?? <span className="font-normal text-gray-300">—</span>}
      </p>
    </div>
  );
}

function Chips({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={item}
            className={`animate-pop rounded-full px-3 py-1 text-sm font-medium ${tone}`}
            style={{ animationDelay: `${0.04 * i}s` }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// Visual summary of the user's tech profile, built from onboarding answers.
export default function InterestGraphics({
  insights,
}: {
  insights: ProfileInsights;
}) {
  const hasAny =
    insights.domain ||
    insights.experience ||
    insights.interests.length > 0 ||
    insights.languages.length > 0;

  if (!hasAny) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        🧩 Answer a few questions to see your tech profile come to life.
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">Your tech profile</h2>

      <div className="grid grid-cols-3 gap-3">
        <Tile icon="🧭" label="Domain" value={insights.domain} delay="delay-1" />
        <Tile
          icon="📈"
          label="Experience"
          value={insights.experience}
          delay="delay-2"
        />
        <Tile
          icon="🌍"
          label="Community"
          value={insights.community}
          delay="delay-3"
        />
      </div>

      <Chips
        title="Interests"
        items={insights.interests}
        tone="bg-brand-50 text-brand-700"
      />
      <Chips
        title="Languages"
        items={insights.languages}
        tone="bg-emerald-50 text-emerald-700"
      />
      <Chips
        title="AI toolkit"
        items={insights.aiTools}
        tone="bg-amber-50 text-amber-700"
      />
    </div>
  );
}
