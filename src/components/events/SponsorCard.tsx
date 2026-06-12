"use client";

import type { EventSponsor } from "@/lib/event-view";
import { getSponsorInfo } from "@/lib/sponsor-info";

const TIER_RING: Record<string, string> = {
  Platinum: "ring-violet-200 bg-violet-50 text-violet-700",
  Gold: "ring-amber-200 bg-amber-50 text-amber-700",
  Silver: "ring-gray-200 bg-gray-50 text-gray-600",
};

// A rich sponsor card: logo, tier, industry and the products they bring.
export default function SponsorCard({ sponsor }: { sponsor: EventSponsor }) {
  const info = getSponsorInfo(sponsor.name);
  const tierClass = TIER_RING[sponsor.tier ?? ""] ?? TIER_RING.Silver;

  return (
    <a
      href={sponsor.websiteUrl ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 animate-fade-up hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-28 items-center">
          {sponsor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="max-h-9 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-semibold text-gray-900">{sponsor.name}</span>
          )}
        </div>
        {sponsor.tier && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${tierClass}`}>
            {sponsor.tier}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-bold text-gray-900 group-hover:text-brand-700">
        {sponsor.name}
      </p>

      {info ? (
        <>
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
            🏷️ {info.industry}
          </span>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{info.blurb}</p>
          <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
            {info.products.map((p) => (
              <div key={p.name} className="text-sm">
                <span className="font-medium text-gray-800">{p.name}</span>
                <span className="text-gray-500"> — {p.description}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-gray-400">
          Proud {sponsor.tier ?? "event"} sponsor.
        </p>
      )}
    </a>
  );
}
