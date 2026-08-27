import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Incident } from "@/lib/supabase/types";

// Read-only list of an org's incidents, for another system (MEDICS) to show
// a picker before pulling one incident's full events via the sibling
// [incidentId]/events route. Same bearer-token, service-to-service auth.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const expected = process.env.EOP_EXPORT_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Export not configured" }, { status: 501 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { code } = await params;
  const admin = createAdminClient();

  const { data: org } = await admin.from("organizations").select("id").eq("org_code", code).maybeSingle<{ id: string }>();
  if (!org) {
    return NextResponse.json({ error: "Unknown org" }, { status: 404 });
  }

  const { data: incidents } = await admin
    .from("incidents")
    .select("id, org_id, name, status, started_at, closed_at")
    .eq("org_id", org.id)
    .order("started_at", { ascending: false })
    .returns<Incident[]>();

  return NextResponse.json({ incidents: incidents ?? [] });
}
