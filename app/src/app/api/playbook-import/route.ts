import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/lib/supabase/types";

interface PlaybookEvent {
  item_text: string;
  action: "checked" | "unchecked";
  actor_name: string | null;
  created_at: string;
}

// Pulls one Playbook incident's checklist activity and lands it as a
// unit_logs/unit_log_entries record (HICS 214) on a MEDICS incident, so it
// shows up in the AAR editor's timeline with no changes needed there.
// Uses the caller's own authenticated (RLS-enforced) client for every
// write, not a service-role client -- the existing unit_logs_write /
// unit_log_entries_write policies (incident_is_own_facility) are what
// actually gate who can import into which incident.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { incidentId, playbookIncidentId } = (await request.json()) as {
    incidentId?: string;
    playbookIncidentId?: string;
  };
  if (!incidentId || !playbookIncidentId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (!profile?.org_id) {
    return NextResponse.json({ error: "No facility" }, { status: 400 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, type, parent_org_id, playbook_org_code, created_at")
    .eq("id", profile.org_id)
    .maybeSingle<Organization>();
  if (!org?.playbook_org_code) {
    return NextResponse.json({ error: "Not connected to a Playbook org" }, { status: 400 });
  }

  const baseUrl = process.env.PLAYBOOK_API_BASE_URL;
  const token = process.env.PLAYBOOK_EXPORT_TOKEN;
  if (!baseUrl || !token) {
    return NextResponse.json({ error: "Playbook import not configured" }, { status: 501 });
  }

  const res = await fetch(
    `${baseUrl}/api/org/${org.playbook_org_code}/incidents/${playbookIncidentId}/events`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    return NextResponse.json({ error: "Could not reach Playbook" }, { status: 502 });
  }

  const body = (await res.json()) as { incident: { name: string }; events: PlaybookEvent[] };

  const { data: unitLog, error: unitLogError } = await supabase
    .from("unit_logs")
    .insert({
      incident_id: incidentId,
      unit_name: `Playbook Import — ${body.incident.name}`,
    })
    .select("id")
    .single();

  if (unitLogError) {
    return NextResponse.json({ error: unitLogError.message }, { status: 500 });
  }

  const entries = body.events.map((event) => {
    const [entry_date, timePart] = event.created_at.split("T");
    const entry_time = timePart.slice(0, 5);
    const notable_activity =
      `${event.item_text} — ${event.action}` + (event.actor_name ? ` (${event.actor_name})` : "");
    return { unit_log_id: unitLog.id, entry_date, entry_time, notable_activity };
  });

  if (entries.length > 0) {
    const { error: entriesError } = await supabase.from("unit_log_entries").insert(entries);
    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, importedCount: entries.length });
}
