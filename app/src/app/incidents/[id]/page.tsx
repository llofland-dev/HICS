import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Assignment,
  CustomPosition,
  Incident,
  OperationalPeriod,
  Position,
  Profile,
  Staff,
  StaffQualification,
} from "@/lib/supabase/types";
import { OperationalPeriodBar } from "./operational-period-bar";
import { OrgChart } from "./org-chart";

export default async function IncidentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ op?: string }>;
}) {
  const { id } = await params;
  const { op } = await searchParams;
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

  const [{ data: positions }, { data: customPositions }, { data: staff }, { data: periods }] =
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
        .from("operational_periods")
        .select("id, incident_id, period_number, date_from, time_from, date_to, time_to, status, created_at")
        .eq("incident_id", incident.id)
        .order("period_number", { ascending: true })
        .returns<OperationalPeriod[]>(),
    ]);

  const selectedPeriod =
    (op ? periods?.find((p) => p.id === op) : undefined) ??
    periods?.find((p) => p.status === "active") ??
    periods?.[periods.length - 1] ??
    null;

  const { data: assignments } = selectedPeriod
    ? await supabase
        .from("assignments")
        .select(
          "id, incident_id, operational_period_id, position_code, custom_position_id, staff_id, assigned_at, unassigned_at"
        )
        .eq("operational_period_id", selectedPeriod.id)
        .is("unassigned_at", null)
        .returns<Assignment[]>()
    : { data: [] as Assignment[] };

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
              href={`/incidents/${incident.id}/ics204`}
              className="text-sm text-zinc-500 hover:underline"
            >
              Assignment lists (204)
            </Link>
            <Link
              href={`/incidents/${incident.id}/ics203`}
              className="text-sm text-zinc-500 hover:underline"
            >
              Org assignment list (203)
            </Link>
            <Link
              href={`/incidents/${incident.id}/aar`}
              className="text-sm text-zinc-500 hover:underline"
            >
              After Action Review
            </Link>
            <Link
              href={`/incidents/${incident.id}/unit-logs`}
              className="text-sm text-zinc-500 hover:underline"
            >
              Unit logs (214)
            </Link>
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
        {selectedPeriod ? (
          <>
            <OperationalPeriodBar
              incidentId={incident.id}
              periods={periods ?? []}
              selectedPeriod={selectedPeriod}
              canEdit={canEdit}
            />
            <OrgChart
              incidentId={incident.id}
              operationalPeriodId={selectedPeriod.id}
              facilityOrgId={incident.facility_org_id}
              positions={positions ?? []}
              customPositions={customPositions ?? []}
              staff={staff ?? []}
              assignments={assignments ?? []}
              qualifications={qualifications ?? []}
              canEdit={canEdit}
              canEditAssignments={canEdit && selectedPeriod.status === "active"}
            />
          </>
        ) : (
          <p className="text-sm text-zinc-500">No operational period found for this incident.</p>
        )}
      </main>
    </div>
  );
}
