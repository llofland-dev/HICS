// Re-homes the 4 already-seeded JAS checklists under the new nested
// structure: HICS (home_category) -> "Job Action Sheets" (subcategory) ->
// the 4 role checklists, per the user's clarification that JAS should not
// be its own top-level tile.
//
// Usage: node --env-file=.env.local scripts/move-jas-under-hics.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: updated, error } = await supabase
  .from("checklists")
  .update({ home_category: "hics", subcategory: "Job Action Sheets" })
  .eq("home_category", "jas")
  .select("title");

if (error) throw error;
console.log(`Updated ${updated.length} checklists:`, updated.map((c) => c.title).join(", "));
