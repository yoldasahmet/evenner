import Link from "next/link";
import AgendaList from "@/components/events/AgendaList";
import { SponsorsSection } from "@/components/events/SponsorsSection";
import { FORMAT_LABEL, type EventDetail } from "@/lib/event-view";
import { getEvent, listEvents } from "@/lib/events";

export default async function EventsPreviewPage() {
  const summaries = await listEvents();
  const events = (
    await Promise.all(summaries.map((s) => getEvent(s.id)))
  ).filter((e): e is EventDetail => e !== null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events Preview</h1>
          <p className="text-lg text-gray-600">
            Demo of enhanced event pages with 30+ sessions, prize indicators, and sponsor logos
          </p>
        </div>

        {events.map((event) => (
          <article key={event.id} className="mb-16 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hero */}
            <header className="overflow-hidden">
              <div className="flex h-40 items-end bg-gradient-to-br from-brand-700 to-brand-500 p-5">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  {FORMAT_LABEL[event.format]}
                  {event.category ? ` · ${event.category}` : ""}
                </span>
              </div>
              <div className="bg-white p-8">
                <h2 className="text-3xl font-bold text-gray-900">{event.title}</h2>
                {event.tagline && (
                  <p className="mt-2 text-lg text-gray-500">{event.tagline}</p>
                )}
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400">When</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{event.startsAt}</dd>
                  </div>
                  {event.location && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Where</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">{event.location}</dd>
                    </div>
                  )}
                  {event.capacity && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Capacity</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">{event.capacity} seats</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400">Agenda</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{event.sessions.length} sessions</dd>
                  </div>
                </dl>
                <div className="mt-6 flex gap-3">
                  {event.websiteUrl && (
                    <a href={event.websiteUrl} target="_blank" rel="noreferrer">
                      <button className="px-6 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800">
                        Visit event site
                      </button>
                    </a>
                  )}
                  <button className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300">
                    Create an Event
                  </button>
                </div>
              </div>
            </header>

            <div className="px-8 py-12 space-y-12">
              {event.description && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600">{event.description}</p>
                </section>
              )}

              {event.highlights && event.highlights.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Highlights</h3>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {event.highlights.map((h) => (
                      <li
                        key={h}
                        className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Agenda</h3>
                <AgendaList sessions={event.sessions} />
              </section>

              <SponsorsSection sponsors={event.sponsors} />
            </div>
          </article>
        ))}

        <div className="text-center text-gray-500 text-sm mt-16">
          <p>This is a public preview. Sign in to create and manage your own events.</p>
          <Link href="/login">
            <button className="mt-4 px-6 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
