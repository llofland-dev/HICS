// Sample transcription of the Incident Commander Job Action Sheet from
// "All_Command_JAS.docx" (backlog item 2), converted into a checklist per
// the user's request. This is the ONE fully-worked example — per this
// project's established pattern for safety-critical hospital procedure
// content (see the Code Red sample before bulk Code transcription), the
// other 3 roles (PIO, Liaison Officer, Safety Officer) in the same document
// are held back until the user confirms this one reads correctly.
//
// Transcription choices, so they're visible/reviewable rather than silent:
// - The paper-form fields (position reports-to, phone/radio/fax blanks,
//   assignment sign-in/signature rows) aren't checklist items — dropped.
// - The final "Documents and Tools" reference list (HICS form numbers, etc.)
//   is reference material, not an action to check off — dropped.
// - Each phase (Immediate/Intermediate/Extended/Demobilization) gets a
//   "PHASE: ..." marker item so the phase structure survives flattening
//   into one linear checklist; each activity-group heading (Documentation,
//   Resources, Communication, Safety and security) gets a ":" suffix as a
//   lightweight sub-marker for the same reason.
// - Every other line is transcribed as its own checkable item, in original
//   document order, including sub-bullets (e.g. what "Brief Command Staff on
//   objectives" covers) as separate items rather than folding them into one
//   run-on item — checklist items render as plain text with no line-break
//   support, so keeping one action per line is what stays readable.
//
// Usage: node --env-file=.env.local scripts/seed-jas-incident-commander.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MISSION =
  "MISSION: Organize and direct the Hospital Command Center (HCC). Give overall strategic direction for hospital incident management and support activities, including emergency response and recovery. Approve the Incident Action Plan (IAP) for each operational period.";

const ITEMS = [
  MISSION,

  "PHASE: Immediate Response (0–2 hours)",
  "Receive appointment",
  "Gather intelligence, information and likely impact from the sources providing event notification",
  "Assume the role of Incident Commander and activate the Hospital Incident Command System (HICS)",
  "Review this Job Action Sheet",
  "Put on position identification (e.g., position vest)",
  "Notify your usual supervisor and the Hospital Chief Executive Officer (CEO) of the incident, activation of the Hospital Command Center (HCC), and your assignment",

  "Assess the operational situation",
  "Activate the Hospital Emergency Operations Plan (EOP) and applicable Incident Specific Plans or Annexes",
  "Brief Command Staff on objectives and issues, including:",
  "Size and complexity of the incident",
  "Expectations",
  "Involvement of outside agencies, stakeholders, and organizations",
  "The situation, incident activities, and any special concerns",
  "Seek feedback and further information",

  "Determine the incident objectives, tactics, and assignments",
  "Determine incident objectives for the operational period",
  "Determine which Command Staff need to be activated:",
  "Safety Officer",
  "Liaison Officer",
  "Public Information Officer",
  "If all of the Command Staff positions are not immediately assigned, attend to the priorities summarized below. Assign those positions as soon as necessary.",
  "Determine the impact on affected departments and gather additional information from the Liaison Officer",
  "Appoint a Planning Section Chief to develop an Incident Action Plan (IAP)",
  "Appoint an Operations Section Chief to provide support and direction to affected areas",
  "Appoint a Logistics Section Chief to provide support and direction to affected areas",
  "Appoint a Finance Section Chief to provide support and direction to affected areas",
  "Determine the need for, and appropriately appoint or ensure appointment of Medical-Technical Specialists",
  "Make assignments and distribute corresponding Job Action Sheets and position identification",
  "Ensure hospital and key staff are notified of the activation of the Hospital Command Center (HCC)",
  "Identify the operational period and any planned Hospital Incident Management Team (HIMT) staff shift changes",
  "Conduct a meeting with HIMT staff to receive status reports from Section Chiefs and Command Staff to determine appropriate response and recovery levels, then set the time for the next briefing",

  "If a position below isn't staffed yet, cover its priority tasks yourself:",
  "Public Information Officer — establish a designated media staging and briefing area away from the HCC and patient care areas, coordinating with Security as needed",
  "Public Information Officer — brief public information team members, if assigned, on the current situation, incident objectives, and their assignments",
  "Public Information Officer — inform on-site media of the areas they can and cannot access",
  "Public Information Officer — develop public information and media messages for release to the news media and the public",
  "Liaison Officer — obtain initial status and information to provide surge capacity status; provide an update to external stakeholders and agencies",
  "Liaison Officer — establish communication for information sharing with other hospitals and local agencies (EMS, fire, law, public health, emergency management)",
  "Liaison Officer — respond to information and/or resource inquiries from other hospitals and response agencies and organizations",
  "Safety Officer — determine safety risks of the incident and response activities to patients, personnel, and visitors, and to the hospital and environment",
  "Safety Officer — advise the Hospital Incident Management Team (HIMT) of any unsafe conditions and corrective recommendations",
  "Safety Officer — evaluate the building or incident hazards and identify vulnerabilities",
  "Safety Officer — specify the type and level of personal protective equipment (PPE) to be used, based on the incident or hazard",
  "Safety Officer — post non-entry signage around unsafe or restricted areas, as needed",
  "Safety Officer — monitor operational safety of decontamination operations, if applicable",
  "Safety Officer — ensure that safety team members, if assigned, identify and report all hazards and unsafe conditions",
  "Safety Officer — assess hospital operations and practices of staff; terminate and report any unsafe operation or practice; recommend corrective actions",

  "Documentation:",
  "Incident Action Plan (IAP) Quick Start",
  "HICS 200: Consider whether to use the Incident Action Plan (IAP) Cover Sheet",
  "HICS 201: Initiate the Incident Briefing form",
  "HICS 204: Assign or complete the Assignment List as appropriate",
  "HICS 207: Assign or complete the Hospital Incident Management Team (HIMT) Chart for assigned positions",
  "HICS 213: Document all communications on a General Message Form",
  "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",
  "HICS 252: Distribute the Section Personnel Time Sheet to Command and Medical-Technical Specialist Staff and ensure time is recorded appropriately",

  "Resources:",
  "Assign one or more clerical personnel from current staffing or request staff from the Logistics Section Chief, if activated, to function as HCC recorders",

  "Communication:",
  "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

  "Safety and security:",
  "Ensure that appropriate safety measures and risk reduction activities are initiated",
  "Ensure that HICS 215A – Incident Action Plan Safety Analysis is completed and distributed",
  "Ensure that a hospital damage survey is completed if the incident warrants",

  "PHASE: Intermediate Response (2–12 hours)",
  "Activities:",
  "Transfer the Incident Commander role, if appropriate",
  "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
  "Address any health, medical, or safety concerns",
  "Address political sensitivities, when appropriate",
  "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
  "Schedule regular briefings with Hospital Incident Management Team (HIMT) staff to identify and plan to:",
  "Ensure a patient tracking system is established and linked with appropriate outside agencies and the local Emergency Operations Center (EOC)",
  "Develop, review, and revise the Incident Action Plan (IAP), or its elements, as needed",
  "Approve the IAP revisions if developed by the Planning Section Chief, then ensure the approved plan is communicated to HIMT staff",
  "Ensure that safety measures and risk reduction activities are ongoing and re-evaluate if necessary",
  "Consider deploying a Public Information Officer to the local Joint Information Center (JIC), if applicable",

  "Documentation:",
  "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",

  "Communication:",
  "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

  "Safety and security:",
  "Ensure that patient and personnel safety measures and risk reduction actions are followed",

  "PHASE: Extended Response (greater than 12 hours)",
  "Transfer the Incident Commander role, if appropriate",
  "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
  "Address any health, medical, or safety concerns",
  "Address political sensitivities, when appropriate",
  "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
  "Evaluate or re-evaluate the need for deploying a Public Information Officer to the local Joint Information Center (JIC) and a Liaison Officer to the local Emergency Operations Center (EOC), if applicable",
  "Ensure that an Incident Action Plan (IAP) is developed for each operational period, approved, and provided to Section Chiefs for operational period briefings",
  "With Section Chiefs, determine the recovery and reimbursement costs and ensure documentation of financial impact",
  "Ensure staff, patient, and media briefings are being conducted regularly",

  "Documentation:",
  "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",

  "Resources:",
  "Authorize resources as needed or requested by Command Staff and Section Chiefs",

  "Communication:",
  "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

  "PHASE: Demobilization / System Recovery",
  "Transfer the Incident Commander role, if appropriate",
  "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
  "Address any health, medical, or safety concerns",
  "Address political sensitivities, when appropriate",
  "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
  "Assess the plan developed by the Planning Section Demobilization Unit and approved by the Planning Section Chief for the gradual demobilization of the Hospital Command Center (HCC) and emergency operations according to the progression of the incident and hospital status",
  "Demobilize positions in the HCC and return personnel to their normal jobs as appropriate, in coordination with the Planning Section Demobilization Unit",
  "Brief staff, administration, and the Board of Directors",
  "Approve notification of demobilization to hospital staff when the incident is no longer active or can be managed using normal operations",
  "Participate in community and governmental meetings and other post-incident discussion and after-action activities",
  "Ensure post-incident media briefings and hospital status updates are scheduled and conducted",
  "Ensure implementation of stress management activities and services for staff",
  "Ensure that staff debriefings are scheduled to identify accomplishments, response, and improvement issues",

  "Documentation:",
  "HICS 221 – Demobilization Check-Out",
  "Ensure all Hospital Command Center (HCC) documentation is provided to the Planning Section Documentation Unit",
];

const { data: org, error: orgError } = await supabase
  .from("organizations")
  .select("id")
  .eq("org_code", "TESTORG")
  .single();
if (orgError) throw orgError;

const { data: checklist, error: checklistError } = await supabase
  .from("checklists")
  .insert({
    org_id: org.id,
    title: "Incident Commander",
    category: "Command Staff",
    home_category: "jas",
    sort_order: 1,
  })
  .select("id")
  .single();
if (checklistError) throw checklistError;

const rows = ITEMS.map((text, i) => ({
  org_id: org.id,
  checklist_id: checklist.id,
  text,
  sort_order: i + 1,
}));

const { error: itemsError } = await supabase.from("checklist_items").insert(rows);
if (itemsError) throw itemsError;

console.log(`Inserted "Incident Commander" checklist with ${rows.length} items.`);
