import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Ics215aAnalysis,
  Ics215aHazard,
  Incident,
  OperationalPeriod,
  Profile,
} from "@/lib/supabase/types";
import { Ics215aPanel } from "./ics215a-panel";

export default async function Ics215aPage({
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

  const [{ data: analysis }, { data: hazards }] = selectedPeriod
    ? await Promise.all([
        supabase
          .from("ics215a_analyses")
          .select("*")
          .eq("operational_period_id", selectedPeriod.id)
          .maybeSingle<Ics215aAnalysis>(),
        supabase
          .from("ics215a_hazards")
          .select("*")
          .eq("operational_period_id", selectedPeriod.id)
          .order("sort_order", { ascending: true })
          .returns<Ics215aHazard[]>(),
      ])
    : [{ data: null }, { data: [] as Ics215aHazard[] }];

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          HICS 215A IAP Safety Analysis
        </h1>
        <p className="text-sm text-zinc-500">
          {selectedPeriod && `Operational Period ${selectedPeriod.period_number}`}
          {!canEdit && " · read-only (different facility)"}
        </p>
      </div>

      {selectedPeriod ? (
        <>
          <p className="text-xs text-zinc-500">
            2. Operational Period: {selectedPeriod.date_from} {selectedPeriod.time_from} →{" "}
            {selectedPeriod.date_to ?? "(active)"} {selectedPeriod.time_to ?? ""}
          </p>

          <Ics215aPanel
            operationalPeriodId={selectedPeriod.id}
            analysis={analysis}
            hazards={hazards ?? []}
            canEdit={canEdit}
          />
        </>
      ) : (
        <p className="text-sm text-zinc-500">No operational period found for this incident.</p>
      )}
    </main>
  );
}
