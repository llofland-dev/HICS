import { createClient } from "@/lib/supabase/server";
import type { Position, Profile, Staff, StaffQualification } from "@/lib/supabase/types";
import { TopBar } from "@/components/top-bar";
import { StaffRoster } from "./staff-roster";

export default async function StaffPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile?.org_id) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <TopBar title="Staff Roster" backHref="/" />
        <main className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Your account isn&apos;t linked to a facility yet. Ask your system administrator to
            assign you to an organization.
          </p>
        </main>
      </div>
    );
  }

  const [{ data: staff }, { data: positions }] = await Promise.all([
    supabase
      .from("staff")
      .select("id, facility_org_id, name, role_title, phone, email, notes")
      .eq("facility_org_id", profile.org_id)
      .order("name")
      .returns<Staff[]>(),
    supabase
      .from("positions")
      .select("code, title, section, reports_to_code, tier, description")
      .returns<Position[]>(),
  ]);

  const staffIds = (staff ?? []).map((s) => s.id);
  const { data: qualifications } = staffIds.length
    ? await supabase
        .from("staff_qualifications")
        .select("staff_id, position_code, qualified")
        .in("staff_id", staffIds)
        .returns<StaffQualification[]>()
    : { data: [] as StaffQualification[] };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <TopBar
        title="Staff Roster"
        subtitle="Roster and qualification matrix for your facility."
        backHref="/"
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <StaffRoster
          facilityOrgId={profile.org_id}
          staff={staff ?? []}
          positions={positions ?? []}
          qualifications={qualifications ?? []}
        />
      </main>
    </div>
  );
}
