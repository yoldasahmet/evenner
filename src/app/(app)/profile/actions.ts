"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

const str = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim() || null;

// Saves the organiser's company/organisation details onto their profile.
export async function updateOrganiserCompany(
  form: FormData
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: str(form, "company_name"),
        company_website: str(form, "company_website"),
        company_role: str(form, "company_role"),
        company_size: str(form, "company_size"),
        company_about: str(form, "company_about"),
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
