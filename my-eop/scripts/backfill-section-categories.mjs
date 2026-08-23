// One-off backfill for the v4 categorized-home-screen migration
// (20260822090000_section_category.sql). Assigns every existing TESTORG
// plan_section a category so it's reachable from the new home-screen tiles:
// all real Code/reference content -> 'codes', POTS Lines -> 'pots'.
//
// Usage: node --env-file=.env.local scripts/backfill-section-categories.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: sections, error } = await supabase
  .from("plan_sections")
  .select("id, title, category");

if (error) throw error;

for (const section of sections) {
  const category = section.title === "POTS Lines" ? "pots" : "codes";
  if (section.category === category) continue;
  const { error: updateError } = await supabase
    .from("plan_sections")
    .update({ category })
    .eq("id", section.id);
  if (updateError) throw updateError;
  console.log(`${section.title} -> ${category}`);
}

console.log("Done.");
