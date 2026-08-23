// One-off script to seed sample real content (Code Red + Systems Failure)
// into the TESTORG org for review, per the v3 plan's scope boundary — not a
// permanent part of the app, delete after running.
//
// Usage: node --env-file=.env.local scripts/seed-sample-content.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CODE_RED_BODY = `If a Code Red is indicated by smoke, fire, or a burning smell:

## R-A-C-E

- **R** – Rescue those in immediate danger.
- **A** – Alarm:
  - Activate the fire pull station.
  - Call Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC) and give the exact location of the fire (room number and building), your name, and the type of fire, if known.
- **C** – Contain the fire by closing all doors, windows, and other partitions.
- **E** – Extinguish if possible, or evacuate if the fire or smoke cannot be controlled.

In the event of a fire, use the appropriate type of extinguisher. All are operated the same basic way, using the P-A-S-S method:

## P-A-S-S

- **P** – Pull or remove the safety pin or metal pull ring.
- **A** – Aim the nozzle at the base of the fire, not at the flames themselves.
- **S** – Squeeze the handle grips together.
- **S** – Sweep side to side to extinguish the burning surface.

*All hospital facilities are Defend-In-Place Facilities, except for business-occupancy locations such as the 1st floor lobby areas at SGMC.*
`;

const SYSTEMS_FAILURE_BODY = `*By contacting the AOC and Safety Officer, assistance will be given in contacting other parties.*

| Failure of | What to Expect | Responsibility of User | Who to Contact |
| --- | --- | --- | --- |
| Computer Systems | System down | Use backup manual/paper systems | AOC / Information Systems |
| Electrical Power Failure – Emergency/Generators Work | Many lights are out; only RED plug outlets work | Ensure life support systems are on emergency power (red outlets); ventilate patients by hand as necessary; complete cases in progress ASAP; use flashlights | AOC / Facilities / Respiratory Therapy / Safety Officer |
| Electrical Power Failure – Total | Failure of all electrical systems | Utilize flashlights; hand-ventilate patients; manually regulate IVs; don't start new cases | AOC / Facilities / Respiratory Therapy |
| Elevators Out of Service (all serving one area) | All vertical movement will have to be by stairwells | Review fire and evacuation plans; establish services on first or second floor; use carry teams to move critical patients and equipment; distribute food service in bulk to floors | AOC / Facilities / All Directors / Security / Safety Officer |
| Elevators Stopped Between Floors | Elevator alarm bell sounding | Keep verbal contact with persons in the elevator and let them know help is on the way | AOC / Facilities / Security |
| Fire Alarm System | No fire alarms or sprinklers | Institute Fire Watch; minimize fire hazards; use phone or runners to report fire | AOC / Facilities / Security / Safety Officer |
| Medical Gases | Gas alarms, no O2, medical air, or Nitrous Oxide (NO2) | Hand-ventilate patients; transfer patients if necessary; use portable O2 and other gases; call for additional portable cylinders | AOC / Facilities / Respiratory Care / Safety Officer |
| Medical Vacuum | No medical vacuum; vacuum systems fail and alarm | Call Sterile Processing for portable vacuum; obtain portable vacuum from crash cart; finish cases in progress, don't start new ones | Facilities / Respiratory Care / Sterile Processing / Safety Officer |
| Natural Gas Failure or Leak | Odor, no flames on burners, etc. | Turn off gas equipment; don't use spark-producing devices, electrical motors, switches, etc. | AOC / Facilities / Security / Safety Officer |
| Nurse Call System | No patient call system | Use bedside patient telephone if available; move patients; detail a rover to check on patients | AOC / Facilities |
| Patient Care Equipment/Systems | Clinical equipment does not function properly | Replace and tag defective equipment, or move the patient as appropriate | Clinical Engineering |
| Sewer Stoppage | Drains backing up | Do not flush toilets; do not use water | AOC / Facilities / Infection Prevention / Safety Officer |
| Steam Failure | No building heat/hot water; sterilizers inoperative; limited cooking | Conserve sterile materials and linens; provide extra blankets; prepare cold meals | Facilities / Food Service |
| Telephones | No phone service | Use emergency bypass phones, pay phones, radios, and cellular phones; use runners as needed | AOC / Information Systems / Telecommunications / Safety Officer |
| Ventilation | No ventilation; no heating or cooling | Open windows if necessary, or obtain blankets; restrict use of odorous/hazardous materials; mask infectious patients | AOC / Facilities / Infection Prevention / Safety Officer |
| Water (Potable) | Tap water unsafe to drink | Place "non-potable water – do not drink" signs at drinking fountains and wash basins; use bottled water for drinking | AOC / Facilities / Food Service / All Directors / Safety Officer |
| Water Loss | Sinks and toilets inoperative; no drinking water | Institute Fire Watch; conserve water; use bottled water for drinking; turn off water in sinks; waterless hand-washing materials are available from Materials Management and on clinical units | AOC / Security / Facilities / Materials Management / Safety Officer & EVS / Infection Prevention |
`;

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
  let nextOrder = existing.reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;

  async function addSection(title, color_key, pages) {
    const { data: section, error } = await supabase
      .from("plan_sections")
      .insert({ org_id: org.id, title, color_key, sort_order: nextOrder++ })
      .select("id")
      .single();
    if (error) throw error;

    let pageOrder = 1;
    for (const page of pages) {
      const { error: pageError } = await supabase.from("plan_pages").insert({
        org_id: org.id,
        section_id: section.id,
        title: page.title,
        body: page.body,
        sort_order: pageOrder++,
      });
      if (pageError) throw pageError;
    }
    console.log(`Added section "${title}" (${section.id}) with ${pages.length} page(s)`);
  }

  await addSection("Code Red", "red", [{ title: "Fire Emergency", body: CODE_RED_BODY }]);
  await addSection("Systems Failure", null, [
    { title: "Utility Failure Reference Chart", body: SYSTEMS_FAILURE_BODY },
  ]);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
