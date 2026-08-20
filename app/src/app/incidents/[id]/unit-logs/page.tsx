import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Incident,
  Position,
  Profile,
  UnitLog,
  UnitLogEntry,
  UnitLogResource,
} from "@/lib/supabase/types";
import { UnitLogsPanel } from "./unit-logs-panel";

export default async function UnitLogsPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [{ data: positions }, { data: unitLogs }] = await Promise.all([
    supabase
      .from("positions")
      .select("code, title, section, reports_to_code, tier, description")
      .returns<Position[]>(),
    supabase
      .from("unit_logs")
      .select(
        "id, incident_id, unit_name, position_code, leader_name, home_agency, op_period_date_from, op_period_date_to, op_period_time_from, op_period_time_to, prepared_by_name, prepared_by_position, prepared_by_signature, prepared_at, created_at"
      )
      .eq("incident_id", incident.id)
      .order("created_at", { ascending: false })
      .returns<UnitLog[]>(),
  ]);

  const unitLogIds = (unitLogs ?? []).map((u) => u.id);

  const [{ data: resources }, { data: entries }] = await Promise.all([
    unitLogIds.length
      ? supabase
          .from("unit_log_resources")
          .select("id, unit_log_id, name, ics_position, home_agency")
          .in("unit_log_id", unitLogIds)
          .returns<UnitLogResource[]>()
      : Promise.resolve({ data: [] as UnitLogResource[] }),
    unitLogIds.length
      ? supabase
          .from("unit_log_entries")
          .select("id, unit_log_id, entry_date, entry_time, notable_activity, created_at")
          .in("unit_log_id", unitLogIds)
          .order("entry_date", { ascending: true })
          .order("entry_time", { ascending: true })
          .returns<UnitLogEntry[]>()
      : Promise.resolve({ data: [] as UnitLogEntry[] }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Unit Activity Logs (HICS 214)</h1>
        {!canEdit && <p className="text-sm text-zinc-500">Read-only (different facility)</p>}
      </div>

      <UnitLogsPanel
        incidentId={incident.id}
        positions={positions ?? []}
        unitLogs={unitLogs ?? []}
        resources={resources ?? []}
        entries={entries ?? []}
        canEdit={canEdit}
      />
    </main>
  );
}
