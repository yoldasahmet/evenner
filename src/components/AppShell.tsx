import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Two templates: attendees browse & manage attendance; organisers run events.
const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  attendee: [
    { href: "/events", label: "Events", icon: "📅" },
    { href: "/attendee", label: "My hub", icon: "🎟️" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ],
  organiser: [
    { href: "/organiser/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/organiser", label: "Organise", icon: "✨" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ],
};

/**
 * Layout wrapper for authenticated app pages. Each role gets a visually
 * distinct template: attendees keep the light violet look, organisers get
 * the dark "studio" chrome (slate + amber) with its own nav.
 */
export default function AppShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const items = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.attendee;
  const organiser = role === "organiser";

  return (
    <div className={`min-h-dvh ${organiser ? "bg-slate-100" : "bg-gray-50"}`}>
      <TopBar items={items} variant={role} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:pb-10">
        {children}
      </main>
      <BottomNav items={items} variant={role} />
    </div>
  );
}
