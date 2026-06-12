import type { Recommendation, RecommendationKind } from "@/lib/live/types";

const GROUPS: { kind: RecommendationKind; label: string }[] = [
  { kind: "article", label: "Articles" },
  { kind: "repo", label: "GitHub repos" },
  { kind: "video", label: "Videos" },
];

// Renders persisted recommendations grouped by kind with linked titles.
export default function RecommendationList({
  items,
}: {
  items: Recommendation[];
}) {
  return (
    <div className="space-y-6">
      {GROUPS.map(({ kind, label }) => {
        const group = items.filter((item) => item.kind === kind);
        if (group.length === 0) return null;
        return (
          <section key={kind}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {label}
            </h3>
            <ul className="space-y-2">
              {group.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-700 hover:underline"
                  >
                    {item.title}
                  </a>
                  {item.reason && (
                    <p className="mt-1 text-sm text-gray-600">{item.reason}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
