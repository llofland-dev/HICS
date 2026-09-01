"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
    >
      Sign out
    </button>
  );
}
