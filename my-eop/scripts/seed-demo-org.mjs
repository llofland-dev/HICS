// Sales-demo organization: same structure/features as a real org (categories,
// colors, subcategories, pinned contact, forms, checklists), but every
// number/name is an obvious placeholder — never real customer data. Safe to
// show a prospect without exposing Adventist's actual contacts or procedures.
//
// Usage: node --env-file=.env.local scripts/seed-demo-org.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: org, error: orgError } = await supabase
  .from("organizations")
  .insert({ name: "Sample Regional Hospital", org_code: "DEMO" })
  .select("id")
  .single();
if (orgError) throw orgError;
console.log("Created demo org:", org.id);

// ---- Codes: one sample section ----
const { data: codeSection, error: codeSectionError } = await supabase
  .from("plan_sections")
  .insert({
    org_id: org.id,
    title: "Code Red — Fire",
    color_key: "red",
    category: "codes",
    sort_order: 1,
  })
  .select("id")
  .single();
if (codeSectionError) throw codeSectionError;

await supabase.from("plan_pages").insert({
  org_id: org.id,
  section_id: codeSection.id,
  title: "Fire Response",
  sort_order: 1,
  body: `If a fire is discovered:

**R-A-C-E**
- **R**escue anyone in immediate danger
- **A**larm: activate the pull station, call Security at ext. 1234
- **C**ontain by closing doors and windows
- **E**xtinguish if possible, or evacuate

**P-A-S-S** (for using an extinguisher)
- **P**ull the pin
- **A**im at the base of the fire
- **S**queeze the handle
- **S**weep side to side

*This is placeholder sample content for demonstration purposes.*`,
});

// ---- HICS / Job Action Sheets: one sample checklist ----
const { data: jasChecklist, error: jasError } = await supabase
  .from("checklists")
  .insert({
    org_id: org.id,
    title: "Incident Commander",
    description: "Sample Job Action Sheet — organize and direct the response to an incident.",
    category: "Command Staff",
    home_category: "hics",
    subcategory: "Job Action Sheets",
    sort_order: 1,
  })
  .select("id")
  .single();
if (jasError) throw jasError;

await supabase.from("checklist_items").insert(
  [
    "PHASE: Immediate Response",
    "Receive appointment and review this Job Action Sheet",
    "Put on position identification",
    "Assess the situation and activate the Emergency Operations Plan",
    "Determine which Command Staff positions need to be activated",
    "PHASE: Sustained Operations",
    "Conduct regular briefings with your team",
    "Document key decisions and actions",
    "PHASE: Demobilization",
    "Return staff to normal duties as the incident resolves",
    "Complete after-action documentation",
  ].map((text, i) => ({ org_id: org.id, checklist_id: jasChecklist.id, text, sort_order: i + 1 }))
);

// ---- POTS: one sample facility ----
const { data: potsSection, error: potsSectionError } = await supabase
  .from("plan_sections")
  .insert({
    org_id: org.id,
    title: "POTS Lines",
    category: "pots",
    sort_order: 1,
  })
  .select("id")
  .single();
if (potsSectionError) throw potsSectionError;

await supabase.from("plan_pages").insert({
  org_id: org.id,
  section_id: potsSection.id,
  title: "Sample Facility",
  sort_order: 1,
  body: `| Department | Number |
| --- | --- |
| Front Desk | 555-010-0100 |
| Nursing Station A | 555-010-0101 |
| Nursing Station B | 555-010-0102 |
| Security | 555-010-0103 |
| Command Center | 555-010-0104 |`,
});

// ---- Contacts ----
await supabase.from("contacts").insert([
  {
    org_id: org.id,
    name: "Jordan Sample",
    role_title: "Administrator on Call",
    phone: "555-010-0200",
    email: "aoc@example.com",
    pinned: true,
    sort_order: 1,
  },
  {
    org_id: org.id,
    name: "Casey Example",
    role_title: "Security Director",
    phone: "555-010-0201",
    email: "security@example.com",
    pinned: false,
    sort_order: 2,
  },
  {
    org_id: org.id,
    name: "Riley Placeholder",
    role_title: "Chief Nursing Officer",
    phone: "555-010-0202",
    email: "cno@example.com",
    pinned: false,
    sort_order: 3,
  },
]);

// ---- Forms ----
await supabase.from("forms").insert({
  org_id: org.id,
  title: "Incident Report",
  description: "Sample fillable form — staff complete this and email it in.",
  recipient_email: "incidents@example.com",
  sort_order: 1,
  fields: [
    { id: "f1", label: "Your name", type: "text", required: true },
    { id: "f2", label: "Location", type: "text", required: true },
    { id: "f3", label: "Description", type: "textarea", required: true },
    { id: "f4", label: "Callback number", type: "phone", required: false },
  ],
});

// ---- Checklists (generic, no home tile) ----
const { data: evacChecklist, error: evacError } = await supabase
  .from("checklists")
  .insert({
    org_id: org.id,
    title: "Evacuation Checklist",
    sort_order: 2,
  })
  .select("id")
  .single();
if (evacError) throw evacError;

await supabase.from("checklist_items").insert(
  ["Account for all staff and visitors", "Close doors and windows if safe to do so", "Proceed to the designated assembly point"].map(
    (text, i) => ({ org_id: org.id, checklist_id: evacChecklist.id, text, sort_order: i + 1 })
  )
);

console.log("Demo org seeded. Plan code: DEMO");
