import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OTHER_FORMS } from "@/lib/other-forms";

export default async function OtherFormsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("other_form_submissions")
    .select("form_code")
    .eq("incident_id", id);

  const counts = new Map<string, number>();
  for (const row of submissions ?? []) {
    counts.set(row.form_code, (counts.get(row.form_code) ?? 0) + 1);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Other Forms</h1>
        <p className="text-sm text-zinc-500">
          Additional HICS forms, filled and saved against this incident.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OTHER_FORMS.map((def) => {
          const count = counts.get(def.code) ?? 0;
          return (
            <Link
              key={def.code}
              href={`/incidents/${id}/other-forms/${def.code}`}
              className="rounded-lg border border-black/10 bg-white p-4 hover:bg-black/5 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-white/5"
            >
              <p className="text-xs font-medium text-zinc-500">{def.code}</p>
              <p className="font-medium text-black dark:text-zinc-50">{def.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{def.purpose}</p>
              <p className="mt-2 text-xs text-zinc-400">
                {count === 0 ? "No submissions yet" : `${count} submission${count === 1 ? "" : "s"}`}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
