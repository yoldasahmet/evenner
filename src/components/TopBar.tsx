import Link from "next/link";
import SignOutButton from "./SignOutButton";
import type { NavItem } from "./AppShell";
import type { UserRole } from "@/lib/types";

/**
 * Sticky header. On desktop it also renders the primary navigation;
 * on mobile only the brand + sign-out show (nav lives in BottomNav).
 * Organisers get the dark "studio" chrome; attendees the light one.
 */
export default function TopBar({
  items,
  variant = "attendee",
}: {
  items: NavItem[];
  variant?: UserRole;
}) {
  const dark = variant === "organiser";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur ${
        dark
          ? "border-slate-800 bg-slate-950/95"
          : "border-gray-200 bg-white/95"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className={`flex items-center gap-2 text-lg font-bold ${
            dark ? "text-white" : "text-brand-700"
          }`}
        >
          evenner
          {dark && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              studio
            </span>
          )}
        </Link>

        <nav className="hidden gap-6 md:flex">
          {items.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${
                dark
                  ? "text-slate-300 hover:text-amber-400"
                  : "text-gray-600 hover:text-brand-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <span className={dark ? "[&_.k-button]:!text-slate-300" : undefined}>
          <SignOutButton />
        </span>
      </div>
    </header>
  );
}
