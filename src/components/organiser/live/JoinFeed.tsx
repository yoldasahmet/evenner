import type { SessionJoin } from "@/lib/live/types";

// Per-session live join counts; the count badge re-mounts on change so the
// one-shot pulse animation plays on every increment.
export default function JoinFeed({ joins }: { joins: SessionJoin[] }) {
  const bySession = new Map<string, { title: string; count: number }>();
  for (const join of joins) {
    const entry = bySession.get(join.session_ref) ?? {
      title: join.session_title,
      count: 0,
    };
    entry.count += 1;
    bySession.set(join.session_ref, entry);
  }

  if (bySession.size === 0) {
    return (
      <p className="text-sm text-gray-500">
        No joins yet — counts appear here the moment attendees tap Join.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {[...bySession.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .map(([ref, { title, count }]) => (
          <li
            key={ref}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <span
              key={count}
              className="inline-flex min-w-8 animate-[pulse_0.6s_ease-in-out_1] items-center justify-center rounded-full bg-indigo-100 px-2 py-1 text-sm font-bold text-indigo-700"
            >
              {count}
            </span>
          </li>
        ))}
    </ul>
  );
}
