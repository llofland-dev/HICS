import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OtherFormSubmission, Profile, Incident } from "@/lib/supabase/types";
import { otherFormByCode, summarizeSubmission } from "@/lib/other-forms";
import { BRAND } from "@/lib/brand";

export default async function OtherFormTypePage({
  params,
}: {
  params: Promise<{ id: string; formCode: string }>;
}) {
  const { id, formCode } = await params;
  const def = otherFormByCode(formCode);
  if (!def) notFound();

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

  const { data: submissions } = await supabase
    .from("other_form_submissions")
    .select("id, incident_id, form_code, data, created_by, created_at, updated_at")
    .eq("incident_id", id)
    .eq("form_code", formCode)
    .order("created_at", { ascending: false })
    .returns<OtherFormSubmission[]>();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <Link href={`/incidents/${id}/other-forms`} className="text-sm underline">
          ← Other Forms
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
          {def.code} — {def.title}
        </h1>
        <p className="text-sm text-zinc-500">{def.purpose}</p>
      </div>

      {canEdit && (
        <Link href={`/incidents/${id}/other-forms/${formCode}/new`} className={`mb-4 inline-block ${BRAND.buttonClassSm}`}>
          New {def.title}
        </Link>
      )}

      {!submissions || submissions.length === 0 ? (
        <p className="text-sm text-zinc-500">No submissions yet.</p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950">
          {submissions.map((s) => (
            <li key={s.id} className="p-3">
              <Link href={`/incidents/${id}/other-forms/${formCode}/${s.id}`} className="text-sm underline">
                {new Date(s.created_at).toLocaleString()}
              </Link>
              {summarizeSubmission(def, s.data) && (
                <p className="text-xs text-zinc-500">{summarizeSubmission(def, s.data)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
