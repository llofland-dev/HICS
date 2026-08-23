// Loads "Facilities POTS.xlsx" (POTS lines backlog item 5) into TESTORG as a
// dedicated reference section — one table page per facility, matching the
// source workbook's own per-sheet organization. The "Combined" sheet in the
// source is just a print layout of the same 5 facilities side by side, so
// it's skipped (same reasoning as the Code Orange/Earthquake print-column
// docs) in favor of the 6 real per-facility sheets.
//
// Usage: node --env-file=.env.local scripts/seed-pots-lines.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// [label, [[department, number], ...]]
const FACILITIES = [
  [
    // Replaced with the "Emergency Lines All July 29-2026(SGMC).csv" update
    // the user sent — supersedes the SGMC sheet in the original xlsx
    // (adds the new PCU/Med-Surg floors and CVIR suite, replaces the old
    // generic ED bay numbers with room-level ones).
    "SGMC",
    [
      ["2 D Nursing Station", "301-294-4108"],
      ["2nd Fl. A/B Main Desk, Tower", "301-340-3510"],
      ["2nd Fl. Med Room B, Tower", "301-340-3511"],
      ["2nd Fl. Med Room A, Tower", "301-340-3512"],
      ["3 East Nursing Station / Rapid Response Desk", "301-294-4111"],
      ["3rd Floor Main Desk", "301-340-3513"],
      ["3rd Floor Mother Baby Desk", "301-340-3514"],
      ["3rd Floor Nursery A, Tower", "301-340-3515"],
      ["3rd Floor Nursery B, Tower", "301-340-3516"],
      ["4C Flex Nursing Station", "301-424-7567"],
      ["4 D Nursing Station", "301-340-6784"],
      ["4th Fl. A/B Main", "301-340-3517"],
      ["4th Fl. Med Room A, Tower", "301-340-3518"],
      ["4th Fl. Med Room B, Tower", "301-340-3519"],
      ["4H027 Front N/S PCU", "240-328-6166"],
      ["4H037 Mid N/S PCU", "240-328-6230"],
      ["4H047 Rear N/S PCU", "240-328-6243"],
      ["5H027 Front N/S Med/Surg", "240-328-6232"],
      ["5H037 Mid N/S Med/Surg", "240-328-6277"],
      ["5H047 Rear N/S Med/Surg", "240-328-6178"],
      ["Bed Board", "301-309-1365"],
      ["Admitting", "301-294-4110"],
      ["Aspen Room (Command Center)", "301-340-7102"],
      ["Aspen Room (Command Center)", "301-340-7103"],
      ["Cardiac Rehab – 9715 Med Ctr", "301-309-6540"],
      ["Cath Lab Control Desk, 3rd Floor", "301-294-4107"],
      ["CVIR Nurse Station", "240-328-6146"],
      ["CVIR Control 1", "240-328-6190"],
      ["CVIR Control 2", "240-328-6213"],
      ["CVIR Control 3", "240-328-6252"],
      ["Dietary", "301-340-3524"],
      ["ED Triage", "240-328-6196"],
      ["ED Supertrack (MITU)", "240-328-6236"],
      ["ED 2H052 Front N/S", "240-328-6218"],
      ["ED 2H038 Mid N/S", "240-328-6258"],
      ["ED 2H047 Rear N/S", "240-328-6148"],
      ["Emergency Department – Peds", "301-294-4124"],
      ["Emergency Department – Psych ED EPTU", "301-294-4100"],
      ["Emergency Department – Psych ED PEPTU", "301-279-9635"],
      ["Executive Offices", "301-279-2965"],
      ["ICU 3H029 Front N/S", "240-328-6274"],
      ["ICU 3H039 Mid N/S", "240-328-6158"],
      ["ICU 3H048 Rear N/S", "240-328-6228"],
      ["Lab", "301-294-4105"],
      ["Lab – Blood Bank", "301-217-9270"],
      ["Labor & Delivery", "301-294-4113"],
      ["Materials Management", "301-294-4114"],
      ["NICU", "301-294-4120"],
      ["Nursing Administration", "301-294-4115"],
      ["Pediatrics", "301-294-4112"],
      ["Pharmacy", "301-294-4123"],
      ["PI Conf Room/Med Staff", "301-294-4126"],
      ["Power Plant", "204-907-2977"],
      ["Radiology Lab Reception Desk", "301-294-4122"],
      ["Security Office", "301-762-2270"],
      ["Sterile Processing", "301-294-4125"],
      ["Surgery – OR Control Desk", "301-294-4106"],
      ["Surgery – PACU I", "301-294-4121"],
      ["Surgery – PACU II", "301-340-3520"],
      ["Surgery – Pre-Op", "301-340-3521"],
      ["Surgery – Peds SDS", "301-340-3522"],
      ["Surgery – Reception", "301-340-3523"],
      ["Telecommunications/Frame Room", "301-279-7543"],
      ["Telecommunications/Hospital Operators 1", "301-762-3453"],
      ["Telecommunications/Hospital Operators 2", "301-279-7368"],
      ["Telecommunications/Hospital Operators 3", "301-279-7859"],
    ],
  ],
  [
    "Adventist Behavioral Health – Rockville",
    [
      ["ABH Front Desk", "301-309-1838"],
      ["Azalea Unit Station", "301-251-1119"],
      ["Chesapeake Unit Station", "301-762-4625"],
      ["Command Ctr Conf Rm", "301-424-3508"],
      ["Cypress Unit Nurses Station", "301-294-4143"],
      ["Dietary", "301-251-6314"],
      ["Magnolia Unit Station", "301-315-0345"],
      ["Montgomery Unit Station", "301-309-6758"],
      ["Potomac Nursing Station", "301-251-9658"],
      ["Seneca Unit Station", "301-294-2307"],
      ["Shenandoah Unit Station", "301-251-0710"],
    ],
  ],
  [
    "Rehab – Rockville",
    [
      ["1st Floor Reception Desk", "240-314-0530"],
      ["2nd Floor Nurses Station", "240-314-0531"],
      ["Pharmacy", "240-314-7091"],
      ["Dialysis", "240-314-7092"],
      ["Admin Conference Room", "240-314-7093"],
      ["Dietary", "301-838-3005"],
    ],
  ],
  [
    "Germantown Emergency Center",
    [
      ["ED Nurses Station", "301-540-0298"],
      ["ED Registration", "301-540-5015"],
      ["Germantown Outpatient Imaging", "301-540-8439"],
      ["Main IT Closet", "301-540-8936"],
    ],
  ],
  [
    "White Oak Medical Center",
    [
      ["Board Room (Command Center)", "301-572-5179"],
      ["Security", "301-572-1910"],
      ["Rad Admin", "301-572-1987"],
      ["Radiology Nurses Station", "301-572-4276"],
      ["ED Charting", "301-572-4235"],
      ["ED Nurses Station", "301-572-4748"],
      ["ED Charting", "301-572-4952"],
      ["EMS Staff Room", "301-572-4704"],
      ["CD Charting", "301-572-4745"],
      ["CD Charting", "301-572-4705"],
      ["OR Control", "301-572-7680"],
      ["Pre-Op/PACU Nurses Station", "301-572-5069"],
      ["2N Charting ICU", "301-572-7876"],
      ["2N Charting ICU", "301-572-7895"],
      ["2N Charting ICU", "301-572-7897"],
      ["Echo Techs", "301-572-1509"],
      ["Transcare Nurses Station", "301-572-7950"],
      ["Transcare Nurses Station", "301-572-7982"],
      ["3N Charting", "301-572-5182"],
      ["3N Charting", "301-572-5095"],
      ["Telemetry", "301-572-5058"],
      ["L&D Charting", "301-572-5056"],
      ["L&D Charting", "301-572-5184"],
      ["L&D Charting", "301-572-5189"],
      ["Nursery Charting", "301-572-7937"],
      ["Mother/Baby Nurses Station", "301-572-7939"],
      ["Phys Rehab Charting", "301-572-1975"],
      ["Dialysis Nurses Station", "301-572-1949"],
      ["House Operators", "301-572-8130"],
      ["House Operators", "301-572-8131"],
      ["House Operators", "301-572-8132"],
      ["5N Charting", "301-572-4693"],
      ["5N Charting", "301-572-4695"],
      ["6N Nurses Station", "301-572-4740"],
      ["6N Charting", "301-572-7650"],
      ["6S Nurses Station", "301-572-5150"],
      ["7N Charting", "301-572-5092"],
      ["7N Charting", "301-572-5085"],
      ["7S Nurses Station", "301-572-1580"],
      ["8S Observation", "301-572-4282"],
      ["8S Med/Surg", "301-572-5230"],
      ["Blood Bank", "301-572-4215"],
      ["Core Lab", "301-572-1510"],
      ["CSS", "301-572-5180"],
      ["Materials Management", "301-572-1912"],
      ["Pharmacists", "301-572-5130"],
      ["Pharmacy Techs", "301-572-5063"],
      ["Power Plant", "301-572-5061"],
    ],
  ],
  [
    "Fort Washington Medical Center",
    [
      ["Pastoral Care", "301-203-7781"],
      ["Executive Office", "301-203-7636"],
      ["President's Office", "301-203-7686"],
      ["Boardroom (Command Center)", "301-203-7549"],
      ["Pharmacy", "301-203-8349"],
      ["ICU", "301-203-8310"],
      ["Emergency Dept", "301-203-6312"],
      ["Reception/Security #1", "301-292-2092"],
      ["Radiology Reception", "301-203-6669"],
      ["Lab – Blood Bank", "301-203-6470"],
      ["Nursing Admin", "301-203-7958"],
      ["OR – Reception", "301-292-3751"],
      ["CT Scan", "301-292-7990"],
      ["2 East", "301-292-8664"],
      ["HR", "301-203-4859"],
      ["Materials Management", "301-203-3423"],
      ["Lantz Bldg – 1st Floor", "301-203-0027"],
      ["Lantz Bldg – 2nd Floor", "301-203-0031"],
    ],
  ],
];

function toTable(rows) {
  const header = "| Department | Number |\n| --- | --- |\n";
  return header + rows.map(([dept, num]) => `| ${dept} | ${num} |`).join("\n") + "\n";
}

async function main() {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("org_code", "TESTORG")
    .single();
  if (orgError) throw orgError;

  const { data: existing, error: existingError } = await supabase
    .from("plan_sections")
    .select("sort_order")
    .eq("org_id", org.id);
  if (existingError) throw existingError;
  const nextOrder = existing.reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;

  const { data: section, error: sectionError } = await supabase
    .from("plan_sections")
    .insert({ org_id: org.id, title: "POTS Lines", color_key: null, sort_order: nextOrder })
    .select("id")
    .single();
  if (sectionError) throw sectionError;

  let pageOrder = 1;
  for (const [facility, rows] of FACILITIES) {
    const { error: pageError } = await supabase.from("plan_pages").insert({
      org_id: org.id,
      section_id: section.id,
      title: facility,
      body: toTable(rows),
      sort_order: pageOrder++,
    });
    if (pageError) throw pageError;
    console.log(`Added page "${facility}" with ${rows.length} lines`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
