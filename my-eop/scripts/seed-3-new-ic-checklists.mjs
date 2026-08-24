// Three new Incident Command activation checklists (Code White, Utility
// Emergency, Bomb Threat/Code Gold), hand-transcribed from source PDFs into
// checkable checklists. No home_category set — lands on the generic
// Checklists tile, matching the existing Active Assailant / Mass Casualty
// IC activation checklists (see seed-ic-activation-checklists.mjs).
//
// Transcription convention: blank paper-form header fields (facility/date/
// IC name boxes) dropped as non-actionable. Each numbered row becomes one
// item: "{num}. {action} — {detail} (Responsible: {who})". Phase headers
// and NOTE rows (single-cell rows spanning the table) become their own
// non-numbered items ("PHASE: ..." / "NOTE: ...").
//
// Source PDFs (not duplicated into the repo):
//   Code_White_IC_Activation_Checklist.pdf
//   AHC_Utility_Emergency_IC_Activation_Checklist (1).pdf
//   AHC_Bomb_Threat_Code_Gold_IC_Activation_Checklist.pdf
//
// Usage: node --env-file=.env.local scripts/seed-3-new-ic-checklists.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CHECKLISTS = [
  {
    title: "Code White IC Activation Checklist",
    sort_order: 4,
    description: null,
    items: [
      "PHASE: Monitoring & Threat Assessment (Ongoing — Watch/Warning Issued)",
      "1. Monitor National Weather Service advisories for hazardous weather conditions — Includes tornado watch, severe thunderstorm warning, and tornado warning affecting the facility's region. (Responsible: Safety and Security)",
      "2. Notify AOC and Administrative Supervisor/Clinical Administrator when a weather warning is issued for the general region — Provide current warning conditions for the region. (Responsible: Safety and Security)",
      "3. Maintain close contact on the potential for severe weather to impact the facility — Ongoing coordination between Safety/Security and the AOC/Administrative Supervisor. (Responsible: Safety and Security / AOC / Administrative Supervisor)",
      "4. If a tornado warning is issued, monitor local radar forecasts and the tornado path — Determine whether the forecast places the tornado on a direct path toward the hospital. (Responsible: Security/Safety Supervisor)",
      "5. If a direct path toward the hospital is confirmed, direct the hospital operator to immediately notify the Administrative Supervisor/Clinical Administrator and the AOC — This notification must occur before Code White is declared. (Responsible: Security/Safety Supervisor)",
      "NOTE: Policy Reference — AHC EC 18.0, Hazardous Weather Conditions Policy (Code White), cross-referenced to COMAR 10.07.01.33, AHC EC 20.0 (Inclement Weather Guidelines), and multiple EM/NPG standards. Verify all current citations against the Survey Process Guide before regulatory submission.",

      "PHASE: Code White Declaration & Notification (T+0 to T+5 min)",
      "6. Decide whether to activate Code White — Decision authority rests with the AOC or the Administrative Supervisor/Clinical Administrator. (Responsible: AOC / Administrative Supervisor/Clinical Administrator)",
      "7. Direct the hospital operator to announce the Code White message three times — Standard message: \"Your attention please, Code White is now in effect, please begin moving patients and team members to interior hallways.\" (Responsible: AOC / Administrative Supervisor/Clinical Administrator)",
      "8. Contact Behavioral Health Units directly by phone (SGMC) — SGMC Behavioral Health Units lack overhead paging capability and require direct notification. (Responsible: Hospital Operator)",
      "9. Notify departments and clinics in Medical Office Buildings of the Code White activation — Advise MOB staff of the need to move to interior hallways. (Responsible: Hospital Operator)",
      "10. Activate the Mass Notification system as needed to reach team members — Coordinate activation through the Safety and Emergency Management Department. (Responsible: Safety and Emergency Management Department)",
      "11. Report to the initiated Hospital Command Center, if possible and necessary — Applies to designated Command Center roles and department leadership. (Responsible: Department Directors / Supervisors)",
      "12. Extend notification to off-site and geographically separate locations — Includes the ACC Building, Manor House, off-campus rehab facilities, and the Germantown Emergency Center. Maintain a point of contact at Germantown and brief/treat that contact as the administration of a separate facility. (Responsible: AOC / EM Director)",
      "NOTE: Behavioral Health Units, Medical Office Buildings, and off-site/geographically separate locations require notification pathways separate from overhead paging; confirm current contact lists are up to date before each drill and event.",

      "PHASE: Protective Actions & Shelter-in-Place (T+0 to T+10 min)",
      "13. Move all patients, residents, and other persons away from windows and glass — Initiate immediately upon notification of Code White. (Responsible: Charge Nurse / Department Director / Supervisor)",
      "14. Prepare patients and visitors for possible damage that may occur within seconds (Responsible: All Team Members)",
      "15. Close windows, blinds, and drapes; direct staff and visitors away from windows (Responsible: Charge Nurse / Department Director / Supervisor)",
      "16. Move patients away from windows and into interior hallways (Responsible: Charge Nurse / Nursing Staff)",
      "17. Relocate non-clinical team members in offices or conference rooms with significant window exposure to central hallways (Responsible: Department Director / Supervisor)",
      "18. Assess and document any clinical basis for not relocating a patient to the hallway — Applies where isolation status, high acuity, or other patient care needs make relocation clinically unsafe; the risk assessment must weigh patient condition against current weather conditions. (Responsible: Clinical Team Members)",
      "19. Remain in the building; do not exit the hospital — Stay in areas sheltered from the storm. (Responsible: All Team Members)",
      "20. Determine jointly whether Mass Casualty Plan activation is needed — Based on the number of persons injured in the hospital, the community, or both. (Responsible: AOC / Nursing Supervisor)",
      "21. If evacuation becomes necessary, follow the AHC Evacuation/Relocation Plan (Responsible: Incident Command)",
      "NOTE: Clinical team members retain discretion not to move a patient into the hallway when isolation, acuity, or other care needs make relocation clinically unsafe. This is a documented risk-based decision, not a deviation from policy.",

      "PHASE: Sustained Monitoring & Command (Throughout Event)",
      "22. Maintain Hospital Command Center operations for the duration of the activation (Responsible: Incident Command)",
      "23. Continue monitoring weather radar and tornado path until the threat has passed (Responsible: Security/Safety Supervisor)",
      "24. If essential utilities or the telephone system fail, deploy emergency equipment per the Utility Outage Policy (Responsible: Facilities / Incident Command)",
      "25. Maintain communication between the Command Center and unit-level Charge Nurses/Directors — Provide status and expected duration of shelter-in-place. (Responsible: Incident Command)",
      "26. Function as Liaison Officer for outside agency coordination — Maintain lines of communication with the health department, other local hospitals, fire and police agencies, and emergency management agencies; submit requests to the County Emergency Operations Center for needed assistance. (Responsible: Safety Department / Liaison Officer)",
      "27. Confirm resource posture if the event is prolonged or coincides with broader inclement conditions — Check generator fuel levels with Facilities; confirm 96 hours of supplies, including linen, with Materials Management; confirm 96 hours of food and water with Dietary. (Responsible: Facilities / Materials Management / Dietary)",
      "28. Coordinate sleeping accommodations for team members unable to leave the facility — Safety and EVS set up centralized sleeping areas (e.g., conference rooms) rather than allowing individual departments to self-provision; maintain a single tracked list of sleep locations and a designated area for linen drop-off/return. (Responsible: Safety Department / EVS / Nursing Administration)",
      "NOTE: If conditions triggering this Code White event are expected to persist or coincide with a broader inclement weather activation (Code Yellow, AHC EC 20.0), the Hospital Command Center already stood up under this checklist satisfies that requirement. Do not duplicate notifications by separately calling Code Yellow.",

      "PHASE: All-Clear & Recovery (Upon Storm Passage)",
      "29. Confirm the facility is no longer in danger before canceling the expansion — Decision authority: Incident Commander, AOC, or designee (Clinical Administrator/Administrative Supervisor). (Responsible: Incident Commander / AOC)",
      "30. Direct an appointed person to page the all-clear message — Standard: \"CODE WHITE – ALL CLEAR\" three times in succession, repeated three times at one-minute intervals. (Responsible: Incident Commander / Hospital Operator)",
      "31. Lead structural evaluation of the facility before returning persons to predesignated areas (Responsible: Facilities Department)",
      "32. Coordinate evaluation of the effectiveness of the response — Findings are finalized by the respective Environment of Care Committee. (Responsible: Safety and Emergency Management Department)",
      "33. Review and re-supply material assets and team member resources before returning to normal operations (Responsible: AOC)",
      "34. Document all decisions, actions, and notification times in the IC log (Responsible: IC Scribe / EM Director)",
      "35. Call a debriefing, or at minimum notify all team members that the Command Center is closing — Confirm the facility is returning to normal operations as part of this notification. (Responsible: AOC / EM Director)",
      "36. Track and log all event-related expenses — Supports potential federal or state reimbursement following the event. (Responsible: Department Leaders / Finance)",
      "37. Issue notification on returning or retrieving loaned equipment (Responsible: Safety and Emergency Management Department)",
      "NOTE: This checklist reflects AHC EC 18.0 (Effective 11/1/2021; last revised 1/2026) and AHC EC 20.0 (Effective 11/1/2021; last revised 1/2026). Confirm current policy revision dates and cross-referenced standards before distributing outside this facility.",
    ],
  },
  {
    title: "Utility Emergency IC Activation Checklist",
    sort_order: 5,
    description:
      "Applicable Utility Types: Water (boil water, pressure loss, total loss) | Electrical / generator | HVAC / chilled water | Medical gas | Natural gas | Steam / heating",
    items: [
      "PHASE: Detection & Notification (T+0 to T+15 min)",
      "1. Detect or receive utility disruption alert — Note: utility advisory, alarm annunciator, pressure drop, or staff report. (Responsible: Facilities / Charge Eng.)",
      "2. Confirm nature, scope, and affected area(s) of disruption — Identify utility type, affected zone, and estimated repair timeline. (Responsible: Facilities)",
      "3. Notify Facility EM Director or EM Manager immediately — Do not rely on email. (Responsible: Facilities Dir. / Charge Eng.)",
      "4. Notify CNO or Clinical Admin (Responsible: Facilities / EM Director / EM Manager)",
      "5. Notify Facility COO and/or Administrator on Call (Responsible: EM Director / EM Manager)",
      "NOTE: Water supply events — confirm whether the utility authority has issued a Boil Water Advisory. If yes, notify MIEMSS and document Mini-Disaster activation per facility protocol, if applicable.",

      "PHASE: Incident Command Activation (T+15 to T+30 min)",
      "6. Facility EM Director declares Incident Command activation (Responsible: EM Director / EM Manager)",
      "7. Initiate Incident Command conference call — Target: call bridged within 30 min of EM notification. This is the hard deadline. (Responsible: EM Director / EM Manager)",
      "8. Establish Microsoft Teams executive group chat for this event — Include: EM Director, CNO, COO, Facilities Director, Infection Prevention, and Clinical Admin. (Responsible: EM Director / EM Manager)",
      "NOTE: Required participants for initial call — EM Director or Manager, Facilities Director or Charge Engineer, Hospital President, CNO or Clin Admin, COO or AOC, Infection Prevention (water events). Add clinical or operational leadership as warranted by disruption type.",

      "PHASE: Initial IC Call Agenda (T+30 min, ≤20-minute call)",
      "9. Facilities briefs: utility type, scope, current status, and estimated repair timeline (Responsible: Facilities Director)",
      "10. Confirm patient census and any immediately vulnerable populations (Responsible: CNO / Clinical Admin)",
      "11. Decide on elective procedures: continue, modify, or cancel — Base decision on utility type, system status, and repair timeline. Decision authority: CMO with CNO. (Responsible: CMO / CNO)",
      "12. Confirm patient safety measures are in place — Water events: equipment shutdown, enhanced hand hygiene protocol, bottled water deployment. (Responsible: CNO / Infection Prevention)",
      "13. Assess alternate supply inventory against current census needs — Water events only. (Responsible: Supply Chain / Facilities)",
      "14. Determine need for external resource activation — Bulk water, generator fuel, and backup power. Initiate vendor contact if warranted. (Responsible: Facilities / EM Director / EM Manager)",
      "15. Assign IC Scribe to document all decisions, actions, and open items (Responsible: EM Director / EM Manager)",
      "16. Set next check-in time (default: 60 min unless situation requires sooner) (Responsible: EM Director / EM Manager)",

      "PHASE: Sustained Operations (T+30 min onward)",
      "17. Monitor utility status on defined interval (minimum every 60 min until resolved) (Responsible: Facilities)",
      "18. Conduct IC check-in calls per established schedule; update Teams channel after each call (Responsible: EM Director / EM Manager)",
      "19. Reassess patient safety and operational continuity at each check-in (Responsible: CNO / Clinical Admin)",
      "20. Activate bulk water, fuel, or supplemental system contracts if repair timeline exceeds 4 hours — Vendor contact list: facility Emergency Operations Plan, CMMS, and EM Director. (Responsible: Facilities / Supply Chain)",
      "21. Notify MIEMSS of status change if operational posture changes — Water events: update Mini-Disaster status as warranted. (Responsible: EM Director / EM Manager)",
      "22. Communicate status updates to staff via established channels — Intranet, overhead announcement, or Mass Comms. (Responsible: CNO / Communications / EM Director/Manager)",
      "23. Document all significant decisions and actions in the IC log (Responsible: IC Scribe)",

      "PHASE: Deactivation & Recovery (Upon Utility Restoration)",
      "24. Facilities confirms utility is fully restored and system stable (Responsible: Facilities Director)",
      "25. EM Director demobilizes Incident Command (Responsible: Incident Command/EM Director)",
      "26. Notify MIEMSS of restoration (Responsible: EM Director / EM Manager)",
      "27. Restore elective procedures and normal operations per CMO and CNO authorization (Responsible: CMO / CNO)",
      "28. Return and restore all shut-down equipment after utility clearance confirmation — Water events: flush ice machines, water fountains, and beverage machines per IP guidance before restoring. (Responsible: Facilities / Nursing)",
      "29. Complete and file IC Scribe log in RL Datix or designated facility incident record (Responsible: EM Director / EM Manager)",
      "30. Schedule AAR / hotwash within 14 days of event (Responsible: EM Director / EM Manager)",
      "NOTE: A written AAR should be completed within 30 days for any Incident Command activation. Assign all improvement plan items before distributing the final report.",
    ],
  },
  {
    title: "Bomb Threat / Code Gold IC Activation Checklist",
    sort_order: 6,
    description:
      "Threat Method (circle): Telephone | Mail | In-Person | Electronic/Email | Suspected Device Found | Post-Explosion",
    items: [
      "PHASE: Recognition & Initial Notification (T+0 to T+10 min)",
      "1. Receive or detect bomb threat — remain calm; do not disconnect the caller — Threat may arrive by: telephone, written/mailed letter, in-person statement, electronic message, or discovery of a suspected device. Each method triggers this checklist. (Responsible: Receiving Staff / Security)",
      "2. If threat received by TELEPHONE: gather maximum intelligence while caller is on the line — Ask: When will it explode? Where is it? What does it look like? What kind is it? Why are you doing this? Complete Bomb Threat/Scare Report Form (Exhibit A) in real time. Note caller voice characteristics, background sounds, and exact wording. Check caller ID screen for number. (Responsible: Receiving Staff)",
      "3. If threat received by MAIL or ELECTRONIC MESSAGE: do not handle further — preserve evidence — Mail: do not touch further; isolate envelope/package. Electronic: do not forward; protect computer. Notify IT Service Help Desk (240-637-6440) and request IT AOC alert. (Responsible: Receiving Staff / IT AOC)",
      "4. If threat received IN PERSON: memorize description of individual; do not confront — Note: physical description, clothing, direction of travel, any items carried. Do not attempt to detain. (Responsible: Receiving Staff)",
      "5. If SUSPECTED DEVICE FOUND: do not touch or disturb — calmly evacuate immediate area — Do not use radios, cell phones, or any electronic devices near the device — electronic transmissions may detonate an explosive. Use landline or overhead page only. (Responsible: Discovering Staff / Security)",
      "6. Notify Security immediately — provide all available threat information — Security initiates notification cascade. Provide: threat method, exact wording, suspected location, time of detonation if stated, caller description or device description. (Responsible: Receiving Staff)",
      "7. Security notifies Administrator on Call (AOC) / Administrative Supervisor (AS) immediately — During business hours (0800–1700): AOC. Off-hours: Administrative Supervisor. Both must be notified; do not rely on a single point of contact. (Responsible: Security Director / Officer)",
      "8. Security notifies: COO/President, Safety Officer, Director of Security — Concurrent notifications — do not sequence these after AOC contact. (Responsible: Security Director)",
      "9. DISCONTINUE all electronic devices — 2-way radios, cell phones, Vocera — in and near threat area — Electronic device transmissions may detonate an explosive device. Switch to landline phones and overhead paging only. Advise Telecommunications of situation immediately. (Responsible: Security / All Staff in Area)",
      "10. Notify Facility EM Director or EM Manager — Direct phone call — do not rely on email or paging. (Responsible: Security Director / AOC)",
      "NOTE: Do NOT divulge bomb threat information to patients, visitors, or media. Information is restricted to: Hospital Operator, Security, Safety Officer, Administrative Supervisor, AOC, Fire/Rescue, and Police. Media inquiries: refer to AHC Media Relations at 301-315-3330.",

      "PHASE: Incident Command Activation (T+10 to T+30 min)",
      "11. AOC / EM Director determines whether to activate Code Gold — Bomb Threat emergency plan — Decision factors: credibility of threat, specificity of location/time, presence of suspected device, intelligence gathered during call. When in doubt, activate. (Responsible: AOC / EM Director)",
      "12. Activate Code Gold via Telecommunications — overhead announcement — Standard: \"Code Gold [Location if known]. Code Gold [Location if known].\" If location unknown, omit location. Repeat 3×. Telecommunications issues priority page to all team members. (Responsible: AOC / AS / Telecommunications)",
      "13. EM Director formally declares Incident Command activation — Document time of activation. ICS structure activates per facility EOP. This is the official start of the IC log. (Responsible: EM Director / EM Manager)",
      "14. Establish Incident Command Post (ICP) at designated secure location — outside any known threat area — ICP must be away from the suspected device location and any potential blast radius. Default location per facility EOP. Do not co-locate with law enforcement command post unless directed by Unified Command. (Responsible: EM Director / AOC)",
      "15. Call 911 — notify County Fire/Rescue and County Police — Fire/Rescue will not respond to the hospital; notification is informational. Police will respond and assume tactical command of threat assessment and device disposition. Provide: facility name, building, threat details, suspected device location if known. (Responsible: Security Director)",
      "16. Initiate IC conference call — target: within 30 minutes of EM notification — This is the hard deadline. Bridge all available leadership simultaneously. (Responsible: EM Director / EM Manager)",
      "17. Establish Microsoft Teams executive group chat for this event — Include: EM Director, CNO, COO, Security Director, Facilities Director, Safety Officer, and Clinical Admin. Label: \"Code Gold – [Date] – [Facility]\". (Responsible: EM Director / EM Manager)",
      "18. Assign ICS Command Staff: IC, Safety Officer, Public Information Officer, Liaison Officer — Safety Officer: monitors team member safety during search operations. PIO: all media routed here — no staff speak to press. Liaison: interfaces with law enforcement and fire/rescue command. Refer media to AHC Media Relations: 301-315-3330. (Responsible: EM Director (IC))",
      "19. Assign IC Scribe — document all decisions, actions, and open items from this point forward — IC log is a legal record. Document: time, action, decision maker, and all resource requests. (Responsible: EM Director / EM Manager)",
      "NOTE: Required participants for initial IC call — EM Director/Manager, Security Director, AOC/COO, Facilities Director, CNO/Clinical Admin, Safety Officer. Add law enforcement Liaison as soon as police command contact is established. Unified Command principle applies — hospital IC coordinates with, but does not supersede, law enforcement tactical authority.",

      "PHASE: Initial IC Call Agenda (T+30 min, ≤20-minute call)",
      "20. Security briefs: threat method, exact wording, suspected device location (if known), and current access control status — Report: Is threat area known? Is area cordoned off? Are electronic devices deactivated in the zone? Is law enforcement on scene? (Responsible: Security Director)",
      "21. Determine threat specificity and credibility — inform evacuation and search decision — High-specificity threats (location, time, device type stated) require immediate evacuation of named area. Low-specificity or anonymous general threats: activate search protocol before full evacuation. Police will advise. (Responsible: AOC / Security / EM Director)",
      "22. Make evacuation decision: no evacuation, partial evacuation, or full facility evacuation — Decision authority: AOC with EM Director, in coordination with law enforcement. Partial evacuation: known threat zone plus two floors above and below, and 70–150 ft radius (determined by Security/Safety Director and police based on device size). Full evacuation: activate Hospital Evacuation and Patient Relocation Plan. (Responsible: AOC / EM Director)",
      "23. Facilities briefs: assign Plant Operations to search mechanical areas — HVAC, CUP, electrical, elevator controls, plumbing valve rooms — Facilities prepares to shut off oxygen, gas, steam, and electrical power to affected area(s). Action requires coordination with nursing/medical staff before execution. Make floor plans and blueprints available to law enforcement on request. (Responsible: Facilities Director)",
      "24. Activate departmental search protocol — each charge person searches their own area — Search protocol: (1) floor level first — under desks, chairs, furniture; (2) second sweep — tops of surfaces, cabinets; (3) do NOT touch suspicious objects; (4) use flashlights only — do NOT turn on lights in darkened areas; (5) open doors slowly; (6) report any suspicious object immediately to Command Center by landline. (Responsible: AOC / Security / Dept. Supervisors)",
      "25. Confirm patient census and identify vulnerable populations requiring assisted evacuation — ICU, L&D, OR patients in active procedures, and patients on life support require specific relocation planning. Identify before any evacuation order. (Responsible: CNO / Clinical Admin)",
      "26. Confirm ED status — determine whether to accept incoming ambulance traffic — If ambulance traffic will be accepted, coordinate with police, fire, and EMS to direct all traffic to a single screened entrance. Assign clinical team member to blocked drive entrances to assess incoming patients. Notify MIEMSS of operational posture. (Responsible: CNO / ED Medical Director / EM Director)",
      "27. Suspend elective procedures — hold all non-urgent cases pending all-clear — In-progress procedures: continue only if clinically unsafe to stop. Decision authority: CMO with CNO. (Responsible: CMO / CNO)",
      "28. Shut down elevators in designated danger area — coordinate with Facilities/Plant Operations — Elevators in the threat zone should be called to a safe floor and taken out of service. Facilities executes; Security confirms. (Responsible: Facilities Director / Security)",
      "29. Notify Patient Safety / Risk Management — Notification required per AHC policy for all Code Gold activations. (Responsible: AOC / EM Director)",
      "30. Set next check-in time (default: 30 min or sooner if situation develops) — Bomb threat events are dynamic — shorten interval if search is active or device has been located. (Responsible: EM Director / EM Manager)",

      "PHASE: Sustained Operations (T+30 min onward)",
      "31. Maintain Unified Command liaison with law enforcement Incident Commander — Safety Officer/Director of Security reports to law enforcement and/or fire/rescue command post if established. Hospital IC manages clinical and operational response. Law enforcement retains tactical authority over threat and device. (Responsible: Safety Officer / Liaison Officer)",
      "32. Conduct IC check-in calls on 30-minute interval until all-clear — Update Teams channel after each call. Document all updates in IC scribe log. (Responsible: EM Director / EM Manager)",
      "33. Execute search — report findings to Command Center upon completion of each area — Each charge person or designated searcher reports: area searched, time completed, result (clear or suspicious object found). Command Center maintains running search completion log. (Responsible: Security / Dept. Supervisors)",
      "34. If suspicious device is located: stop all search activity — clear area immediately — Do NOT touch or disturb device. Close door to area. Notify Command Center by landline. Seal off area. Await law enforcement EOD (Explosive Ordnance Disposal). Two floors above and below and 70–150 ft radius evacuation threshold applies. (Responsible: Discovering Staff / Security)",
      "35. Manage patient and staff evacuation if ordered — activate Hospital Evacuation and Patient Relocation Plan — Assign team member to blocked drive entrances to direct arriving staff to designated staging area. Ensure emergency exits are unobstructed. Ensure internal lighting is operational. (Responsible: COO / CNO / Facilities)",
      "36. Control access — secure CUP, Medical Office Pavilion, HVAC areas, and all non-patient/visitor areas — Increase access control at all perimeter entry points. Report any unauthorized persons or suspicious activity to Security immediately. (Responsible: Security Director / Facilities)",
      "37. Manage media and all public communications through designated PIO only — All inquiries routed to PIO. Refer media to AHC Media Relations: 301-315-3330. No staff speak to press. Ensure no information posted to social media. (Responsible: PIO / COO)",
      "38. Communicate status updates to staff via established channels — overhead, Mass Comms, intranet — Messaging restricted to: current operational status, access restrictions, and what staff should do. Do not communicate threat details or device location broadly. (Responsible: AOC / PIO / EM Director)",
      "39. Document all significant decisions and actions in the IC log continuously — IC log supports OSHA recordkeeping, Joint Commission review, law enforcement investigation, and potential litigation. (Responsible: IC Scribe)",
      "NOTE: If explosion occurs before all-clear — notify Hospital Operator immediately. Security notifies County Fire/Rescue and County Police. Move injured to ED or established treatment area. Seal off explosion area pending authorized investigation. Activate MCI protocol if 3 or more casualties. Notify MIEMSS.",

      "PHASE: All-Clear & Recovery (Upon Law Enforcement Authorization)",
      "40. Receive all-clear authorization from law enforcement — do not self-declare — All-clear must come from the law enforcement Incident Commander or EOD authority. AOC authorizes Security to issue the all-clear announcement only after police confirmation. (Responsible: AOC / Security Director)",
      "41. Broadcast all-clear overhead announcement — Standard: \"Code Gold — All Clear. Code Gold — All Clear. Resume normal operations per supervisor guidance.\" Repeat 3×. (Responsible: Security / Telecommunications)",
      "42. EM Director demobilizes Incident Command — Confirm with AOC, COO, and CNO before demobilization. Document time of demobilization in IC log. (Responsible: EM Director)",
      "43. Notify MIEMSS of all-clear and operational restoration — Document time of notification and recipient name. (Responsible: EM Director / EM Manager)",
      "44. Restore elective procedures and normal clinical operations per CMO and CNO authorization — Areas that were evacuated or part of the threat zone require Security and Facilities clearance before reoccupation. (Responsible: CMO / CNO)",
      "45. Conduct physical security assessment of all searched and evacuated areas before reoccupying — Security and Facilities confirm: no hazards remain, utilities are restored, emergency equipment is intact, no evidence of tampering with fire suppression or emergency systems. (Responsible: Security Director / Facilities Director)",
      "46. Restore elevators and utility systems shut down during the event — Facilities confirms all systems returned to normal operational status. Document restoration times. (Responsible: Facilities Director)",
      "47. Complete Bomb Threat/Scare Report Form (Exhibit A) — submit to Security — All persons who spoke with the threatening caller must complete individual forms. Forms are submitted to the responding Security Officer and retained as legal records. (Responsible: Receiving Staff / Security)",
      "48. Submit OSHA recordable report if any injury or illness resulted — Workplace violence or explosion resulting in injury is OSHA recordable. Complete 300 Log entry. Notify Risk Management within 24 hours. (Responsible: EM Director / Risk Management)",
      "49. Complete and file IC Scribe log in RL Datix or designated facility incident record — File within 24 hours of demobilization. (Responsible: EM Director / EM Manager)",
      "50. Schedule AAR / hotwash within 14 days of event — Code Gold activations require full written AAR within 30 days. Assign all corrective actions before distributing the final report. (Responsible: EM Director / EM Manager)",
      "NOTE: A written AAR must be completed within 30 days of any Code Gold IC activation. AAR should address: threat intelligence gathering quality (Exhibit A completion), search protocol execution, electronic device deactivation compliance, evacuation decision-making, law enforcement coordination, and PIO/media management. Assign all improvement plan items before distributing the final report.",
    ],
  },
];

const { data: org, error: orgError } = await supabase
  .from("organizations")
  .select("id")
  .eq("org_code", "ADVENTIST")
  .single();
if (orgError) throw orgError;

for (const c of CHECKLISTS) {
  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({
      org_id: org.id,
      title: c.title,
      description: c.description,
      sort_order: c.sort_order,
    })
    .select("id")
    .single();
  if (checklistError) throw checklistError;

  const rows = c.items.map((text, i) => ({
    org_id: org.id,
    checklist_id: checklist.id,
    text,
    sort_order: i + 1,
  }));

  const { error: itemsError } = await supabase.from("checklist_items").insert(rows);
  if (itemsError) throw itemsError;

  console.log(`Inserted "${c.title}" checklist with ${rows.length} items.`);
}
