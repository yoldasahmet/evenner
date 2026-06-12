"use client";

import type { EventSponsor } from "@/lib/event-view";
import SponsorCard from "./SponsorCard";

const TIERS = ["Platinum", "Gold", "Silver"];

export function SponsorsSection({ sponsors }: { sponsors: EventSponsor[] }) {
  if (sponsors.length === 0) return null;

  // Keep known tiers in order, then anything else (incl. untiered) at the end.
  const known = new Set(TIERS);
  const extraTiers = Array.from(
    new Set(sponsors.map((s) => s.tier).filter((t): t is string => !!t && !known.has(t)))
  );
  const groups = [...TIERS, ...extraTiers];
  const untiered = sponsors.filter((s) => !s.tier);

  return (
    <section className="animate-fade-up">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">Sponsors</h2>
      <p className="mb-4 text-sm text-gray-500">
        The companies powering this event — and what they build.
      </p>

      <div className="space-y-6">
        {groups.map((tier) => {
          const tiered = sponsors.filter((s) => s.tier === tier);
          if (tiered.length === 0) return null;
          return (
            <div key={tier}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {tier} sponsors
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tiered.map((s) => (
                  <SponsorCard key={s.name} sponsor={s} />
                ))}
              </div>
            </div>
          );
        })}

        {untiered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {untiered.map((s) => (
              <SponsorCard key={s.name} sponsor={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
