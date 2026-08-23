import { notFound, redirect } from "next/navigation";
import { getVerifiedOrg } from "@/lib/eop-org";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Checklist, ChecklistItem } from "@/lib/supabase/types";
import { PlanHeader } from "../../plan-header";
import { ChecklistRunner } from "./checklist-runner";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ code: string; checklistId: string }>;
}) {
  const { code, checklistId } = await params;
  const org = await getVerifiedOrg(code);
  if (!org) redirect(`/plan/${code}`);

  const admin = createAdminClient();

  const [{ data: checklist }, { data: items }] = await Promise.all([
    admin
      .from("checklists")
      .select("id, org_id, title, description, category, home_category, subcategory, sort_order, created_at")
      .eq("id", checklistId)
      .eq("org_id", org.id)
      .maybeSingle<Checklist>(),
    admin
      .from("checklist_items")
      .select("id, checklist_id, org_id, text, sort_order")
      .eq("checklist_id", checklistId)
      .eq("org_id", org.id)
      .order("sort_order")
      .returns<ChecklistItem[]>(),
  ]);

  if (!checklist) notFound();

  const backHref = checklist.home_category
    ? checklist.subcategory
      ? `/plan/${code}/categories/${checklist.home_category}/${encodeURIComponent(checklist.subcategory)}`
      : `/plan/${code}/categories/${checklist.home_category}`
    : `/plan/${code}/checklists`;

  return (
    <div>
      <PlanHeader title={checklist.title} backHref={backHref} logoUrl={org.logoUrl} />

      <div className="mx-auto w-full max-w-lg space-y-6 p-4">
        {checklist.description && (
          <p className="rounded-xl bg-white p-4 text-sm text-zinc-700 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
            {checklist.description}
          </p>
        )}
        <ChecklistRunner checklist={checklist} items={items ?? []} />
      </div>
    </div>
  );
}
