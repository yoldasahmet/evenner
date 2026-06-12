"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

// Deletes one of the current user's evenns (sessions cascade via FK).
// RLS already scopes deletes to the owner; the explicit user check just
// gives a clearer error than a silent no-op.
export async function deleteEvenn(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("evenns")
      .delete()
      .eq("id", id)
      .eq("profile_id", user.id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/attendee");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
