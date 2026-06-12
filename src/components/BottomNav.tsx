"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./AppShell";
import type { UserRole } from "@/lib/types";

/**
 * Fixed bottom tab bar — the primary navigation on mobile.
 * Hidden on large screens where the TopBar links take over.
 * Organisers get the dark "studio" chrome; attendees the light one.
 */
export default function BottomNav({
  items,
  variant = "attendee",
}: {
  items: NavItem[];
  variant?: UserRole;
}) {
  const pathname = usePathname();
  const dark = variant === "organiser";

  // Longest matching href wins, so "/organiser" doesn't light up while
  // "/organiser/dashboard" is open.
  const current = items
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden ${
        dark
          ? "border-slate-800 bg-slate-950/95"
          : "border-gray-200 bg-white/95"
      }`}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = current?.href === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                  active
                    ? dark
                      ? "font-semibold text-amber-400"
                      : "font-semibold text-brand-700"
                    : dark
                      ? "text-slate-400"
                      : "text-gray-500"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
