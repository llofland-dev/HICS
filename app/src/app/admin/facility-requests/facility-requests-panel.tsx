"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { BRAND } from "@/lib/brand";

const fieldClass =
  "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]";

interface FacilityRequestsPanelProps {
  pending: Profile[];
}

export function FacilityRequestsPanel({ pending }: FacilityRequestsPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [orgNameById, setOrgNameById] = useState<Record<string, string>>({});
  const [orgCodeById, setOrgCodeById] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setPendingId(id);
    setError(null);

    const { error } = await supabase.rpc("approve_facility_request", {
      p_profile_id: id,
      p_org_name: orgNameById[id]?.trim(),
      p_org_code: orgCodeById[id]?.trim(),
    });

    setPendingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  if (pending.length === 0) {
    return <p className="text-sm text-zinc-500">No pending facility requests right now.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950">
        {pending.map((p) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
          return (
            <div key={p.id} className="space-y-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  {name || "(no name given)"}
                </p>
                <p className="text-xs text-zinc-500">{p.email ?? "—"}</p>
                {p.requested_org_code && (
                  <p className="text-xs text-zinc-500">
                    Typed code at signup: &quot;{p.requested_org_code}&quot; (no match)
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Facility name
                  </label>
                  <input
                    value={orgNameById[p.id] ?? ""}
                    onChange={(e) => setOrgNameById((v) => ({ ...v, [p.id]: e.target.value }))}
                    placeholder="e.g. Adventist Health Main Campus"
                    className={fieldClass}
                  />
                </div>
                <div className="w-40 space-y-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Facility code
                  </label>
                  <input
                    value={orgCodeById[p.id] ?? p.requested_org_code ?? ""}
                    onChange={(e) => setOrgCodeById((v) => ({ ...v, [p.id]: e.target.value }))}
                    placeholder="e.g. ADVENTIST"
                    className={fieldClass}
                  />
                </div>
                <button
                  onClick={() => handleApprove(p.id)}
                  disabled={pendingId === p.id || !orgNameById[p.id]?.trim()}
                  className={BRAND.buttonClassSm}
                >
                  {pendingId === p.id ? "Approving..." : "Approve & create facility"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
