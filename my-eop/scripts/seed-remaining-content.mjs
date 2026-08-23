// Loads the remaining 14 documents from the "Codes" review into TESTORG:
// 11 plan sections, 1 form (Bomb Threat Checklist), ~20 contacts (Emergency
// Information). Companion to seed-sample-content.mjs (Code Red + Systems
// Failure, already run and approved).
//
// Usage: node --env-file=.env.local scripts/seed-remaining-content.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SECTIONS = [
  {
    title: "Code Pink",
    color_key: "pink",
    pages: [
      {
        title: "Infant/Child Abduction",
        body: `If an infant, child, or adolescent cannot be found in the mother's room, the nursery, or any part of the hospital campus, initiate the emergency response Code Pink by calling (ext. 4444 at SGMC and WOMC, 2222 at FWMC), reporting "Code Pink has occurred" and the location.

- Security will call 911 and inform the police agency of the "Code Pink" incident.
- Notify the Charge Nurse, Manager, Clinical Administrator/Nursing Supervisor, Security, and the Director/Manager of Women's Services.
- Restrict ingress and egress of the facility to emergencies only. The Charge RN will receive any information to help identify the missing infant, child, or adolescent.
- Search the unit immediately. Each nurse should account for their assigned babies in the nursery, matching the mother's and infant's ID bands, and report the count to the Charge RN. Infants may be moved to their mothers' rooms if requested.
- Report any suspicious persons refusing to remain in the facility, carrying unusually large bags and refusing a search, or acting out of character.
- Question the mother of the missing child regarding a description of the individual/suspect who last had contact with the infant, or other possible locations.
- Protect the crime scene. Do not disturb anything in the room. Do not allow unauthorized entry.
- Move the mother to another location (another patient room). A staff member should remain with the patient at all times.
- Nursing staff should remain on the unit until released by law enforcement.
- Hospital staff should not discuss the situation with anyone, including the media.
- The Manager/Clinical Administrator/Nursing Supervisor is to contact the operator to notify the Administrator-on-Call (AOC) and Risk Management.
`,
      },
    ],
  },
  {
    title: "Code Silver",
    color_key: "gray",
    pages: [
      {
        title: "Armed Assailant",
        body: `In the event that a person(s) has arrived at an AHC hospital/facility or is believed to be en route, and is known or believed to be armed with a weapon, or is actively shooting a weapon, all persons present should take the following immediate actions.

## Run / Notify

- If there is an accessible escape path, attempt to evacuate the premises:
  - Call 911 when it is safe to do so.
  - If applicable, notify onsite security where appropriate.
  - Have an escape route and plan in mind.
  - Evacuate regardless of whether others agree to follow.
  - Leave your belongings behind.
  - Help others escape, if possible.
  - Prevent individuals from entering an area where the armed assailant may be.
  - Keep your hands visible.
  - Follow the instructions of any police officers.
  - Do not attempt to move wounded people.

## Hide / Barricade

If evacuation is not possible, find a place to hide where the armed assailant is less likely to find you. Your hiding place should:

- Be out of the armed assailant's view.
- Provide protection if shots are fired in your direction (i.e., an office with a closed and locked door).
- Not completely trap you.

To prevent an armed assailant from entering your hiding place:

- Lock the door.
- Blockade the door with heavy furniture.

If the armed assailant is nearby:

- Lock the door.
- Silence your cell phone and/or pager.
- Turn off any source of noise (radios, televisions).
- Turn off lights if possible and applicable.
- Hide behind large items (cabinets, desks).
- Remain quiet.

If evacuation and hiding are not possible:

- Remain calm.
- Dial 911, if possible, to alert police to the armed assailant's location.
- If you cannot speak, leave the line open and allow the dispatcher to listen.

## Fight

As a last resort, and only when your life is in imminent danger, attempt to disrupt and/or incapacitate the armed assailant by:

- Acting as aggressively as possible against them.
- Throwing items and improvising weapons.
- Yelling.
- Committing to your actions.
`,
      },
    ],
  },
  {
    title: "Code White",
    color_key: "white",
    pages: [
      {
        title: "Tornado Event",
        body: `The National Weather Service issues weather advisories at two levels:

- A weather **"watch"** indicates conditions are present for the specific weather hazard to occur.
- A weather **"warning"** indicates the specific weather hazard is imminent. This may include tornado conditions that could cause structural damage to the facility and/or endanger the health and safety of employees, patients and visitors.
- A **"tornado warning"** indicates a tornado has been sighted by a spotter or on radar and is occurring or imminent in the warning area.

## Procedures

- Security will monitor NOAA Weather Radio to provide warnings for all types of hazards.
- When a weather warning is issued for the general region, Security will inform the operator to contact the Administrators-on-Call (AOC) and the Clinical Administrator/Nursing Supervisor.
- In the event of a "Code White," each charge nurse, department director and/or supervisor shall ensure the following minimal precautions are taken and observed in their area:
  - Do not take shelter in open areas or near glass windows or doors.
  - Patients who can be moved should be moved into corridors, away from glass and potential debris.
  - Close all drapes to provide protection from breaking glass.
  - Protect patients with blankets and pillows if they cannot be moved because of their condition.
  - Close all doors to patient rooms.
  - Clear corridors of all obstructions.
  - Direct visitors into interior hallways and tell them not to leave the hospital.
- Security will tour all units in the hospital to ensure patients are being moved into corridors and provide assistance where needed.
- In the event of a failure of essential utilities or the telephone system, use emergency equipment as described in the utility outage policy.
- The Administrators-on-Call, Safety Officer, or Designee will issue the "ALL CLEAR" as indicated by information from appropriate authorities. Telecommunications will announce "ALL CLEAR CODE WHITE" using priority paging, as appropriate.
`,
      },
    ],
  },
  {
    title: "Code Green",
    color_key: "green",
    pages: [
      {
        title: "Behavioral Emergency",
        body: `For assistance when addressing a combative individual who presents an immediate danger to self or others:

- Call Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC). Let them know you have a Code Green.
- Provide details regarding the location, patient/individual, specific situation, and any other pertinent information.
- Security, as well as other staff members trained to address Code Green events, will respond to the area.
- For events involving hospital patients or visitors of specific patients, the nurse and/or charge nurse for the patient should be notified.
- A follow-up meeting/debriefing should occur with all involved parties after any Code Green event.

## Civil Disturbance

If there is an actual or potential civil disturbance event that could impact the hospital:

- All employees must wear their photo IDs for hospital access.
- All employees should direct any questions from news media to the Public Relations/Marketing Department (301-315-3330).
- Security personnel will limit access to the entrances and parking areas.
- Patients are to remain in their rooms.
- Personnel are to remain in their assigned work areas.
- Close patient room doors, blinds and drapes.
- Reassure patients.
- Use telephones for emergencies only.
- Await further instructions.
- Tour your department to ensure no unauthorized personnel are present. If assistance is needed removing unauthorized personnel, contact Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC).
- Secure all money and doors as appropriate.
`,
      },
    ],
  },
  {
    title: "Code Gold",
    color_key: "gold",
    pages: [
      {
        title: "Bomb Threat",
        body: `## If You Receive a Telephone Bomb Threat

- Remain calm.
- Check the Caller ID screen for the caller's number and/or name.
- Attempt to identify the exact location, anticipated time of detonation, type and number of bomb devices.
- Use the Bomb Threat Checklist form.
- Try to prolong the conversation and get as much information as possible. Don't hang up!
- Note what you hear — background noises such as music, voices, or cars.
- As soon as possible, report the call to Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC).
- Divulge information only to your superior(s) and pertinent hospital staff (Security, Nursing Supervisor, etc.), NOT to patients, visitors, news, or social media.
- Note the caller's voice: accent, sex, age, unusual words or phrases.
- Does the caller seem to know about the medical center? How is the bomb location described? Does the caller use a person's name or give their own?
- If it is deemed necessary to evacuate, you will be notified by your supervisor or the overhead paging system. Evacuate via the primary route for your area, or the alternate route if directed.

## Threat by Mail

- Notify Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC) immediately.
- Notify your immediate supervisor.
- Protect the letters/packages from further handling.
- Divulge information only to your superior(s) and pertinent hospital staff, NOT to patients, visitors, news, or social media.

## Threat Made by Electronic Message

- Notify Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC) immediately.
- Notify your immediate supervisor.
- Do not forward or delete the message(s).
- Notify the IT Help Desk at ext. 6440.
- Divulge information only to your superior(s) and pertinent hospital staff, NOT to patients, visitors, news, or social media.

## Threat Made in Person

- Notify Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC) immediately.
- Notify your immediate supervisor.
- Try to memorize a description of the individual.
- Divulge information only to your superior(s) and pertinent hospital staff, NOT to patients, visitors, news, or social media.

## If You Discover a Bomb or a Suspicious Item

- Do not touch or otherwise disturb the suspected device.
- Protect the package from further handling.
- Calmly but quickly evacuate the immediate area.
`,
      },
    ],
  },
  {
    title: "Code Orange",
    color_key: "orange",
    pages: [
      {
        title: "Hazardous Material Spill",
        body: `General emergency procedures for an internal spill or contamination:

1. Any team member discovering an uncontrolled release of hazardous materials must report conditions to the area supervisor and Security IMMEDIATELY.
2. If you are contaminated, coordinate with your supervisor about decontamination and medical treatment. If eye contamination, flush with water for AT LEAST 15 MINUTES. If inhaled, move to fresh air. If skin contamination, remove clothing immediately and flush the area for 15 minutes. Anyone needing immediate treatment should report to the Emergency Department.
3. The area supervisor will isolate the area, assess the situation, and determine the appropriate level of response, making appropriate notifications.
4. On Level II and Level III situations, or if chemical hazards are unknown, the area supervisor will call Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC) to report the specifics. Security will dispatch an officer and notify the Safety Officer and Clinical Administrator.
5. Identify the product as quickly as practical. MSDS is available through the intranet portal, and determines the level of PPE required. If the product is flammable, severely corrosive, or highly toxic, the Safety Officer or Security Officer in charge will activate the "CODE ORANGE" alert through the Hospital Operator AS SOON AS POSSIBLE, and will determine whether to notify county fire & rescue.
6. Keep people out of the area to limit the spread of the contaminant and avoid contaminating others. If the area supervisor and/or Safety Officer determines the incident can be handled in-house (Level II), appropriate procedures will be implemented to control, contain, and properly dispose of the product.
7. If a Level III response is required, or an area evacuation is needed, activate the fire alarm by pulling the closest manual Fire Alarm Pull Station.
8. If the fire alarm has been activated, Security will notify local fire and rescue via 911 that the incident involves a hazardous material. Security personnel and the Fire Safety Response Team will secure a perimeter, allowing no one to enter until responding agencies have evaluated the incident.
9. Once the incident has been stabilized, the Security Department will initiate an incident report, forwarding it to the department director, the Safety Officer, and the Risk Manager for review.
10. If a team member is exposed to the contaminant, a copy of the report will be forwarded to Occupational Health by the Safety Officer for follow-up on short- and/or long-term medical needs.
11. Clean-up kits: Pharmacy maintains chemotherapy spill kits. Absorbent materials for other small spills are located in the Facilities Department.
`,
      },
    ],
  },
  {
    title: "Code Yellow",
    color_key: "yellow",
    pages: [
      {
        title: "Mass Casualty",
        body: `## Purpose

To provide general guidelines for hospital personnel in the event of an incident that results in major disruption in the environment of care.

## Activation of Mass Casualty (Code Yellow) Plan

- Authority for activation lies with the Administrator-on-Call or a designee assigned by the President.
- In the absence of the AOC, the Clinical Administrator/Nursing Supervisor has the authority to activate a Code Yellow.

## Announcement

The AOC or Administrative Nursing Supervisor will notify the hospital operator to announce the "Code Yellow" emergency alert, broadcast over the public address system three times in succession:

- "Code Yellow, Code Yellow, all physicians report to the Physician lounge; all employees report to your assigned work stations. Each department please send leadership representation to the Hospital Command Center."

Hospital Command Centers (unless otherwise announced):

- FWMC – Board Room
- Rehab/PACS – Administrative Conference Room
- SGMC – Aspen Room
- WOMC – Conference Room 1225

## Initial Implementation

- All on-duty employees will report immediately to their supervisor.
- Implement Departmental Plans automatically with activation of Code Yellow, including at minimum: Directors' interaction and communication with Managers; plans to send personnel (typically 2 individuals if possible) to the employee pool; notification of other staff and placing personnel on notice; means and guidelines for relieving staff.
- Establish the Hospital Emergency Incident Command System in the Command Center, if deemed necessary.

If necessary, the Incident Commander will oversee the emergency disaster preparations and operations of the Incident Command System (HICS).

## Personnel Responsibilities

- Directors/Managers with designated HICS roles will report to the Hospital Command Center to receive their Job Action Sheet (JAS), vest, and briefing on the event to carry out their task assignments.
- The Employee Pool Coordinator will deploy requested personnel to the appropriate areas.
- All employees should report immediately to their supervisors. Supervisors should send available staff to the Employee Pool if one has been established. When finished with an assignment, report back to the Employee Pool waiting area. Anyone needed at their unit or department must make that request through the Employee Pool Coordinator. Personnel sent to a particular area to assist must report to the person in charge of that area for assignment.

## Communications

- Telephone use is limited to calls essential to the emergency situation.
- Fax machines may facilitate communication.
- Utilize alternative internal communication methods when necessary, such as Power Failure Telephones, runners, Security radios, paging system, cell phones, Vocera, Mass Notification System, GETS Cards, etc.
- Utilize alternative external communication methods when necessary, such as the 700 MHz radio stored in Security, the satellite phone housed in Security, Alert Montgomery, etc.

## Security Department

Security Department personnel will limit access to the entrances and the Emergency Department.

## Discharge, Relocation or Evacuation of Patients

- The Administrator-on-Call, together with the physician and Clinical Administrator/Nursing Supervisor, should determine if patients are able to be discharged, relocated, or evacuated.
- Discharge is indicated if beds are needed to care for patients from the disaster/emergency event.
- Each nursing unit will evaluate and categorize all inpatients. Where applicable, the Unit Medical Director and/or hospitalist/intensivist will approve the designations and authorize disposition of patients based on need. Categories:
  - "Hold" – patient remains on unit.
  - "Relocate" – transfer patient to another area.
  - "Discharge" – send patient home.
- The Physician Coordinator, in the absence of unit Medical Directors, has the authority to discharge stabilized patients to their homes or to extended care facilities.
- Relocation is indicated when patients must be moved within the facility away from areas of danger, or to make room for incoming patients.
  - Relocation for safety should depend on structural damage to the hospital, or the need to care for patients being brought in from the disaster. Alternative Care Sites are coordinated through the Command Center and may include other healthcare facilities on campus, nearby healthcare and long-term facilities, or areas/facilities designated by the Health Department.
  - Making room for incoming patients: patients waiting for beds whose beds are available can be immediately transported. Admitted patients may be transferred emergently to the assigned unit without formal written admitting orders — anticipate medical coverage by hospitalists. Admitted ED patients awaiting bed assignments are transferred to a designated area while awaiting an inpatient room assignment (i.e., MITU and/or Peds ED).
`,
      },
    ],
  },
  {
    title: "Chemical Emergency Event",
    color_key: null,
    pages: [
      {
        title: "External Event Response",
        body: `For external hazardous chemical spills or releases in the community that involve contaminated victims.

- If the hospital is expected to receive one to four exposed victims, the ED Director/Charge Nurse, along with the ED physician, can coordinate use of the internal hazmat decon room for victims to self-shower after removing any clothing that may be contaminated. Security should be notified of the pending arrival of these victims so they can be directed to the outside decon room entrance door. If the event involves five or more exposed victims, the ED Director/Charge Nurse, along with the ED physician, will notify the Administrator-on-Call/Clinical Administrator/Nursing Supervisor, who will determine if the Code Yellow Mass Casualty plan needs to be implemented.
- The AOC/Clinical Administrator/Nursing Supervisor will determine whether to activate the "Code Orange" hospital emergency alert, followed by an additional announcement: "All Hazardous Material First Receiver Decon Team members please report to the Emergency Department." The Emergency Department Director/Charge Nurse is authorized to make this request through the Hospital operators. The Hospital Alert system may also be used to ask First Receiver Decon Team members to report to the Emergency Department.
- The Emergency Department Charge Nurse will assign a staff member to coordinate the response plan for establishing a decon tent (if a built-in canopy system is not available), the deployment team, and decon teams for dressing out in personal protective hazmat equipment for handling decontamination procedures.
- The charge nurse should plan to request the county hazmat team to the emergency department decon area (if the county is not already involved). Advise the 911 center of the situation and the need for metering assistance before affected patients can access the ED. A metering station should be set up outside the decon area.
`,
      },
      {
        title: "Chemical Agents Reference Chart",
        body: `| Chemical | Symptoms | Treatment |
| --- | --- | --- |
| Nerve Agents (Tabun, Sarin, Soman, VX) | Salivation, lacrimation (tears), urination, defecation, gastric emptying (vomiting), pinpoint pupils, seizures | Atropine – initial dose 2 mg, additional doses until symptoms resolve (will not reverse miosis). Pralidoxime chloride – 1 gram IV over 20–30 minutes. Benzodiazepines for seizure control or to prevent seizures in severely intoxicated patients. |
| Cyanides (Hydrogen Cyanide, Cyanogen Chloride) | Non-specific: anxiety, hyperventilation, respiratory distress. Cherry-red skin, though classic, is seldom seen. Lactic acidosis and increased concentration of venous oxygen. | Cyanide Antidote Kit. Amyl nitrite ampul as first aid until IV established (crush and place inside mask of BVM; 15 seconds of inhalation, 15 second break, repeat until IV established). Sodium nitrite – 300 mg over 2–4 minutes. Sodium thiosulfate – 12.5 g over 5 minutes. |
| Vesicants (Mustard, Lewisite) | Redness and blisters. Inhalation injury may cause respiratory distress. Leukopenia to pancytopenia. | Decon within 2 minutes of exposure, ideally. Topical antibiotics. Systemic analgesics. Fluid balance (do not overhydrate; not a thermal burn). Bronchodilators and steroids for pulmonary symptoms; if Lewisite is the poison, BAL is the antidote. |
| Pulmonary Intoxicants (Chlorine, Phosgene) | Delayed onset of non-cardiogenic pulmonary edema. | Treat hypotension with fluid, no diuretics. Ventilate with positive end expiratory pressure (PEEP). Bronchodilators. Patients exposed to liquid phosgene can gas-off and contaminate others; patients exposed to phosgene or chlorine gas do NOT pose a risk of secondary contamination. No specific antidote for phosgene or chlorine. |
| Riot Control Agents (Pepper Spray, Mace, Tear Gas) | Ear, nose, mouth, and eye irritation. | Irrigate. Treat bronchospasm with bronchodilators and steroids, as needed. |
`,
      },
    ],
  },
  {
    title: "Biological Emergency Event",
    color_key: null,
    pages: [
      {
        title: "Bioterrorism Response",
        body: `- If a bioterrorism event is suspected, the Emergency Department Nurse Director/designee, in conjunction with the ED physician, will immediately notify the Infection Control Practitioner, Clinical Administrator/Nursing Supervisor, Chief Nursing Officer and/or Exec. Director Nursing, Staffing Resources (during normal business hours), and the hospital Administrator-on-Call.
- The ED AOC will then activate local emergency response systems utilizing Emergency Medical Resource Control (EMRC) to alert police, fire, and EMS in Montgomery County, Prince George's County, and the District of Columbia.
- The Infection Preventionist will provide prompt communication with the local and state health departments, and the Hospital Epidemiologist and/or Chair of the Infection Prevention Committee.
- The local health department (LHD) — Montgomery County Health and Human Services — notifies the Maryland Department of Health and MDH Epidemiology and Disease Control Program.
- The Infection Preventionist will also alert Laboratory personnel of the suspected bioterrorist attack, so all processing and accessioning of clinical specimens is performed in a biological safety cabinet.
- A Command Center will be established by the Clinical Administrator/Nursing Supervisor or AOC, communicated via overhead announcement "Code Yellow." The Hospital Incident Command System (HICS) will be utilized — a logical management structure, defined responsibilities, clear reporting channels, and common nomenclature to help unify hospitals with other emergency responders.
- The Clinical Administrator/Nursing Supervisor will immediately assess the current bed status and update the EDAS (Emergency Department Advisory System) for MIEMSS.
- The AOC or Incident Commander will notify Security and will be responsible for locking the perimeter of the hospital and directing visitors and news media personnel; also responsible for notifying local law enforcement agencies and, as the situation requires, requesting additional security for traffic and crowd control. Security officers will assist the FBI with forensic specimens.
- After the LHD confirms whether the disease scenario meets the definition of a credible event, a decision must be made by the AOC or their designees as to whether the emergency management plan should be partially or fully implemented.
- HICS members should be briefed at least every two hours, or more frequently if the number of patients and intensity of the event escalates. Frequent communication via email updates or departmental rounds will be used to update hospital staff.
- A team of public health investigators may be dispatched to the hospital to collect information from affected patients. A coordinated epidemiologic investigation must be conducted by the LHD as soon as possible to determine the source of exposure and identify the most effective and efficient interventions.
`,
      },
    ],
  },
  {
    title: "Earthquake / Explosion",
    color_key: null,
    pages: [
      {
        title: "Earthquake",
        body: `If a tremor strikes when you are inside:

- Stay inside. Watch out for falling debris. Stay away from windows and mirrors.
- Either crawl under a table or desk, sit or stand against an inside wall away from windows, or stand inside a strong doorway.

After the tremor is over:

- Check for injured people. Do not move seriously injured people unless they are in immediate danger.
- If you think the building has been damaged, evacuate — aftershocks can level severely damaged buildings.
- Do not use the telephone except to report an emergency. If a call is necessary, call Security (ext. 4444 at SGMC and WOMC, 2222 at FWMC) and give your name, location, and telephone extension.
- Do not use plumbing or anything electrical (including elevators) until the Facilities Department checks utility and electrical lines and verifies them as safe.
- Open doors carefully, watching for objects that may fall.
- Do not use matches or lighters. Watch for fires that may have started.
- Be prepared for additional aftershocks.
- Facilities management will inspect all damage from the earthquake and determine the priority of repair work needed.
- The Hospital Command Center and emergency plans will be activated, if necessary.
`,
      },
      {
        title: "Explosion",
        body: `- If in another area, await specific instructions.
- If the explosion is in your area:
  - Remove patients and personnel from the immediate danger area.
  - Activate the fire alarm system and/or call Security (ext. 4444 at SGMC and WOMC, 181# for Rehab Intercom, 2222 at FWMC).
  - Prepare for further evacuation, if necessary.
  - Use telephones for emergencies only.
  - Reassure patients.
`,
      },
    ],
  },
  {
    title: "Acute Radiation Syndrome",
    color_key: null,
    pages: [
      {
        title: "Overview",
        body: `Acute radiation syndrome (ARS) — sometimes known as radiation toxicity or radiation sickness — is an acute illness caused by irradiation of the entire body (or most of the body) by a high dose of penetrating radiation in a very short period of time (usually a matter of minutes). The major cause of this syndrome is depletion of immature parenchymal stem cells in specific tissues.

## The Required Conditions for ARS Are

- The radiation dose must be large: greater than 0.7 Gray (Gy), or 70 rads. (Mild symptoms may be observed as low as 0.3 Gy or 30 rads.)
- The dose usually must be external (the source of radiation was outside the patient's body). Radiation materials deposited inside the body have produced some ARS effects only in extremely rare cases.
- The radiation must be penetrating (able to reach the internal organs). High-energy X-rays, gamma rays, and neutrons are penetrating radiations.
- The entire body (or a significant portion of it) must have received the dose. Most radiation injuries are local, frequently involving the hands, and these local injuries seldom cause classical signs of ARS.
- The dose must have been delivered in a short time (usually a matter of minutes). Fractionated doses — large total doses delivered in small daily amounts over time, as often used in radiation therapy — are less effective at inducing ARS than a single dose of the same magnitude.

## The Three Classic ARS Syndromes

**Bone marrow syndrome:** the full syndrome usually occurs with a dose between 0.7 and 10 Gy (70–1000 rads), though mild symptoms may occur as low as 0.3 Gy (30 rads). Survival rate decreases with increasing dose. The primary cause of death is destruction of the bone marrow, resulting in infection and hemorrhage.

**Gastrointestinal (GI) syndrome:** the full syndrome usually occurs with a dose between 10 and 100 Gy (1000–10,000 rads), though some symptoms may occur as low as 6 Gy (600 rads). Survival is extremely unlikely — destructive and irreparable changes in the GI tract and bone marrow usually cause infection, dehydration, and electrolyte imbalance. Death usually occurs within two weeks.

**Cardiovascular (CV)/central nervous system (CNS) syndrome:** the full syndrome usually occurs with a dose greater than 50 Gy (5000 rads), though some symptoms may occur as low as 20 Gy (2000 rads). Death occurs within three days, likely due to collapse of the circulatory system as well as increased cranial pressure from edema, vasculitis, and meningitis.

## Special Considerations for Radioactive Agent Decontamination

- If the possible threat involves radioactive material or radiation exposure, the Radiation Safety Officer (RSO) will be contacted immediately to help determine the type of radiation, the extent of the dose, and the best, safest course of action.
- The RSO will determine the type and extent of injury/exposure (external irradiation, absorption through the skin, inhaled, introduced through wounds, etc.).
- Conventional exposure-prevention methods protect staff and physicians:
  - **Time** – assessment, decontamination, and treatment must be performed quickly and efficiently. The shorter the time in a radiation field, the less the exposure.
  - **Distance** – the farther from the source, the lower the dose. Establish "hot" and "cold" zones for clear discernment of the hazardous area, and promote strict isolation precautions and safe distances. Use brooms and long-handled implements to move contaminated materials and avoid physical contact.
  - **Shielding** – although not always practical in an emergency, barriers can reduce radiation exposure.
- Patients known or suspected of being contaminated should be decontaminated with soap and water without delay. Open wounds should be irrigated first and covered with a sterile dressing. Following decontamination, patients should be reevaluated and, if negative, admitted for assessment and treatment. Evidence of continued contamination requires additional washing.
`,
      },
      {
        title: "Syndrome Chart",
        body: `| Syndrome | Dose | Prodromal Stage | Latent Stage | Manifest Illness Stage | Recovery |
| --- | --- | --- | --- | --- | --- |
| Bone Marrow | 0.7–10 Gy (70–1000 rads); mild symptoms may occur as low as 0.3 Gy (30 rads) | Anorexia, nausea and vomiting. Occurs one hour to two days after exposure. Lasts minutes to days. | Stem cells in bone marrow are dying, though the patient may appear and feel well. Lasts one to six weeks. | Drop in all blood cell counts for several weeks; anorexia, fever, malaise. Primary cause of death is infection and hemorrhage. Survival decreases with increasing dose; most deaths occur within a few months. | In most cases, bone marrow cells begin to repopulate the marrow; full recovery for a large percentage of individuals from a few weeks up to two years. Death may occur in some individuals at 1.2 Gy (120 rads). The LD 50/60 is about 2.5 to 5 Gy (250–500 rads). |
| Gastrointestinal (GI) | 10–100 Gy (1000–10,000 rads); some symptoms may occur as low as 6 Gy (600 rads) | Anorexia, severe nausea, vomiting, cramps and diarrhea. Occurs within a few hours of exposure. Lasts about two days. | Stem cells in bone marrow and cells lining the GI tract are dying, though the patient may appear and feel well. Lasts less than one week. | Malaise, anorexia, severe diarrhea, fever, dehydration, electrolyte imbalance. Death is due to infection, dehydration, and electrolyte imbalance, usually within 2 weeks of exposure. | The LD 100 is about 10 Gy (1000 rads). |
| Cardiovascular / Central Nervous System (CNS) | Greater than 50 Gy (5000 rads); some symptoms may occur as low as 20 Gy (2000 rads) | Extreme nervousness, confusion, severe nausea, vomiting, watery diarrhea, loss of consciousness, burning skin sensations. Occurs within minutes of exposure and lasts minutes to hours. | Patient may return to partial functionality. May last for hours but often less. | Return of watery diarrhea, convulsions, coma. Begins five to six hours after exposure. Death within three days. | No recovery. |
`,
      },
    ],
  },
];

const BOMB_THREAT_FORM = {
  title: "Bomb Threat Checklist",
  description: "Complete all possible items immediately following the call.",
  recipient_email: null,
  fields: [
    { id: "caller_info", label: "Caller's name and address (if known)", type: "text", required: false },
    { id: "sex", label: "Sex", type: "select", required: false, options: ["Male", "Female"] },
    { id: "age", label: "Age", type: "select", required: false, options: ["Adult", "Child"] },
    { id: "when", label: "When will it go off?", type: "text", required: false },
    { id: "where_building", label: "In what building is it placed?", type: "text", required: false },
    { id: "exact_location", label: "Exact location", type: "text", required: false },
    { id: "call_type", label: "Call type", type: "select", required: false, options: ["Local", "Long-Distance", "Unknown"] },
    {
      id: "tone",
      label: "Voice tone (note any that apply: Loud, Soft, High Pitch, Low Pitch, Stutter, Raspy, Nasal, Pleasant)",
      type: "textarea",
      required: false,
    },
    {
      id: "speech",
      label: "Speech (note any that apply: Fast, Slow, Distorted, Cursing, Slurred, Lisp, Disguised)",
      type: "textarea",
      required: false,
    },
    { id: "language", label: "Language", type: "select", required: false, options: ["Excellent", "Good", "Fair", "Poor"] },
    {
      id: "accent",
      label: "Accent (note any that apply: Local, Region, Taped, Ethnicity)",
      type: "textarea",
      required: false,
    },
    {
      id: "manner",
      label: "Manner (note any that apply: Poor Grammar, Well-Spoken, Deliberate, Message Read, Emotional, Irrational, Laughing)",
      type: "textarea",
      required: false,
    },
    {
      id: "background",
      label:
        "Background noise (note any that apply: Office Machines, Factory Machines, Bedlam, Animals, Quiet, Street Traffic, Airplanes, Trains, Voices, Music, PA System, Radios, Party, Static, Cellular Phone)",
      type: "textarea",
      required: false,
    },
    { id: "notes", label: "Additional notes", type: "textarea", required: false },
  ],
};

const CONTACTS = [
  { name: "Facilities – SGMC/BH", phone: "ext. 4508", category: "Facilities" },
  { name: "Facilities – FWMC", phone: "ext. 2228", category: "Facilities" },
  { name: "Facilities – Rehab", phone: "ext. 6286", category: "Facilities" },
  { name: "Facilities – SGMC", phone: "ext. 4500", category: "Facilities" },
  { name: "Facilities – WOMC", phone: "ext. 5648", category: "Facilities" },
  { name: "Security (Emergency) – SGMC/BH", phone: "240-826-6671", category: "Security" },
  { name: "Security (Emergency) – Rehab", phone: "240-826-6671", category: "Security" },
  { name: "Security (Emergency) – FWMC (ext.)", phone: "ext. 2228", category: "Security" },
  { name: "Security (Emergency) – FWMC (outside line)", phone: "301-203-2451", category: "Security" },
  { name: "Security (Emergency) – SGMC/WOMC", phone: "ext. 4444", category: "Security" },
  { name: "Security (Emergency) – WOMC", phone: "240-637-5062", category: "Security" },
  { name: "Safety Office – SGMC", phone: "240-826-6201", category: "Safety" },
  { name: "Safety Office – WOMC", phone: "240-637-5551", category: "Safety" },
  { name: "Poison Control Center", phone: "800-222-1222", category: "External Agencies" },
  { name: "Montgomery County Police/Fire (non-emergency)", phone: "301-279-8000", category: "External Agencies" },
  { name: "Prince George's County Police (non-emergency)", phone: "301-352-1200", category: "External Agencies" },
  { name: "Prince George's County Police/Fire (emergency)", phone: "911", category: "External Agencies" },
];

async function main() {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("org_code", "TESTORG")
    .single();
  if (orgError) throw orgError;

  const { data: existingSections, error: existingSectionsError } = await supabase
    .from("plan_sections")
    .select("sort_order")
    .eq("org_id", org.id);
  if (existingSectionsError) throw existingSectionsError;
  let sectionOrder = existingSections.reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;

  for (const section of SECTIONS) {
    const { data: sectionRow, error } = await supabase
      .from("plan_sections")
      .insert({ org_id: org.id, title: section.title, color_key: section.color_key, sort_order: sectionOrder++ })
      .select("id")
      .single();
    if (error) throw error;

    let pageOrder = 1;
    for (const page of section.pages) {
      const { error: pageError } = await supabase.from("plan_pages").insert({
        org_id: org.id,
        section_id: sectionRow.id,
        title: page.title,
        body: page.body,
        sort_order: pageOrder++,
      });
      if (pageError) throw pageError;
    }
    console.log(`Added section "${section.title}" with ${section.pages.length} page(s)`);
  }

  const { data: existingForms, error: existingFormsError } = await supabase
    .from("forms")
    .select("sort_order")
    .eq("org_id", org.id);
  if (existingFormsError) throw existingFormsError;
  const formOrder = existingForms.reduce((max, f) => Math.max(max, f.sort_order), 0) + 1;

  const { error: formError } = await supabase.from("forms").insert({
    org_id: org.id,
    title: BOMB_THREAT_FORM.title,
    description: BOMB_THREAT_FORM.description,
    recipient_email: BOMB_THREAT_FORM.recipient_email,
    fields: BOMB_THREAT_FORM.fields,
    sort_order: formOrder,
  });
  if (formError) throw formError;
  console.log(`Added form "${BOMB_THREAT_FORM.title}" with ${BOMB_THREAT_FORM.fields.length} fields`);

  const { data: existingContacts, error: existingContactsError } = await supabase
    .from("contacts")
    .select("sort_order")
    .eq("org_id", org.id);
  if (existingContactsError) throw existingContactsError;
  let contactOrder = existingContacts.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;

  for (const contact of CONTACTS) {
    const { error: contactError } = await supabase.from("contacts").insert({
      org_id: org.id,
      name: contact.name,
      phone: contact.phone,
      category: contact.category,
      sort_order: contactOrder++,
    });
    if (contactError) throw contactError;
  }
  console.log(`Added ${CONTACTS.length} contacts`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
