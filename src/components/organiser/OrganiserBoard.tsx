"use client";

import { useState } from "react";
import Link from "next/link";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import EventForm from "./EventForm";
import SessionsEditor from "./SessionsEditor";
import SponsorsEditor from "./SponsorsEditor";
import type { EventWithRelations } from "@/app/(app)/organiser/page";

export default function OrganiserBoard({
  events,
}: {
  events: EventWithRelations[];
}) {
  const [selected, setSelected] = useState(0);
  const [eventId, setEventId] = useState<string | null>(events[0]?.id ?? null);
  const active = events.find((e) => e.id === eventId) ?? null;

  return (
    <TabStrip selected={selected} onSelect={(e) => setSelected(e.selected)}>
      <TabStripTab title="Events">
        <div className="py-4">
          <EventForm onCreated={(id) => setEventId(id)} />
          <ul className="mt-6 space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="font-semibold text-gray-900">{e.title}</p>
                <p className="text-xs text-gray-500">
                  {e.location ?? "No location"} ·{" "}
                  {e.is_published ? "Published" : "Draft"} · {e.sessions.length}{" "}
                  sessions · {e.sponsors.length} sponsors
                </p>
              </li>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-gray-500">
                No events yet — create your first above.
              </p>
            )}
          </ul>
        </div>
      </TabStripTab>

      <TabStripTab title="Agenda">
        <div className="py-4">
          <EventPicker events={events} value={eventId} onChange={setEventId} />
          {active ? (
            <SessionsEditor event={active} />
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Create or select an event first.
            </p>
          )}
        </div>
      </TabStripTab>

      <TabStripTab title="Sponsors">
        <div className="py-4">
          <EventPicker events={events} value={eventId} onChange={setEventId} />
          {active ? (
            <SponsorsEditor event={active} />
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Create or select an event first.
            </p>
          )}
        </div>
      </TabStripTab>

      <TabStripTab title="Live">
        <div className="py-4">
          <p className="mb-3 text-sm text-gray-600">
            Open an event&apos;s realtime dashboard to watch joins and feedback
            as they happen.
          </p>
          <ul className="space-y-2">
            {[
              ...events.map((e) => ({ id: e.id, title: e.title })),
              ...DEMO_LIVE_EVENTS,
            ].map((e) => (
              <li key={e.id}>
                <Link
                  href={`/organiser/live/${e.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300"
                >
                  <span className="font-semibold text-gray-900">{e.title}</span>
                  <span className="ml-2 text-xs font-medium text-indigo-600">
                    Open live dashboard →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </TabStripTab>
    </TabStrip>
  );
}

// Demo events live only in code, so they can't come from the events prop.
const DEMO_LIVE_EVENTS = [
  { id: "io-connect-2026", title: "I/O Connect 2026 (demo)" },
  { id: "cloud-ai-summit-2026", title: "Cloud AI Summit 2026 (demo)" },
  { id: "frontend-horizons-2026", title: "Frontend Horizons 2026 (demo)" },
];

function EventPicker({
  events,
  value,
  onChange,
}: {
  events: EventWithRelations[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  if (events.length === 0) return null;
  const data = events.map((e) => ({ text: e.title, value: e.id }));
  return (
    <DropDownList
      data={data}
      textField="text"
      dataItemKey="value"
      value={data.find((d) => d.value === value) ?? data[0]}
      onChange={(e) => onChange(e.value.value)}
      className="mb-4 w-full max-w-xs"
    />
  );
}
