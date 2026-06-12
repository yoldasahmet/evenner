import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProfileFromAuth } from "@/lib/profile";

/**
 * OAuth / magic-link callback. Exchanges the auth code for a session,
 * mirrors LinkedIn profile data into our `profiles` table, then routes the
 * user to onboarding (first time) or their intended destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const profile = await syncProfileFromAuth(supabase);

  // Not onboarded yet -> interview. Otherwise honour an explicit next, else
  // send users to their role-appropriate home.
  const roleHome = profile?.role === "organiser" ? "/organiser" : "/events";
  const destination = profile?.onboarded ? next ?? roleHome : "/onboarding";
  return NextResponse.redirect(`${origin}${destination}`);
}
