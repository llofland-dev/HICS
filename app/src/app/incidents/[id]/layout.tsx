import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Incident, Profile } from "@/lib/supabase/types";
import { TopBar } from "@/components/top-bar";
import { STATUS_BADGE } from "@/lib/brand";
import { CloseIncidentButton } from "./close-incident-button";
import { IncidentNav } from "./incident-nav";

export default async function IncidentLayout({ children, params }: LayoutProps<"/incidents/[id]">) {
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black print:bg-white">
      <TopBar
        title={incident.name}
        backHref="/"
        backLabel="Incidents"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {incident.incident_date} · {incident.type}
              {!canEdit && " · read-only (different facility)"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[incident.status] ?? "bg-white/10 text-white"}`}
            >
              {incident.status}
            </span>
          </span>
        }
        actions={
          canEdit && incident.status === "active" ? (
            <CloseIncidentButton incidentId={incident.id} />
          ) : undefined
        }
      />

      <IncidentNav incidentId={incident.id} />

      {children}
    </div>
  );
}
