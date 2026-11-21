/**
 * Offline Supabase stand-in used when NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Lets the app boot and render
 * (signed-out, with empty data) instead of crashing on every request.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const NOT_CONFIGURED = {
  name: "SupabaseNotConfigured",
  message:
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  status: 503,
};

type Result = { data: unknown; error: typeof NOT_CONFIGURED; count: null };

// Chainable query builder: every method returns the builder, and awaiting it
// resolves to an empty result. `.single()` / `.maybeSingle()` resolve to null.
function queryBuilder(): unknown {
  let single = false;
  const result = (): Result => ({
    data: single ? null : [],
    error: NOT_CONFIGURED,
    count: null,
  });
  const builder: unknown = new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === "then") {
        return (resolve: (r: Result) => unknown, reject?: (e: unknown) => unknown) =>
          Promise.resolve(result()).then(resolve, reject);
      }
      if (prop === "single" || prop === "maybeSingle") single = true;
      return () => builder;
    },
  });
  return builder;
}

const authError = () =>
  Promise.resolve({ data: { user: null, session: null, url: null }, error: NOT_CONFIGURED });

const auth = {
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  signInWithPassword: authError,
  signInWithOAuth: authError,
  signInWithOtp: authError,
  signUp: authError,
  exchangeCodeForSession: authError,
  signOut: () => Promise.resolve({ error: null }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe() {} } },
  }),
};

function channel(): unknown {
  const ch: Record<string, unknown> = {};
  ch.on = () => ch;
  ch.subscribe = () => ch;
  ch.unsubscribe = () => Promise.resolve("ok");
  return ch;
}

export function createStubClient<T>(): T {
  return {
    auth,
    from: () => queryBuilder(),
    rpc: () => queryBuilder(),
    channel,
    removeChannel: () => Promise.resolve("ok"),
    removeAllChannels: () => Promise.resolve([]),
  } as unknown as T;
}

let warned = false;
export function warnNotConfigured() {
  if (warned) return;
  warned = true;
  console.warn(`[evenner] ${NOT_CONFIGURED.message} Running in offline mode.`);
}
