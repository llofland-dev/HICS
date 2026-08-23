// Two Incident Command activation checklists (Active Assailant, Mass
// Casualty), converted from their source docx tables into checkable
// checklists per the user's request. No home_category set — these land on
// the generic Checklists tile (the user said "under the checklist tile"),
// unlike the JAS checklists which live under HICS -> Job Action Sheets.
//
// Transcription: the blank paper-form header (facility/date/IC name fields)
// and the closing file-path/review-cadence footnote are dropped — not
// actions. Each numbered row becomes one item: "{action} — {detail}
// (Responsible: {who})", preserving the source document's own numbering as
// a prefix so it still cross-references a printed copy. Phase headers and
// NOTE rows (single-cell rows spanning the table) become their own
// non-numbered items, consistent with the "PHASE:" marker convention used
// on the JAS checklists.
//
// Usage: node --env-file=.env.local scripts/seed-ic-activation-checklists.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CHECKLISTS = [
  {
    title: "Active Assailant IC Activation Checklist",
    sort_order: 2,
    description:
      "Aligned to: NIMS/ICS | ALICE/ADD Protocol | Joint Commission EM Standards | OSHA Workplace Violence Guidelines | MIEMSS MCI Protocol",
    items: [
      "PHASE: Recognition & Initial Notification (T+0 to T+5 min)",
      "1. Receive or detect threat notification — Source may be: 911 call, staff report, gunshots heard, security alarm, Code Silver overhead, or mass notification alert. (Responsible: Security / Charge RN / Any Staff)",
      "2. Initiate Code Silver overhead announcement immediately — Standard call: \"Code Silver — [Location]. Code Silver — [Location].\" Do not wait for law enforcement confirmation. Repeat 3×. (Responsible: Charge RN / Nursing Supervisor / Security)",
      "3. Call 911 — provide location, description of assailant, number of victims if known — Remain on line if safe. State: facility name, building, floor/wing, assailant description (clothing, weapon type), direction of travel. (Responsible: Security / Charge RN)",
      "4. Notify Facility EM Director or EM Manager immediately — Do not rely on email or paging alone. Direct phone call required. (Responsible: Security Director / Charge RN)",
      "5. Notify Facility COO and/or Administrator on Call — EM Director or EM Manager initiates this notification. (Responsible: EM Director / EM Manager)",
      "6. Notify CNO or Clinical Administrator — Clinical command structure must be activated concurrently with security response. (Responsible: EM Director / EM Manager)",
      "NOTE: NIMS/ICS Principle — Unified Command is established when multiple agencies respond (hospital IC + law enforcement IC). Hospital IC does not supersede law enforcement tactical command inside the hot zone. Coordinate — do not direct law enforcement operations.",
      "7. EM Director declares Incident Command activation — Code Silver event — Document time of activation. This triggers the ICS structure per facility EOP. (Responsible: EM Director / EM Manager)",
      "8. Establish Incident Command Post (ICP) at designated secure location — ICP must be outside the hot zone. Default location per facility EOP. Do not co-locate with law enforcement staging unless directed by Unified Command. (Responsible: EM Director / EM Manager)",
      "9. Initiate IC conference call — target: within 20 minutes of EM notification — This is the hard deadline. Bridge all available leadership. (Responsible: EM Director / EM Manager)",
      "10. Establish Microsoft Teams executive group chat for this event — Include: EM Director, CNO, COO, Security Director, Facilities Director, and Clinical Admin. Label channel: \"Code Silver – [Date] – [Facility]\". (Responsible: EM Director / EM Manager)",
      "11. Assign ICS Command Staff: IC, Safety Officer, Public Information Officer, Liaison Officer — Safety Officer: primary safety monitoring inside facility. PIO: manages all external media inquiries — no staff speak to media. Liaison: interfaces with law enforcement Incident Commander. (Responsible: EM Director (IC))",
      "NOTE: Required participants for initial IC call — EM Director/Manager, Security Director, CNO/Clinical Admin, COO/AOC, Facilities Director. Add law enforcement Liaison as soon as LE command contact is established.",
      "13. Security briefs: confirmed threat location, last known assailant position, and lockdown status — Report: hot zone perimeter established? Law enforcement on scene? Building access controlled? (Responsible: Security Director)",
      "14. Confirm staff and patient Avoid / Deny / Defend posture by zone — Aligned to ALICE/ADD protocol. Hot zone: Avoid (evacuate if safe) or Defend (barricade). Adjacent zones: Deny (lock down). Clear zones: normal caution. (Responsible: CNO / Nursing Supervisor)",
      "15. Confirm casualty count and activate MCI protocol if indicated — If 3 or more casualties: activate MCI plan. Notify trauma center and receiving hospitals per regional MCI protocol. Contact MIEMSS. (Responsible: CNO / Medical Staff)",
      "16. Establish patient and staff accounting process — Confirm method: physical sweep, census reconciliation, or department roll call. Assign accountability officer per ICS. (Responsible: CNO / Nursing Supervisor)",
      "17. Confirm ED status and diversion posture — Is ED in lockdown? Is diversion to be requested? Coordinate with EM Medical Director and MIEMSS. (Responsible: CNO / ED Medical Director)",
      "18. Assess surgical and procedural suite status — hold or continue in-progress cases — In-progress procedures: continue if clinically unsafe to stop. New cases: hold pending all-clear. Decision authority: CMO with CNO. (Responsible: CMO / CNO)",
      "19. Designate staff holding areas for non-essential personnel — Non-clinical staff should shelter in designated secure areas. Do not release staff to parking lots during active event. (Responsible: COO / Facility Admin)",
      "20. Assign IC Scribe — document all decisions, actions, and open items from this call forward — Scribe logs: time, action taken, decision maker. Log is a legal record. (Responsible: EM Director / EM Manager)",
      "21. Set next check-in time (default: 30 min unless situation warrants sooner) — Active events require shorter intervals than utility emergencies. (Responsible: EM Director / EM Manager)",

      "PHASE: Sustained Operations (T+20 min onward)",
      "22. Maintain Unified Command liaison with law enforcement IC — Hospital Liaison Officer attends or is connected to law enforcement command. All tactical decisions inside hot zone remain with LE. Hospital IC manages clinical and operational response. (Responsible: Liaison Officer / EM Director)",
      "23. Conduct IC check-in calls on 30-minute interval until all-clear — Update Teams channel after each call. Document in IC scribe log. (Responsible: EM Director / EM Manager)",
      "24. Manage family reunification — activate family reunification site per EOP — Reunification must be separate from media staging. Assign patient/family liaison. No information released to family without CNO authorization. (Responsible: Patient Relations / CNO)",
      "25. Coordinate with law enforcement on patient/victim identification — Law enforcement controls release of victim identification. Hospital does not release patient identity to media or public. (Responsible: PIO / CNO / Security)",
      "26. Activate Employee Assistance Program (EAP) and Critical Incident Stress Management (CISM) resources — Staff witnessing violence require immediate CISM triage. Contact Chaplain and EAP coordinator. Deploy as soon as operationally feasible. (Responsible: HR / CNO / Chaplaincy)",
      "28. Notify MIEMSS of operational status and posture — Report: casualty count, ED status (open/divert), MCI activation, and estimated timeline. (Responsible: EM Director / EM Manager)",
      "29. Communicate status updates to staff via established channels — Overhead announcements, Mass Comms, intranet. Update on: threat status, access restrictions, resumption of operations timeline. (Responsible: CNO / PIO / EM Director)",
      "30. Document all significant decisions and actions in the IC log continuously — IC log is required for OSHA recordkeeping, Joint Commission review, and potential litigation. (Responsible: IC Scribe)",

      "PHASE: All-Clear & Recovery (upon law enforcement all-clear)",
      "31. Receive and confirm all-clear directly from law enforcement — do not self-declare — All-clear must come from the law enforcement Incident Commander. Hospital IC cannot declare the scene safe. Await official verbal or written confirmation. (Responsible: Security Director / Liaison Officer)",
      "32. Broadcast all-clear overhead announcement — Standard: \"Code Silver — All Clear. Code Silver — All Clear. Resume normal operations per supervisor guidance.\" Repeat 3×. (Responsible: Charge RN / Nursing Supervisor / Security)",
      "33. EM Director demobilizes Incident Command — Confirm with COO and CNO before demobilization. Demob does not preclude continued CISM and recovery operations. (Responsible: EM Director)",
      "34. Notify MIEMSS of all-clear and operational restoration — Document time of notification and recipient. (Responsible: EM Director / EM Manager)",
      "35. Restore surgical procedures and normal clinical operations per CMO and CNO authorization — Areas that were part of the hot zone require security clearance before reoccupation. (Responsible: CMO / CNO)",
      "36. Conduct physical security assessment of affected areas before re-occupying — Facilities and Security confirm structural integrity, utilities status, and that no hazards remain. Hot zone cleared by LE crime scene investigators before hospital access. (Responsible: Security Director / Facilities Director)",
      "37. Provide mandatory CISM briefing for all affected staff before end of shift — CISM is not optional. Coordinate with EAP, Chaplaincy, and Behavioral Health. Follow-up sessions to be scheduled within 72 hours. (Responsible: HR / CNO / Chaplaincy)",
      "39. Complete and file IC Scribe log in RL Datix or designated facility incident record — File within 24 hours of demobilization. (Responsible: EM Director / EM Manager)",
      "40. Submit OSHA recordable injury/illness report if applicable — Workplace violence resulting in injury is OSHA recordable. Complete 300 Log entry. Notify Risk Management. (Responsible: EM Director / Risk Management)",
      "41. Schedule AAR / hotwash within 7 days of event — Active assailant events require an accelerated AAR timeline (7 days vs. standard 14 days) due to staff trauma and regulatory attention. (Responsible: EM Director / EM Manager)",
    ],
  },
  {
    title: "Mass Casualty Incident Command Activation Checklist",
    sort_order: 3,
    description: null,
    items: [
      "PHASE: Recognition & Initial Notification (T+0 to T+5 min)",
      "1. Receive or detect Mass Casualty Incident (MCI) notification — Source may be: EMS radio report, 911 relay, field triage report, multiple simultaneous ambulance arrivals, disaster/mass notification alert, or MIEMSS regional alert. (Responsible: ED Charge Nurse / Physician / Any Staff)",
      "2. Obtain preliminary casualty and injury information — Number of victims, mechanism of injury, potential contamination or HazMat source, and expected patient surge. Confirm whether decontamination is required prior to ED entry. (Responsible: ED Charge Nurse / Physician)",
      "3. Establish and maintain communication with EMS / regional dispatch — Confirm number of incoming patients, triage categories, ETA, transport mode, and decon status. Remain in contact for ongoing casualty count updates. (Responsible: ED Charge Nurse / Physician / Security)",
      "4. Notify Administrator on Call (AOC) and Clinical Administrator — Direct phone call required. State facility, incident type, estimated casualties, and HazMat/decon status. (Responsible: ED Charge Nurse / Physician)",
      "5. Notify Facility EM Director or EM Manager immediately — Direct phone call or Vocera if available. Initiate Mass Comm. (Responsible: AOC / Clinical Admin / Charge RN)",
      "NOTE: DISASTER Framework — Detection, Incident Command, Safety & Security, Assessment, Support, Triage & Treatment, Evacuate, Recovery. MCI response is regional in scope — coordinate with MIEMSS and receiving/transferring facilities rather than managing the event as facility-isolated.",
      "7. Incident Commander (AOC or COO) declares MCI activation — Document time of activation. This triggers the HICS structure and emergency operations plan (EOP) per facility. (Responsible: Incident Commander (AOC / COO))",
      "8. Establish Incident Command Post (ICP) at designated secure location — Default location per facility EOP. Ensure phone, radio, and AV capability separate from active ED clinical space. (Responsible: EM Director / EM Manager)",
      "9. Initiate IC conference call — target: within 20 minutes of EM notification — This is the hard deadline. Bridge all available leadership. (Responsible: EM Director / EM Manager)",
      "10. Establish Microsoft Teams executive group chat for this event — Include: EM Director, CNO, COO, Security Director, Facilities Director, Medical Branch Director, Clinical Admin, AHC Leadership. (Responsible: EM Director / EM Manager)",
      "11. Assign ICS Command Staff: IC, Safety Officer, Public Information Officer, Liaison Officer — Safety Officer monitors PPE, decon, and infection-control procedures. PIO manages all external media inquiries — no staff speaks to media. Liaison interfaces with regional EMS / MIEMSS and receiving or transferring facilities. (Responsible: Incident Command — COO / Clinical Admin)",
      "NOTE: Required participants for initial IC call — EM Director/Manager, Medical Branch Director (ED Charge Physician), CNO/Clinical Admin, COO/AOC, Security Director, Facilities Director, Facility & AHC Leadership. Add regional EMS/MIEMSS liaison as soon as contact is established.",
      "13. Medical Branch Director briefs on confirmed casualty count and injury severity mix — Number of casualties needing immediate surgery versus delayed treatment, number of pediatric casualties, and HazMat/decon status. (Responsible: Medical Branch Director (ED Charge Physician))",
      "14. Confirm MCI activation trigger and surge tier; activate MCI protocol if indicated — Per regional protocol threshold, notify trauma center(s) and receiving hospitals. Contact MIEMSS. (Responsible: CNO / Medical Staff)",
      "15. Assess need for Decon Operations and HazMat screening prior to ED entry — Establish a decontamination corridor before contaminated patients arrive, if applicable. (Responsible: Operations Section Chief / Safety Officer)",
      "16. Establish triage cohorting areas by category (Immediate / Delayed / Minor / Expectant) — Casualty Care Unit Leader maintains patient flow using established triage guidelines; confirm treatment areas outside the standard ED if patient surge requires. (Responsible: Casualty Care Unit Leader)",
      "17. Assess inpatient bed capacity; initiate rapid discharge and rapid admission as needed — Inpatient Unit Leader coordinates with Casualty Care Unit Leader on additional bed capacity. Consider internal surge plan activation. (Responsible: Inpatient Unit Leader / Clinical Admin)",
      "19. Confirm ED status and diversion posture — Coordinate with EMS, ED Medical Director, and MIEMSS on whether diversion is warranted given patient surge. (Responsible: CNO / ED Medical Director)",
      "20. Assess surgical and procedural suite status: hold or continue in-progress cases — In-progress procedures continue if clinically unsafe to stop. New cases held pending capacity confirmation. Decision authority: CMO with CNO. (Responsible: CMO / CNO)",
      "21. Assign IC Scribe: document all decisions, actions, and open items from this call forward — Scribe logs time, action taken, and decision maker. Log is a legal record. (Responsible: EM Director / EM Manager)",
      "22. Set next check-in time (default: 30 min unless situation warrants sooner) — Active patient surge requires shorter intervals. (Responsible: EM Director / EM Manager)",

      "PHASE: Sustained Operations",
      "23. Maintain liaison with regional EMS / MIEMSS and receiving/transferring facilities — Track incoming and outgoing patient counts and bed availability system-wide. (Responsible: Liaison Officer / EM Director)",
      "25. Manage ongoing triage and treatment flow — Casualty Care Unit Leader relieves fatigued staff, monitors resource consumption, and reports capacity status to Medical Branch Director. (Responsible: Casualty Care Unit Leader)",
      "26. Manage family reunification: activate family reunification site per EOP — Reunification must be separate from media staging. Assign a patient/family liaison. No information released to family without CNO/PIO authorization. (Responsible: AHC PIO / CNO)",
      "27. Coordinate with EMS/law enforcement on patient and victim identification, if applicable — Law enforcement controls release of victim identification when the incident has a criminal element. Hospitals do not release patient identity to media or the public. (Responsible: PIO / CNO / Security)",
      "28. Activate Employee Assistance Program (EAP) and Critical Incident Stress Management (CISM) resources — Staff exposed to mass casualty scenes require CISM triage. Contact Chaplain and EAP coordinator. Deploy as soon as operationally feasible. (Responsible: HR / CNO / Chaplaincy)",
      "29. Manage media and public communications through designated PIO only — All media inquiries routed to PIO. No staff speaks to press. Coordinate messaging with regional/law enforcement PIO for joint release if applicable. (Responsible: PIO / COO)",
      "30. Notify MIEMSS of operational status and posture on an ongoing basis — Report casualty count, ED status (open/divert), bed capacity, and estimated timeline to normal operations. (Responsible: EM Director / EM Manager)",
      "31. Communicate status updates to staff via established channels — Overhead announcements, Mass Comms, intranet. Update on patient surge status, access restrictions, and resumption of normal operations timeline. (Responsible: CNO / PIO / EM Director)",
      "NOTE: NIMS ICS Principle — Unity of Command: every individual reports to only one supervisor. Span of Control: each supervisor manages no more than 5–7 personnel. Modular Organization: expand or contract ICS structure to match patient surge and incident complexity.",

      "PHASE: All-Clear & Recovery",
      "33. Confirm no further incoming casualties are expected — Coordinate with EMS/MIEMSS dispatch before demobilizing the MCI response. (Responsible: EM Director / Liaison Officer)",
      "34. EM Director / Manager demobilizes Incident Command — Confirm with COO and CNO before demobilization. Demobilization does not preclude continued CISM and recovery operations. (Responsible: EM Director / EM Manager)",
      "35. Notify MIEMSS of stand-down and operational restoration — Document time of notification and recipient. (Responsible: EM Director / EM Manager)",
      "36. Restore surgical procedures and normal clinical operations per CMO and CNO authorization — Confirm resource and staffing levels have returned to baseline before resuming full elective schedule. (Responsible: CMO / CNO)",
      "37. Provide mandatory CISM briefing for all affected staff before end of shift — CISM is not optional. Coordinate with EAP, Chaplaincy, and Behavioral Health. Follow-up sessions to be scheduled within 72 hours. (Responsible: HR / CNO / Chaplaincy)",
      "39. Complete and file IC Scribe log in RL Datix or designated facility incident record — File within 24 hours of demobilization. (Responsible: EM Director / EM Manager)",
      "40. Submit OSHA recordable injury/illness report if applicable — Complete 300 Log entry for any staff injury sustained during the response. Notify Risk Management. (Responsible: Risk Management)",
      "41. Schedule AAR / hotwash within 14 days of event — MCI AARs should address triage protocol performance, surge capacity and bed management, transfer coordination, decon/HazMat response (if applicable), and CISM deployment. Assign all corrective actions before distributing the final report. (Responsible: EM Director / EM Manager / Clinical Admin)",
    ],
  },
];

const { data: org, error: orgError } = await supabase
  .from("organizations")
  .select("id")
  .eq("org_code", "TESTORG")
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
