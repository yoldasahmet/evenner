import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LiveSessionCard from "@/components/live/LiveSessionCard";
import RecapView from "@/components/live/RecapView";
import EvennAgendaFlow from "@/components/evenn/EvennAgendaFlow";
import LeaveEventButton from "@/components/evenn/LeaveEventButton";
import { createClient } from "@/lib/supabase/server";
import {
  getEvennWithSessions,
  listFeedbackForEvenn,
  listRecommendations,
} from "@/lib/live/queries";
import { currentSessionIndex, nextUpcomingIndex } from "@/lib/live/time";
import type { EvennSessionRow } from "@/lib/live/types";

const isTerminal = (s: EvennSessionRow) =>
  s.status === "completed" || s.status === "skipped";

// Live companion for one evenn: the session happening now up top, then the
// whole agenda as a day-grouped animated flow with the next session to join
// highlighted. Once everything is done it becomes a recap with AI recs.
// `?demo=1` bypasses the clock and treats the first open session as current.
export default async function EvennLivePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { demo?: string };
}) {
  const supabase = createClient();
  const data = await getEvennWithSessions(supabase, params.id);
  if (!data) redirect("/attendee");
  const { evenn, sessions } = data;

  if (sessions.length > 0 && sessions.every(isTerminal)) {
    const [feedback, recommendations] = await Promise.all([
      listFeedbackForEvenn(supabase, sessions.map((s) => s.id)),
      listRecommendations(supabase, evenn.id),
    ]);
    return (
      <>
        <PageHeader
          title={evenn.event_title}
          subtitle="That's a wrap — here's your recap."
        />
        <RecapView
          evennId={evenn.id}
          eventTitle={evenn.event_title}
          sessions={sessions}
          feedback={feedback}
          recommendations={recommendations}
        />
      </>
    );
  }

  const demo = searchParams.demo === "1";
  const idx = demo
    ? nextUpcomingIndex(sessions)
    : currentSessionIndex(sessions, new Date());
  const current = idx >= 0 && !isTerminal(sessions[idx]) ? sessions[idx] : null;
  const nextIdx = nextUpcomingIndex(sessions);
  const highlightId = current?.id ?? (nextIdx >= 0 ? sessions[nextIdx].id : null);
  const done = sessions.filter(isTerminal).length;
  const progress = sessions.length
    ? Math.round((done / sessions.length) * 100)
    : 0;

  return (
    <>
      <Link
        href="/attendee"
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand-700 transition-all hover:gap-2"
      >
        ← My hub
      </Link>
      <PageHeader
        title={evenn.event_title}
        subtitle="Your live event companion."
      />

      {/* progress + leave */}
      <div className="animate-fade-up mb-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-gray-400">
          {done}/{sessions.length} done
        </span>
        <LeaveEventButton evennId={evenn.id} />
      </div>

      <div className="space-y-6">
        {current ? (
          <div className="animate-pop">
            <LiveSessionCard key={current.id} session={current} />
          </div>
        ) : (
          <div className="animate-fade-up rounded-2xl border border-dashed border-brand-500/40 bg-brand-50/40 p-4 text-sm text-gray-600">
            No session is live right now — your next stop is highlighted below.
          </div>
        )}

        <EvennAgendaFlow sessions={sessions} highlightId={highlightId} />
      </div>
    </>
  );
}
