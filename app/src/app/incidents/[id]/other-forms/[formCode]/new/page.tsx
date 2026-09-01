import Link from "next/link";
import { notFound } from "next/navigation";
import { otherFormByCode } from "@/lib/other-forms";
import { OtherFormEditor } from "../../other-form-editor";

export default async function NewOtherFormPage({
  params,
}: {
  params: Promise<{ id: string; formCode: string }>;
}) {
  const { id, formCode } = await params;
  const def = otherFormByCode(formCode);
  if (!def) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <Link href={`/incidents/${id}/other-forms/${formCode}`} className="text-sm underline">
          ← {def.code}
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
          New {def.code} — {def.title}
        </h1>
      </div>

      <OtherFormEditor def={def} incidentId={id} />
    </main>
  );
}
