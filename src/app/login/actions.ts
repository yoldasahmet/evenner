"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadSession } from "@/lib/profile";

export async function signInWithPassword(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || null;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return error.message;

  // Session cookie is now set on the server response — safe to redirect.
  const session = await loadSession(supabase);
  const roleHome = session.status === "ready" && session.profile.role === "organiser"
    ? "/organiser"
    : "/events";

  redirect(next ?? roleHome);
}
