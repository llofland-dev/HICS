import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Incident, Message, Position, Profile } from "@/lib/supabase/types";
import { MessagesPanel } from "./messages-panel";

export default async function MessagesPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [{ data: positions }, { data: messages }] = await Promise.all([
    supabase
      .from("positions")
      .select("code, title, section, reports_to_code, tier, description")
      .returns<Position[]>(),
    supabase
      .from("messages")
      .select(
        "id, incident_id, event_id, incident_name, to_name, to_position_code, from_name, from_position_code, subject, sent_date, sent_time, body, approved_by_name, approved_by_signature, approved_by_position, reply_body, replied_by_name, replied_by_position, reply_date, reply_time, created_at, created_by"
      )
      .eq("incident_id", incident.id)
      .order("created_at", { ascending: false })
      .returns<Message[]>(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">General Messages (HICS 213)</h1>
        {!canEdit && <p className="text-sm text-zinc-500">Read-only (different facility)</p>}
      </div>

      <MessagesPanel
        incidentId={incident.id}
        incidentName={incident.name}
        positions={positions ?? []}
        messages={messages ?? []}
        canEdit={canEdit}
      />
    </main>
  );
}
