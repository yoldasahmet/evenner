"use client";

import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button fillMode="flat" onClick={signOut} aria-label="Sign out">
      Sign out
    </Button>
  );
}
