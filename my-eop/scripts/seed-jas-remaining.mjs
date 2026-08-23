// Remaining 3 roles from "All_Command_JAS.docx" (backlog item 2), following
// the same transcription conventions as the approved Incident Commander
// sample (scripts/seed-jas-incident-commander.mjs): paper-form fields and
// the closing "Documents and Tools" reference list dropped, phases marked
// with "PHASE: ..." items, activity-group headings (Activities/
// Documentation/Resources/Communication/Safety and security) marked with a
// ":" suffix, one action per checklist item in original document order.
//
// Usage: node --env-file=.env.local scripts/seed-jas-remaining.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ROLES = [
  {
    title: "Public Information Officer (PIO)",
    sort_order: 2,
    mission:
      "MISSION: Serve as the conduit for information to internal and external stakeholders, including hospital personnel, visitors and families, and the news media, as approved by the Incident Commander.",
    items: [
      "PHASE: Immediate Response (0–2 hours)",
      "Receive appointment",
      "Obtain briefing from the Incident Commander on:",
      "Size and complexity of incident",
      "Expectations of the Incident Commander",
      "Incident objectives",
      "Involvement of outside agencies, stakeholders, and organizations",
      "The situation, incident activities, and any special concerns",
      "Assume the role of Public Information Officer (PIO)",
      "Review this Job Action Sheet",
      "Put on position identification (e.g., position vest)",
      "Notify your usual supervisor of your assignment",

      "Assess the operational situation",
      "Attend all briefings and Incident Action Plan (IAP) meetings to gather and share incident and hospital information",
      "Establish contact with local or national media outlets to access and assess current situation",
      "Provide media, internal, and external messaging information to Hospital Incident Management Team (HIMT) staff as appropriate",

      "Determine the incident objectives, tactics, and assignments",
      "Develop response strategy and tactics and outline an action plan",
      "Designate times for briefings to media, patients, and hospital personnel",

      "Activities:",
      "Establish a designated media staging and media briefing area located away from the Hospital Command Center (HCC) and patient care activity areas, coordinating with the Operations Section Security Branch Director as needed",
      "Brief public information team members, if assigned, on current situation, incident objectives, and their assignments",
      "Inform on-site media of the physical areas to which they have access and those that are restricted",
      "Contact external Public Information Officers (PIOs) from community and governmental agencies to ascertain and collaborate on public information and media messages being developed by those entities and ensure consistent and collaborative messages from all entities",
      "In collaboration with the Incident Commander, consider assigning a public relations staff member to the Joint Information Center (JIC), if activated",
      "Monitor, or assign personnel to monitor and report to you, incident and response information from sources such as the internet, radio, television, and newspapers",
      "Develop public information and media messages to be reviewed and approved by the Incident Commander before release to the news media and the public",

      "Documentation:",
      "HICS 204: Appoint public information team members, if assigned, and complete the Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",

      "Resources:",
      "Request one or more recorders and other support staff as needed from the Labor Pool and Credentialing Unit Leader, if activated, to perform all necessary activities and documentation",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Coordinate designation of media staging and briefing area with the Operations Section Security Branch Director",
      "Ensure that any assigned personnel comply with safety procedures and instructions including the use of personal protective equipment (PPE) as warranted",

      "PHASE: Intermediate Response (2–12 hours)",
      "Activities:",
      "Transfer the Public Information Officer (PIO) role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "Continue to attend all briefings and Incident Action Plan (IAP) meetings to gather and share incident and hospital information",
      "Contribute media and public information activities and goals to the IAP",
      "Coordinate with the Planning Section Patient Tracking Manager regarding:",
      "Receiving and screening inquiries regarding the status of individual patients",
      "Release of appropriate patient information to appropriate requesting entities",
      "Activate social media outlets for dissemination of response and hospital information",
      "Determine whether a local, regional, or state Joint Information Center (JIC) is activated; provide support as needed; and coordinate information dissemination",
      "Continue to develop and revise public information and media messages to be reviewed and approved by the Incident Commander before release to the news media and the public",
      "Develop regular information and status update messages to keep hospital personnel, patients, and visitors informed of the incident, community, and hospital status",
      "Relay pertinent information received to the Planning Section Situation Unit Leader and the Liaison Officer",
      "Provide critical information through signage, TV messaging, and emails to hospital personnel, visitors, and media as needed",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Documentation:",
      "HICS 204: Document assignments and operational period objectives on Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document actions, decisions, and information received on Activity Log",

      "Resources:",
      "Consider the need to deploy a media liaison representative to the local JIC if warranted, make a recommendation to the Incident Commander",

      "Safety and security:",
      "Ensure that any assigned personnel comply with safety procedures and instructions including the use of personal protective equipment (PPE) as warranted",

      "PHASE: Extended Response (greater than 12 hours)",
      "Activities:",
      "Transfer the Public Information Officer (PIO) role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "Continue to receive regular progress reports from the Incident Commander, Section Chiefs, and others, as appropriate",
      "Coordinate with the Logistics Section Chief to determine if any requests for assistance are necessary that could be released to the public via the media",
      "Conduct ongoing news conferences, providing updates on casualty information and hospital operational status to the news media",
      "Ensure ongoing information coordination with other agencies, hospitals, local Emergency Operations Center and the Joint Information Center (JIC)",
      "Facilitate staff and patient interviews with the media as appropriate",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Documentation:",
      "HICS 204: Document assignments and operational period objectives on Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document actions, decisions, and information received on Activity Log",

      "Safety and security:",
      "Ensure your physical readiness through proper nutrition, water intake, rest, and stress management techniques",
      "Ensure that any assigned personnel comply with safety procedures and instructions including the use of personal protective (PPE) equipment as warranted",
      "Observe all staff and volunteers for signs of stress and inappropriate behavior and report concerns to the Safety Officer and the Logistics Section Employee Health and Well-Being Unit Leader",

      "PHASE: Demobilization / System Recovery",
      "Activities:",
      "Transfer the Public Information Officer (PIO) role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "Return staff to their normal jobs and combine or deactivate positions in a phased manner",
      "Ensure the return or retrieval of equipment and supplies and return all assigned incident command equipment",
      "Brief the Incident Commander on current problems, outstanding issues, and follow up requirements",
      "Submit comments to the Planning Section Chief for discussion and possible inclusion in an After Action Report and Corrective Action and Improvement Plan. Topics include:",
      "Review of pertinent position activities and operational checklists",
      "Recommendations for procedure changes",
      "Accomplishments and issues",
      "Participate in stress management and after action debriefings",
      "Participate in other briefings and meetings as required",
      "Coordinate release of patient information with external agencies through the Liaison Officer",
      "Coordinate the release of final media briefings and reports",

      "Documentation:",
      "HICS 221: Demobilization Check-Out",
      "Ensure all documentation is submitted to the Planning Section Documentation Unit",
    ],
  },
  {
    title: "Liaison Officer",
    sort_order: 3,
    mission: "MISSION: Function as the incident contact person in the Hospital Command Center for representatives from other agencies.",
    items: [
      "PHASE: Immediate Response (0–2 hours)",
      "Receive appointment",
      "Obtain briefing from the Incident Commander on:",
      "Size and complexity of incident",
      "Expectations of the Incident Commander",
      "Incident objectives",
      "Involvement of outside agencies, stakeholders, and organizations",
      "The situation, incident activities, and any special concerns",
      "Assume the role of Liaison Officer",
      "Review this Job Action Sheet",
      "Put on position identification (e.g., position vest)",
      "Notify your usual supervisor of your assignment",

      "Assess the operational situation",
      "Establish contact with local, county, and state emergency organization agencies as appropriate to ascertain current status, contacts, and message routing",

      "Determine the incident objectives, tactics, and assignments",
      "Determine response objectives, tactics, assignments, and if supporting staff are assigned, document on HICS 204 - Assignment List",
      "Brief liaison team members, if assigned, on current situation, incident objectives and their assignments",
      "Develop response strategy and tactics; outline action plan",

      "Activities:",
      "Obtain initial status and information from the Planning Section Chief to provide surge capacity status; provide an update to external stakeholders and agencies",
      "Establish communication for information sharing with other hospitals and local agencies (e.g., emergency medical services, fire, law, public health, and emergency management)",
      "Respond to information and or resource inquiries from other hospitals and response agencies and organizations",

      "Documentation:",
      "HICS 204: Appoint liaison team members, if assigned, and complete the Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",

      "Resources:",
      "Consider the need to deploy a liaison representative to the local public health or emergency management Emergency Operations Center (EOC); if warranted, make a recommendation to the Incident Commander",
      "Request one or more recorders as needed from the Logistics Section Labor Pool and Credentialing Unit Leader, if activated, to perform all necessary documentation",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Ensure your physical readiness through proper nutrition, water intake, rest, and stress management techniques",

      "PHASE: Intermediate Response (2–12 hours)",
      "Activities:",
      "Transfer the Liaison Officer role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "Attend all briefings and Incident Action Planning meetings to gather and share incident and hospital information",
      "Provide information on local hospitals, community response activities, and Liaison goals to the Incident Action Plan (IAP)",
      "Report to appropriate authorities the following minimum data on HICS 259: Hospital Casualty/Fatality Report:",
      "Number of casualties received and types of injuries treated",
      "Current patient capacity and census",
      "Number of patients admitted, discharged home, or transferred to other hospitals",
      "Number deceased",
      "Individual casualty data: name or physical description, sex, age, address, seriousness of injury or condition",

      "Documentation:",
      "HICS 204: Document assignments and operational period objectives on Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document actions, decisions, and information received on Activity Log",
      "HICS 259: Report data from the Hospital Casualty/Fatality Report",

      "Resources:",
      "Consider the need to deploy a liaison representative to the local public health or emergency management Emergency Operations Center (EOC); if warranted, make a recommendation to the Incident Commander",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Ensure your physical readiness through proper nutrition, water intake, rest, and stress management techniques",
      "Observe all staff and volunteers for signs of stress and inappropriate behavior; report issues to the Safety Officer and Logistics Section Employee Health and Well-Being Unit",

      "PHASE: Extended Response (greater than 12 hours)",
      "Activities:",
      "Transfer the Liaison Officer role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",

      "Documentation:",
      "HICS 204: Document assignments and operational period objectives on Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",
      "HICS 259: Report updated data on the Hospital Casualty/Fatality Report",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Ensure your physical readiness through proper nutrition, water intake, rest, and stress management techniques",
      "Observe all staff and volunteers for signs of stress and inappropriate behavior and report concerns to the Safety Officer and the Logistics Section Employee Health and Well-Being Unit Leader",

      "PHASE: Demobilization / System Recovery",
      "Activities:",
      "Transfer the Liaison Officer role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "As objectives are met and needs decrease, return liaison team to their usual roles",
      "Coordinate the release of patient information to external agencies with the Public Information Officer",
      "Upon deactivation of your position, brief the Incident Commander on outstanding issues, and follow up requirements",
      "Submit comments to the Planning Section for discussion and possible inclusion in an After Action Report and Corrective Action and Improvement Plan. Topics include:",
      "Review of pertinent position activities and operational checklists",
      "Recommendations for procedure changes",
      "Accomplishments and issues",
      "Participate in stress management and after action debriefings",

      "Documentation:",
      "HICS 221 - Demobilization Check-Out",
      "Ensure all documentation is submitted to Planning Section Documentation Unit",
    ],
  },
  {
    title: "Safety Officer",
    sort_order: 4,
    mission:
      "MISSION: Ensure health and safety of patients, hospital personnel, and visitors; identify, monitor and mitigate hazardous conditions.",
    items: [
      "PHASE: Immediate Response (0–2 hours)",
      "Receive appointment",
      "Obtain briefing from the Incident Commander on:",
      "Size and complexity of incident",
      "Expectations of the Incident Commander",
      "Incident objectives",
      "Involvement of outside agencies, stakeholders, and organizations",
      "The situation, incident activities, and any special concerns",
      "Assume the role of Safety Officer",
      "Review this Job Action Sheet",
      "Put on position identification (e.g., position vest)",
      "Notify your usual supervisor of your assignment",

      "Assess the operational situation",
      "Initiate environmental monitoring as indicated by the incident or hazardous condition",

      "Determine the incident objectives, tactics, and assignments",
      "Establish contact with local public safety agencies as well as other hospitals, as appropriate to access any pertinent safety information",
      "Provide information to the Incident Commander including safety-related capabilities and limitations",

      "Activities:",
      "Determine safety risks of the incident and response activities to patients, hospital personnel, and visitors as well as to the hospital and the environment",
      "Advise the Hospital Incident Management Team (HIMT) of any unsafe conditions and corrective recommendations",
      "Evaluate the building or incident hazards and identify vulnerabilities",
      "Specify the type and level of personal protective equipment (PPE) to be used by hospital personnel to ensure their protection, based on the incident or hazard",
      "Post non-entry signage around unsafe or restricted areas, as needed",
      "Attend all briefings and Incident Action Plan (IAP) meetings to gather and share incident and hospital safety requirements",
      "Monitor operational safety of decontamination operations, if applicable",
      "Ensure that safety team members, if assigned, identify and report all hazards and unsafe conditions",
      "Assess hospital operations and practices of staff; terminate and report any unsafe operation or practice; recommend corrective actions to ensure safe service delivery",

      "Documentation:",
      "HICS 203: Review the Organization Assignment List",
      "HICS 204: Appoint team members, if assigned, and complete the Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Document all key activities, actions, and decisions in an Activity Log on a continual basis",
      "HICS 215A: Complete the Incident Action Plan (IAP) Safety Analysis; document identified safety issues, mitigation strategies and assignments",

      "Resources:",
      "Obtain non-entry signage around unsafe or restricted areas, as needed",
      "Request one or more recorders as needed from the Logistics Section Labor Pool and Credentialing Unit Leader, if activated, to perform documentation and tracking",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Determine safety risks of the incident and response activities to patients, staff and visitors as well as to the hospital and the environment",
      "Advise Hospital Incident Management Team (HIMT) staff of any unsafe conditions and corrective recommendations",
      "Evaluate building or incident hazards and identify vulnerabilities",
      "Specify type and level of personal protective equipment (PPE) to be utilized by staff to ensure their protection, based on the incident or hazardous condition",

      "PHASE: Intermediate Response (2–12 hours)",
      "Activities:",
      "Transfer the Safety Officer role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "Continue to assess safety risks of the incident to all personnel, the hospital, and the environment",
      "Ensure proper equipment needs are met and equipment is properly functioning throughout the response",
      "Attend all command briefings and Incident Action Plan (IAP) meetings to gather and share incident and hospital information",
      "Contribute safety issues, activities, and goals to the IAP",
      "Advise Hospital Incident Management Team (HIMT) staff of any unsafe conditions and corrective recommendations",

      "Documentation:",
      "HICS 204: Document assignments and operational period objectives on Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Continue to document all actions and observations on the Activity Log on a continual basis",
      "HICS 215A: Continue to update the Incident Action Plan (IAP) Safety Analysis for inclusion in the hospital IAP",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Continue to assess safety risks of the incident to all personnel, the hospital, and the environment",
      "Ensure proper equipment needs are met and equipment is properly functioning throughout the response",

      "PHASE: Extended Response (greater than 12 hours)",
      "Activities:",
      "Transfer the Safety Officer role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "Continually reassess the safety risks of the extended incident to patients, hospital staff, and visitors and to the hospital and the environment",
      "Identify corrective actions and revise the HICS 215A: Incident Action Plan (IAP) Safety Analysis",
      "Attend all briefings and IAP meetings to gather and share incident and hospital information",
      "Advise Hospital Incident Management Team (HIMT) staff of any unsafe conditions and corrective recommendations",
      "Observe hospital personnel and volunteers for signs of stress and inappropriate behavior",
      "Respond to any reports of stress or inappropriate behavior in conjunction with the Logistics Section Employee Health and Well-Being Unit Leader",
      "Contribute safety issues, activities, and goals to the IAP as needed beyond HICS 215A: Incident Action Plan (IAP) Safety Analysis",

      "Documentation:",
      "HICS 204: Document assignments and operational period objectives on Assignment List",
      "HICS 213: Document all communications on a General Message Form",
      "HICS 214: Continue to document all actions and observations on the Activity Log on a continual basis",
      "HICS 215A: Continue to update the Incident Action Plan (IAP) Safety Analysis for inclusion in the hospital IAP",

      "Communication:",
      "Hospital to complete: insert communications technology, instructions for use, and protocols for interface with external partners",

      "Safety and security:",
      "Continue to assess hospital operations and practices of staff, and terminate and report any unsafe operation or practice, recommending corrective actions to ensure safe service delivery",
      "Ensure your physical readiness through proper nutrition, water intake, rest, and stress management techniques",
      "Observe all staff and volunteers for signs of stress and inappropriate behavior",
      "Respond to any reports of stress or inappropriate behavior in conjunction with the Logistics Section Employee Health and Well-Being Unit Leader",

      "PHASE: Demobilization / System Recovery",
      "Activities:",
      "Transfer the Safety Officer role, if appropriate",
      "Conduct a transition meeting to brief your replacement on the current situation, response actions, available resources, and the role of external agencies in support of the hospital",
      "Address any health, medical, and safety concerns",
      "Address political sensitivities, when appropriate",
      "Instruct your replacement to complete the appropriate documentation and ensure that appropriate personnel are properly briefed on response issues and objectives (see HICS Forms 203, 204, 214, and 215A)",
      "As objectives are met and needs for incident related safety decrease, return staff to their normal jobs and combine or deactivate positions in a phased manner, as applicable",
      "Ensure the return or retrieval of equipment and supplies used during the response",
      "Participate in stress management and after action debriefings",
      "Participate in other briefings and meetings as required",
      "Brief the Incident Commander on current problems, outstanding issues, and follow-up requirements",
      "Submit comments to the Planning Section Chief for discussion and possible inclusion in an After Action Report and Corrective Improvement Plan. Topics include:",
      "Review of pertinent position activities and operational checklists",
      "Recommendations for procedure changes",
      "Accomplishments and issues",

      "Documentation:",
      "HICS 221: Demobilization Check-Out",
      "Ensure all documentation is submitted to Planning Section Documentation Unit",
    ],
  },
];

const { data: org, error: orgError } = await supabase
  .from("organizations")
  .select("id")
  .eq("org_code", "TESTORG")
  .single();
if (orgError) throw orgError;

for (const role of ROLES) {
  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({
      org_id: org.id,
      title: role.title,
      category: "Command Staff",
      home_category: "jas",
      sort_order: role.sort_order,
    })
    .select("id")
    .single();
  if (checklistError) throw checklistError;

  const allItems = [role.mission, ...role.items];
  const rows = allItems.map((text, i) => ({
    org_id: org.id,
    checklist_id: checklist.id,
    text,
    sort_order: i + 1,
  }));

  const { error: itemsError } = await supabase.from("checklist_items").insert(rows);
  if (itemsError) throw itemsError;

  console.log(`Inserted "${role.title}" checklist with ${rows.length} items.`);
}
