import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Aar,
  AarActionItem,
  AarCommandHighlight,
  AarCoordinationRole,
  AarCoreElementNote,
  Incident,
  Organization,
  Profile,
  UnitLog,
  UnitLogEntry,
} from "@/lib/supabase/types";
import { AarEditor } from "./aar-editor";

export default async function AarPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: facilityOrg } = await supabase
    .from("organizations")
    .select("id, name, type, parent_org_id, created_at")
    .eq("id", incident.facility_org_id)
    .maybeSingle<Organization>();

  const { data: systemOrg } = facilityOrg?.parent_org_id
    ? await supabase
        .from("organizations")
        .select("id, name, type, parent_org_id, created_at")
        .eq("id", facilityOrg.parent_org_id)
        .maybeSingle<Organization>()
    : { data: null };

  const [
    { data: aar },
    { data: actionItems },
    { data: coreElementNotes },
    { data: commandHighlights },
    { data: coordinationRoles },
    { data: unitLogs },
  ] = await Promise.all([
    supabase.from("aar").select("*").eq("incident_id", incident.id).maybeSingle<Aar>(),
    supabase
      .from("aar_action_items")
      .select("*")
      .eq("incident_id", incident.id)
      .order("created_at", { ascending: true })
      .returns<AarActionItem[]>(),
    supabase
      .from("aar_core_element_notes")
      .select("*")
      .eq("incident_id", incident.id)
      .order("sort_order", { ascending: true })
      .returns<AarCoreElementNote[]>(),
    supabase
      .from("aar_command_highlights")
      .select("*")
      .eq("incident_id", incident.id)
      .order("sort_order", { ascending: true })
      .returns<AarCommandHighlight[]>(),
    supabase
      .from("aar_coordination_roles")
      .select("*")
      .eq("incident_id", incident.id)
      .order("sort_order", { ascending: true })
      .returns<AarCoordinationRole[]>(),
    supabase
      .from("unit_logs")
      .select(
        "id, incident_id, unit_name, position_code, leader_name, home_agency, op_period_date_from, op_period_date_to, op_period_time_from, op_period_time_to, prepared_by_name, prepared_by_position, prepared_by_signature, prepared_at, created_at"
      )
      .eq("incident_id", incident.id)
      .returns<UnitLog[]>(),
  ]);

  const unitLogIds = (unitLogs ?? []).map((u) => u.id);
  const { data: entries } = unitLogIds.length
    ? await supabase
        .from("unit_log_entries")
        .select("id, unit_log_id, entry_date, entry_time, notable_activity, created_at")
        .in("unit_log_id", unitLogIds)
        .order("entry_date", { ascending: true })
        .order("entry_time", { ascending: true })
        .returns<UnitLogEntry[]>()
    : { data: [] as UnitLogEntry[] };

  const unitNameByLogId = new Map((unitLogs ?? []).map((u) => [u.id, u.unit_name]));
  const timeline = (entries ?? []).map((e) => ({
    ...e,
    unit_name: unitNameByLogId.get(e.unit_log_id) ?? "",
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/10 px-6 py-4 dark:border-white/10">
        <Link href={`/incidents/${incident.id}`} className="text-sm text-zinc-500 hover:underline">
          ← {incident.name}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
              After Action Review
            </h1>
            <p className="text-sm text-zinc-500">
              {incident.name}
              {!canEdit && " · read-only (different facility)"}
            </p>
          </div>
          <Link
            href={`/incidents/${incident.id}/aar/report`}
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
          >
            View report
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <AarEditor
          incidentId={incident.id}
          incidentName={incident.name}
          incidentDate={incident.incident_date}
          incidentType={incident.type}
          facilityName={facilityOrg?.name ?? ""}
          systemName={systemOrg?.name ?? null}
          aar={aar ?? null}
          actionItems={actionItems ?? []}
          coreElementNotes={coreElementNotes ?? []}
          commandHighlights={commandHighlights ?? []}
          coordinationRoles={coordinationRoles ?? []}
          timeline={timeline}
          canEdit={canEdit}
        />
      </main>
    </div>
  );
}
