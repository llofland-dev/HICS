import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import { TopBar } from "@/components/top-bar";
import { FacilityRequestsPanel } from "./facility-requests-panel";

export default async function FacilityRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profile?.role !== "system_admin") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <TopBar title="Facility requests" backHref="/" />
        <main className="mx-auto max-w-2xl px-6 py-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You don&apos;t have access to this page. Only the Super Admin can approve new
            facilities.
          </p>
        </main>
      </div>
    );
  }

  // Scoped by the profiles_select_new_facility_requests policy: org_id is
  // null AND requested_org_id is null (didn't match any existing facility).
  const { data: pending } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email, requested_org_code")
    .is("org_id", null)
    .is("requested_org_id", null)
    .returns<Profile[]>();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <TopBar
        title="Facility requests"
        subtitle="New clients waiting for a facility to be created."
        backHref="/"
      />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <FacilityRequestsPanel pending={pending ?? []} />
      </main>
    </div>
  );
}
