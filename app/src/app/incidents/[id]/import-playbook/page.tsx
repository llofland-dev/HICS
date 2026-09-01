import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Incident, Organization, Profile } from "@/lib/supabase/types";
import { ImportPlaybookPanel } from "./import-playbook-panel";

export default async function ImportPlaybookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: incident } = await supabase
    .from("incidents")
    .select("id, facility_org_id, event_id, playbook_incident_id, name, incident_date, type, status, created_at")
    .eq("id", id)
    .maybeSingle<Incident>();
  if (!incident) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const canEdit = profile?.org_id === incident.facility_org_id;

  const { data: org } = profile?.org_id
    ? await supabase
        .from("organizations")
        .select("id, name, type, parent_org_id, playbook_org_code, created_at")
        .eq("id", profile.org_id)
        .maybeSingle<Organization>()
    : { data: null };

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Import from Playbook</h1>
        <p className="text-sm text-zinc-500">
          Pull an incident&apos;s checklist activity in from Playbook as a HICS 214 unit log, so it
          shows up in this incident&apos;s AAR timeline.
        </p>
        {!canEdit && <p className="mt-1 text-sm text-zinc-500">Read-only (different facility)</p>}
      </div>

      <ImportPlaybookPanel
        incidentId={incident.id}
        orgId={profile?.org_id ?? null}
        playbookOrgCode={org?.playbook_org_code ?? null}
        playbookIncidentId={incident.playbook_incident_id}
        isSystemAdmin={profile?.role === "system_admin"}
        canEdit={canEdit}
      />
    </main>
  );
}
