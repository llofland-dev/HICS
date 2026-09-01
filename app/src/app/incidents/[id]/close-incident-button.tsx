"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CloseIncidentButton({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [closing, setClosing] = useState(false);

  async function handleClose() {
    if (!confirm("Close this incident? It will no longer accept new activity.")) return;

    setClosing(true);
    const { error } = await supabase.from("incidents").update({ status: "closed" }).eq("id", incidentId);
    setClosing(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleClose}
      disabled={closing}
      className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-blue-100 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      {closing ? "Closing..." : "Close incident"}
    </button>
  );
}
