import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Ics204AssignmentList,
  Ics204Objective,
  Ics204Unit,
  Incident,
  OperationalPeriod,
  Profile,
} from "@/lib/supabase/types";
import { Ics204Panel } from "./ics204-panel";

export default async function Ics204Page({
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

  const { data: periods } = await supabase
    .from("operational_periods")
    .select("id, incident_id, period_number, date_from, time_from, date_to, time_to, status, created_at")
    .eq("incident_id", incident.id)
    .order("period_number", { ascending: true })
    .returns<OperationalPeriod[]>();

  const selectedPeriod =
    (op ? periods?.find((p) => p.id === op) : undefined) ??
    periods?.find((p) => p.status === "active") ??
    periods?.[periods.length - 1] ??
    null;

  const { data: assignmentLists } = selectedPeriod
    ? await supabase
        .from("ics204_assignment_lists")
        .select("*")
        .eq("operational_period_id", selectedPeriod.id)
        .order("created_at", { ascending: true })
        .returns<Ics204AssignmentList[]>()
    : { data: [] as Ics204AssignmentList[] };

  const listIds = (assignmentLists ?? []).map((l) => l.id);

  const [{ data: objectives }, { data: units }] = listIds.length
    ? await Promise.all([
        supabase
          .from("ics204_objectives")
          .select("*")
          .in("assignment_list_id", listIds)
          .order("sort_order", { ascending: true })
          .returns<Ics204Objective[]>(),
        supabase
          .from("ics204_units")
          .select("*")
          .in("assignment_list_id", listIds)
          .order("sort_order", { ascending: true })
          .returns<Ics204Unit[]>(),
      ])
    : [{ data: [] as Ics204Objective[] }, { data: [] as Ics204Unit[] }];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div>
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Assignment Lists (HICS 204)</h1>
        <p className="text-sm text-zinc-500">
          {selectedPeriod && `Operational Period ${selectedPeriod.period_number}`}
          {!canEdit && " · read-only (different facility)"}
        </p>
      </div>

      {selectedPeriod ? (
        <Ics204Panel
          operationalPeriodId={selectedPeriod.id}
          periodNumber={selectedPeriod.period_number}
          periodDateFrom={selectedPeriod.date_from}
          periodTimeFrom={selectedPeriod.time_from}
          periodDateTo={selectedPeriod.date_to}
          periodTimeTo={selectedPeriod.time_to}
          assignmentLists={assignmentLists ?? []}
          objectives={objectives ?? []}
          units={units ?? []}
          canEdit={canEdit}
        />
      ) : (
        <p className="text-sm text-zinc-500">No operational period found for this incident.</p>
      )}
    </main>
  );
}
