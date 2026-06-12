import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { loadSession } from "@/lib/profile";

// Gate for every authenticated page:
//  - no session        -> /login
//  - not onboarded yet  -> /onboarding (asked on every login until complete)
//  - otherwise render the role-appropriate shell.
// Note: we only redirect to /login when there is genuinely no user. An
// authenticated user always gets a profile (created on demand), which avoids
// a /login <-> /app redirect loop.
export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const session = await loadSession(supabase);

  if (session.status === "anonymous") redirect("/login");
  if (session.status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-gray-500">
        We couldn&apos;t load your profile. Please check the database setup and
        refresh.
      </div>
    );
  }

  if (!session.profile.onboarded) redirect("/onboarding");

  return <AppShell role={session.profile.role}>{children}</AppShell>;
}
