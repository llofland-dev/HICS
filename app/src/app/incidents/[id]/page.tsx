import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Assignment,
  CustomPosition,
  Incident,
  Position,
  Profile,
  Staff,
  StaffQualification,
} from "@/lib/supabase/types";
import { OrgChart } from "./org-chart";

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: incident } = await supabase
    .from("incidents")
    .select("id, facility_org_id, event_id, name, incident_date, type, status, created_at")
    .eq("id", id)
    .maybeSingle<Incident>();

  if (!incident) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const canEdit = profile?.org_id === incident.facility_org_id;

  const [{ data: positions }, { data: customPositions }, { data: staff }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("positions")
        .select("code, title, section, reports_to_code, tier, description")
        .returns<Position[]>(),
      supabase
        .from("custom_positions")
        .select("id, facility_org_id, title, created_at")
        .eq("facility_org_id", incident.facility_org_id)
        .returns<CustomPosition[]>(),
      supabase
        .from("staff")
        .select("id, facility_org_id, name, role_title, phone, email, notes")
        .eq("facility_org_id", incident.facility_org_id)
        .order("name")
        .returns<Staff[]>(),
      supabase
        .from("assignments")
        .select("id, incident_id, position_code, custom_position_id, staff_id, assigned_at, unassigned_at")
        .eq("incident_id", incident.id)
        .is("unassigned_at", null)
        .returns<Assignment[]>(),
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
      <header className="border-b border-black/10 px-6 py-4 dark:border-white/10">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Incidents
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-zinc-50">{incident.name}</h1>
            <p className="text-sm text-zinc-500">
              {incident.incident_date} · {incident.type} · {incident.status}
              {!canEdit && " · read-only (different facility)"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/incidents/${incident.id}/messages`}
              className="text-sm text-zinc-500 hover:underline"
            >
              General messages (213)
            </Link>
            <Link
              href={`/incidents/${incident.id}/communications`}
              className="text-sm text-zinc-500 hover:underline"
            >
              Communications list (205A)
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <OrgChart
          incidentId={incident.id}
          facilityOrgId={incident.facility_org_id}
          positions={positions ?? []}
          customPositions={customPositions ?? []}
          staff={staff ?? []}
          assignments={assignments ?? []}
          qualifications={qualifications ?? []}
          canEdit={canEdit}
        />
      </main>
    </div>
  );
}
