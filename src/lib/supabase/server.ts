import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  createStubClient,
  isSupabaseConfigured,
  warnNotConfigured,
} from "./stub";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Bridges Supabase's auth cookies to Next.js' cookie store.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    warnNotConfigured();
    return createStubClient<ReturnType<typeof createServerClient>>();
  }

  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies are read-only here.
            // Session refresh is handled by the middleware instead.
          }
        },
      },
    }
  );
}
