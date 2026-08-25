// "First-Time Incident Commander Walk-Through" checklist, transcribed from
// the source docx. Unlike the per-role Job Action Sheets, this is a general
// onboarding/confidence-building guide for whoever ends up first-on-scene
// and has to assume command — so it sits directly under the HICS tile
// (home_category: 'hics', subcategory: null), alongside the "Job Action
// Sheets" subcategory group rather than inside it.
//
// Transcription: the source has no numbered rows or "Responsible" column
// (it's written to one reader, the person stepping into command), so items
// are numbered sequentially here for the checklist UI rather than carrying
// forward the source's own numbering. Framing/context paragraphs that
// aren't actions become NOTE: items, consistent with the convention used
// on the other HICS/IC checklists.
//
// Usage: node --env-file=.env.local scripts/seed-first-time-ic-walkthrough.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CHECKLIST = {
  title: "First-Time Incident Commander Walk-Through",
  description: "A guided sequence for anyone assuming command — even if you've never done it before.",
  home_category: "hics",
  subcategory: null,
  sort_order: 1,
  items: [
    "NOTE: Before you start — You do not need to check every box. This is a memory-jogger, not a test. If you're the first qualified person on scene, you ARE the Incident Commander — even temporarily. It's okay to say out loud: \"I'm establishing command. Here's what I know so far.\" You can hand off command to someone more senior the moment they arrive — just say so clearly.",

    "PHASE: Step 1 — Say It Out Loud (First 2 minutes)",
    "1. State that you are assuming command — Say it to whoever is around: \"I'm [name], I'm establishing Incident Command.\" It doesn't need to be formal.",
    "2. Put on your ID vest or badge if one is available — So people know who to come to with questions.",
    "3. Note the time — Just glance at a clock or your phone. Say it out loud or write it down — this becomes your timeline later.",
    "4. Establish a Command Post — most hospitals have a designated room or location — Doesn't need to be fancy. A nurses' station, an office, a hallway corner — just somewhere people can find you.",

    "PHASE: Step 2 — Ask Yourself Four Questions (Next 5–10 minutes)",
    "5. What happened? — One or two sentences is enough right now.",
    "6. Who or what is affected? — Patients, staff, a unit, a building, IT systems, etc.",
    "7. Is anyone in immediate danger right now? — If yes, this drives everything else. Protective action (evacuate, lockdown, shelter) comes before anything administrative.",
    "8. What has already been done? — Has anyone called security, activated a code, called 911? Find out so you're not duplicating or missing something.",

    "PHASE: Step 3 — Get Word Out (Next 5 minutes)",
    "9. Make sure the right notification/code has gone out — If you're not sure, ask the House Supervisor, Clinical Administrator, or operator to confirm or repeat it.",
    "10. Call your Administrator on Call / EM Director — Even a quick \"here's what I know so far\" call is enough. They can help you figure out next steps.",
    "11. Make sure the President and other senior leadership are notified — This is often handled by the Administrator on Call or House Supervisor — confirm it's happening early rather than assuming someone else made the call.",
    "12. Ask: does anyone need to be called outside the building? — Fire, police, EMS, health department — you don't have to make these calls yourself, just make sure someone is.",

    "PHASE: Step 4 — Bring In Help, Only What You Need (Next 10 minutes)",
    "NOTE: You are not building an org chart. You're asking: who can help me right now? Ask yourself which of these you actually need — most incidents only need one or two. If you can't answer one of these questions confidently, that's the role you delegate first.",
    "13. \"Who can help me watch for hazards?\" — Safety Officer",
    "14. \"Who can talk to media or worried family members?\" — Public Information Officer",
    "15. \"Who's my contact if outside agencies show up?\" — Liaison Officer",
    "16. \"Who can direct the actual response — moving patients, staff, etc.?\" — Operations",
    "17. \"Who can keep track of what's happening and what's next?\" — Planning",
    "18. \"Who can get me supplies, staff, or equipment?\" — Logistics",

    "PHASE: Step 5 — Check In With Yourself (By minute 30)",
    "19. Say out loud (or write down) 1–3 things you want to happen next — This is your plan for the next chunk of time — it doesn't need a formal name.",
    "20. Tell everyone helping you when you'll check in again — \"Let's regroup in 20 minutes\" is enough.",
    "21. Make sure someone is writing things down — Times, decisions, who you called. You or someone else — just make sure it's happening.",
    "22. Ask yourself: is this bigger than I can handle alone? — If yes, that's your cue to call for more help or hand off command to someone more senior — that is not a failure, it's the system working.",

    "NOTE: Remember — Nobody expects a perfect performance. Command is a role, not a personality trait. Every experienced Incident Commander started with their first incident too. If you get stuck, go back to the four questions in Step 2 — they work at any point in an incident.",
  ],
};

const { data: org, error: orgError } = await supabase
  .from("organizations")
  .select("id")
  .eq("org_code", "ADVENTIST")
  .single();
if (orgError) throw orgError;

const { data: checklist, error: checklistError } = await supabase
  .from("checklists")
  .insert({
    org_id: org.id,
    title: CHECKLIST.title,
    description: CHECKLIST.description,
    home_category: CHECKLIST.home_category,
    subcategory: CHECKLIST.subcategory,
    sort_order: CHECKLIST.sort_order,
  })
  .select("id")
  .single();
if (checklistError) throw checklistError;

const rows = CHECKLIST.items.map((text, i) => ({
  org_id: org.id,
  checklist_id: checklist.id,
  text,
  sort_order: i + 1,
}));

const { error: itemsError } = await supabase.from("checklist_items").insert(rows);
if (itemsError) throw itemsError;

console.log(`Inserted "${CHECKLIST.title}" checklist with ${rows.length} items.`);
