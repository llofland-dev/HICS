import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Incident, Profile } from "@/lib/supabase/types";
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
      <header className="border-b border-black/10 px-6 py-4 print:hidden dark:border-white/10">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Incidents
        </Link>
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">{incident.name}</h1>
        <p className="text-sm text-zinc-500">
          {incident.incident_date} · {incident.type} · {incident.status}
          {!canEdit && " · read-only (different facility)"}
        </p>
      </header>

      <IncidentNav incidentId={incident.id} />

      {children}
    </div>
  );
}
