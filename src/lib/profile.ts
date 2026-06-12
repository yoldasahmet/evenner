import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "./types";

/**
 * Ensures a `profiles` row exists for the given user, mirroring data from the
 * identity provider (LinkedIn OIDC supplies name/picture/email on consent).
 * Returns the profile, or null only if the row could not be created.
 */
export async function ensureProfileForUser(
  supabase: SupabaseClient,
  user: User
): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const meta = user.user_metadata ?? {};
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: meta.full_name ?? meta.name ?? null,
      headline: meta.headline ?? null,
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
      role: "attendee" as const,
      linkedin_url: meta.linkedin_url ?? null,
      onboarded: false,
    })
    .select("*")
    .single();

  if (!error) return data as Profile;

  // The insert can fail because a SECURITY DEFINER trigger already created the
  // row (a race) or because RLS blocks it. Re-read before giving up.
  const { data: retry } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (retry) return retry as Profile;

  console.error("[evenner] could not create profile:", error.message);
  return null;
}

/** Ensures the profile for the current auth user (or null if signed out). */
export async function syncProfileFromAuth(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return ensureProfileForUser(supabase, user);
}

// Distinguishes a signed-out visitor from a signed-in user, so callers can
// avoid bouncing authenticated-but-profileless users back to /login (which
// would create a redirect loop).
export type SessionState =
  | { status: "anonymous" }
  | { status: "ready"; profile: Profile }
  | { status: "error" };

/** Loads the session + an ensured profile in one call. */
export async function loadSession(
  supabase: SupabaseClient
): Promise<SessionState> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const profile = await ensureProfileForUser(supabase, user);
  return profile ? { status: "ready", profile } : { status: "error" };
}

/** Convenience: fetch the current user's profile (read-only, may be null). */
export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}
