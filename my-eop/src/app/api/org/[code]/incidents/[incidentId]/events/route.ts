import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChecklistEvent } from "@/lib/supabase/types";

// Read-only export for another system (e.g. MEDICS's AAR tooling) to pull an
// incident's checklist activity as evidence. Service-to-service, not a
// browser request — authenticated by a static bearer token rather than the
// staff session cookie. Wiring an actual caller up to this (MEDICS-side org
// mapping + AAR import UI) is separate, future work in that project.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string; incidentId: string }> }
) {
  const expected = process.env.EOP_EXPORT_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Export not configured" }, { status: 501 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { code, incidentId } = await params;
  const admin = createAdminClient();

  const { data: org } = await admin.from("organizations").select("id").eq("org_code", code).maybeSingle<{ id: string }>();
  if (!org) {
    return NextResponse.json({ error: "Unknown org" }, { status: 404 });
  }

  const { data: incident } = await admin
    .from("incidents")
    .select("id, org_id, name, status, started_at, closed_at")
    .eq("id", incidentId)
    .eq("org_id", org.id)
    .maybeSingle();
  if (!incident) {
    return NextResponse.json({ error: "Unknown incident" }, { status: 404 });
  }

  const { data: events } = await admin
    .from("checklist_events")
    .select("id, org_id, incident_id, checklist_id, checklist_item_id, item_text, action, actor_name, created_at")
    .eq("incident_id", incidentId)
    .eq("org_id", org.id)
    .order("created_at")
    .returns<ChecklistEvent[]>();

  return NextResponse.json({ incident, events: events ?? [] });
}
