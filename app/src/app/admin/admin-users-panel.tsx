"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole, Profile } from "@/lib/supabase/types";
import { BRAND } from "@/lib/brand";
import { ROLE_LABELS } from "@/lib/roles";

interface AdminUsersPanelProps {
  pending: Profile[];
  facilityName: string;
}

export function AdminUsersPanel({ pending, facilityName }: AdminUsersPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [roleById, setRoleById] = useState<Record<string, AppRole>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAssign(id: string) {
    setPendingId(id);
    setError(null);

    const { error } = await supabase.rpc("assign_profile_to_facility", {
      p_profile_id: id,
      p_role: roleById[id] ?? "member",
    });

    setPendingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  if (pending.length === 0) {
    return <p className="text-sm text-zinc-500">No pending sign-ups right now.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950">
        {pending.map((p) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  {name || "(no name given)"}
                </p>
                <p className="text-xs text-zinc-500">{p.email ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={roleById[p.id] ?? "member"}
                  onChange={(e) =>
                    setRoleById((v) => ({ ...v, [p.id]: e.target.value as AppRole }))
                  }
                  className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
                >
                  <option value="member">{ROLE_LABELS.member}</option>
                  <option value="facility_admin">{ROLE_LABELS.facility_admin}</option>
                </select>
                <button
                  onClick={() => handleAssign(p.id)}
                  disabled={pendingId === p.id}
                  className={BRAND.buttonClassSm}
                >
                  {pendingId === p.id ? "Assigning..." : `Assign to ${facilityName}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
