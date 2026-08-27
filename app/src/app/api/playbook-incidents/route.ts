import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/lib/supabase/types";

// Lists the Playbook incidents available to import from, for the caller's
// own facility. Server-only: PLAYBOOK_EXPORT_TOKEN never reaches the
// browser, this route calls Playbook on the client's behalf.
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
    return NextResponse.json({ connected: false });
  }

  const baseUrl = process.env.PLAYBOOK_API_BASE_URL;
  const token = process.env.PLAYBOOK_EXPORT_TOKEN;
  if (!baseUrl || !token) {
    return NextResponse.json({ error: "Playbook import not configured" }, { status: 501 });
  }

  const res = await fetch(`${baseUrl}/api/org/${org.playbook_org_code}/incidents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Could not reach Playbook" }, { status: 502 });
  }

  const body = await res.json();
  return NextResponse.json({ connected: true, incidents: body.incidents ?? [] });
}
