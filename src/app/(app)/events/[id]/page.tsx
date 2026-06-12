import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import AgendaExplorer from "@/components/events/AgendaExplorer";
import { SponsorsSection } from "@/components/events/SponsorsSection";
import PrizeSection from "@/components/events/PrizeSection";
import EventHeroArt from "@/components/illustrations/EventHeroArt";
import { getEvent } from "@/lib/events";
import { FORMAT_LABEL } from "@/lib/event-view";

// Full event detail: overview, highlights, an interactive agenda and sponsors.
export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  const hasPrizeSessions = event.sessions.some((s) => s.hasPrize);

  return (
    <article className="space-y-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-brand-700 hover:gap-2 transition-all"
      >
        ← All events
      </Link>

      {/* Hero */}
      <header className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm animate-fade-up">
        <div className="bg-aurora relative flex h-44 items-end p-5">
          <EventHeroArt className="absolute right-2 top-1 h-32 w-auto opacity-95" />
          <span className="relative rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {FORMAT_LABEL[event.format]}
            {event.category ? ` · ${event.category}` : ""}
          </span>
        </div>
        <div className="bg-white p-5">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {event.title}
          </h1>
          {event.tagline && <p className="mt-1 text-gray-500">{event.tagline}</p>}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Meta icon="🗓️" label="When" value={event.startsAt} />
            {event.location && (
              <Meta icon="📍" label="Where" value={event.location} />
            )}
            {event.capacity && (
              <Meta icon="🎟️" label="Capacity" value={`${event.capacity} seats`} />
            )}
            <Meta
              icon="🎤"
              label="Agenda"
              value={`${event.sessions.length} sessions`}
            />
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            {event.websiteUrl && (
              <a href={event.websiteUrl} target="_blank" rel="noreferrer">
                <Button themeColor="primary">Visit event site</Button>
              </a>
            )}
            <Link href={`/events/${event.id}/plan`}>
              <Button themeColor="secondary">Create my evenn</Button>
            </Link>
          </div>
        </div>
      </header>

      {event.description && (
        <Section title="About" delay="delay-1">
          <p className="leading-relaxed text-gray-600">{event.description}</p>
        </Section>
      )}

      {event.highlights && event.highlights.length > 0 && (
        <Section title="Highlights" delay="delay-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {event.highlights.map((h, i) => (
              <Highlight key={h} text={h} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Agenda — plain wrapper (no transform) so the sticky detail column
          stays pinned reliably while the list scrolls. */}
      <section className="animate-fade-in">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Agenda</h2>
        <AgendaExplorer sessions={event.sessions} />
      </section>

      {hasPrizeSessions && <PrizeSection />}

      <SponsorsSection sponsors={event.sponsors} />
    </article>
  );
}

const HL_ICONS = ["⚡", "🎯", "🤝", "🚀", "🌟", "🔥", "🧩", "🏅"];

function Highlight({ text, index }: { text: string; index: number }) {
  return (
    <div
      className={`animate-fade-up delay-${(index % 6) + 1} group flex items-start gap-3 rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-50/80 to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-brand-100">
        {HL_ICONS[index % HL_ICONS.length]}
      </span>
      <p className="pt-1 text-sm font-medium text-gray-700">{text}</p>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-400">
        <span aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function Section({
  title,
  delay = "",
  children,
}: {
  title: string;
  delay?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`animate-fade-up ${delay}`}>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
