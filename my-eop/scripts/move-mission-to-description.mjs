// Moves the "MISSION: ..." checklist_item (present as item #1 on every JAS
// checklist seeded so far) into the new checklists.description column, and
// deletes that item row — a mission statement isn't a checkbox action.
//
// Usage: node --env-file=.env.local scripts/move-mission-to-description.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: missionItems, error } = await supabase
  .from("checklist_items")
  .select("id, checklist_id, text")
  .like("text", "MISSION:%");
if (error) throw error;

for (const item of missionItems) {
  const description = item.text.replace(/^MISSION:\s*/, "");

  const { error: updateError } = await supabase
    .from("checklists")
    .update({ description })
    .eq("id", item.checklist_id);
  if (updateError) throw updateError;

  const { error: deleteError } = await supabase.from("checklist_items").delete().eq("id", item.id);
  if (deleteError) throw deleteError;

  console.log(`Moved mission for checklist ${item.checklist_id}`);
}

console.log(`Done. Updated ${missionItems.length} checklists.`);
