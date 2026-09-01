import type { AppRole } from "@/lib/supabase/types";

// UI-facing labels only -- database values (member/facility_admin/system_admin)
// are unchanged. This is the single place that maps one to the other.
export const ROLE_LABELS: Record<AppRole, string> = {
  system_admin: "Super Admin",
  facility_admin: "Admin",
  member: "User",
};
