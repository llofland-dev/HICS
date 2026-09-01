"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole, Profile } from "@/lib/supabase/types";
import { ROLE_LABELS } from "@/lib/roles";

interface ManageUsersPanelProps {
  members: Profile[];
  currentUserId: string;
}

export function ManageUsersPanel({ members, currentUserId }: ManageUsersPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleChange(id: string, role: AppRole) {
    setBusyId(id);
    setError(null);

    const { error } = await supabase.rpc("update_user_role", { p_profile_id: id, p_role: role });

    setBusyId(null);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this person from the facility? They can be re-assigned later.")) return;

    setBusyId(id);
    setError(null);

    const { error } = await supabase.rpc("remove_user_from_facility", { p_profile_id: id });

    setBusyId(null);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  if (members.length === 0) {
    return <p className="text-sm text-zinc-500">No one is assigned to this facility yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950">
        {members.map((m) => {
          const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
          const isSelf = m.id === currentUserId;
          return (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  {name || "(no name given)"} {isSelf && <span className="text-zinc-400">(you)</span>}
                </p>
                <p className="text-xs text-zinc-500">{m.email ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  disabled={isSelf || busyId === m.id}
                  onChange={(e) => handleRoleChange(m.id, e.target.value as AppRole)}
                  className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-[#00274c] disabled:opacity-50 dark:border-white/10 dark:focus:border-[#7ba6d6]"
                >
                  <option value="member">{ROLE_LABELS.member}</option>
                  <option value="facility_admin">{ROLE_LABELS.facility_admin}</option>
                </select>
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={isSelf || busyId === m.id}
                  className="rounded-md border border-red-600/30 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-600/5 disabled:opacity-50 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-400/10"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
