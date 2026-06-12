"use client";

import { useState } from "react";
// React 18 (pinned for KendoReact): useActionState doesn't exist yet —
// useFormState + useFormStatus are the React 18 / Next 14 equivalents.
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { createClient } from "@/lib/supabase/client";
import { signInWithPassword } from "@/app/login/actions";

export default function LoginForm({ next }: { next?: string }) {
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);

  const [error, formAction] = useFormState(signInWithPassword, null);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const redirectTo = `${siteUrl}/auth/callback${
    next ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  async function signInWithLinkedIn() {
    setLinkedinError(null);
    setLinkedinLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo, scopes: "openid profile email" },
    });
    if (error) {
      setLinkedinError(error.message);
      setLinkedinLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        themeColor="primary"
        size="large"
        disabled={linkedinLoading}
        onClick={signInWithLinkedIn}
      >
        {linkedinLoading ? "Connecting…" : "Continue with LinkedIn"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        {next && <input type="hidden" name="next" value={next} />}
        <PasswordFields error={error ?? linkedinError} />
      </form>
    </div>
  );
}

// useFormStatus only reports pending when called from inside the <form>.
function PasswordFields({ error }: { error: string | null }) {
  const { pending } = useFormStatus();
  return (
    <>
      <Input
        type="email"
        name="email"
        placeholder="Email"
        aria-label="Email address"
        disabled={pending}
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        aria-label="Password"
        disabled={pending}
      />
      <Button type="submit" size="large" themeColor="base" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </>
  );
}
