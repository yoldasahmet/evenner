import { createBrowserClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  createStubClient,
  isSupabaseConfigured,
  warnNotConfigured,
} from "./stub";

/**
 * Supabase client for use in Client Components ("use client").
 * Reads the public env vars that are safe to expose to the browser.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    warnNotConfigured();
    return createStubClient<ReturnType<typeof createBrowserClient>>();
  }

  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
