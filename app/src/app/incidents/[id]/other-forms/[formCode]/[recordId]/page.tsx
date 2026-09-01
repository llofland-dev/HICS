import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OtherFormSubmission } from "@/lib/supabase/types";
import { otherFormByCode } from "@/lib/other-forms";
import { OtherFormEditor } from "../../other-form-editor";
import { PrintButton } from "../../../ics203/print-button";

export default async function OtherFormRecordPage({
  params,
}: {
  params: Promise<{ id: string; formCode: string; recordId: string }>;
}) {
  const { id, formCode, recordId } = await params;
  const def = otherFormByCode(formCode);
  if (!def) notFound();

  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("other_form_submissions")
    .select("id, incident_id, form_code, data, created_by, created_at, updated_at")
    .eq("id", recordId)
    .eq("incident_id", id)
    .maybeSingle<OtherFormSubmission>();
  if (!submission) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link href={`/incidents/${id}/other-forms/${formCode}`} className="text-sm underline">
            ← {def.code}
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
            {def.code} — {def.title}
          </h1>
          <p className="text-xs text-zinc-500">
            Created {new Date(submission.created_at).toLocaleString()}
          </p>
        </div>
        <PrintButton />
      </div>

      <h1 className="mb-4 hidden text-lg font-semibold print:block">
        {def.code} — {def.title}
      </h1>

      <OtherFormEditor def={def} incidentId={id} recordId={recordId} initialData={submission.data} />
    </main>
  );
}
