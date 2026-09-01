// Declarative schemas for the "Other Forms" tier -- HICS forms not built as
// full bespoke editors (like 201/203/204/213/214/215A/AAR), transcribed
// directly from the source PDFs. Every one of these forms decomposes into
// just three recurring shapes, so one generic renderer (other-form-editor.tsx)
// handles all of them:
//   - "fields": a fixed, one-time set of labeled inputs.
//   - "grid": fixed row labels x fixed columns, no adding/removing rows.
//   - "repeating": an add/remove-able list of small field-sets, all sharing
//     one shape (a log/roster/tracking table).

export type FieldType = "text" | "textarea" | "date" | "time" | "select" | "checkbox" | "number";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export type Section =
  | { kind: "fields"; title?: string; fields: FieldDef[] }
  | { kind: "grid"; title?: string; rowLabels: string[]; columns: FieldDef[] }
  | { kind: "repeating"; title?: string; fields: FieldDef[] };

export interface OtherFormDef {
  code: string;
  title: string;
  purpose: string;
  sections: Section[];
}

const FUNCTIONAL_OPTIONS = ["Fully functional", "Partially functional", "Nonfunctional"];
const YES_NO = ["Yes", "No"];

export const OTHER_FORMS: OtherFormDef[] = [
  {
    code: "HICS-206",
    title: "Staff Medical Plan",
    purpose: "Outline resources for medical care of injured/ill hospital personnel.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "incident_name", label: "Incident Name", type: "text" },
          { key: "date_prepared", label: "Date Prepared", type: "date" },
          { key: "time_prepared", label: "Time Prepared", type: "time" },
          { key: "op_period", label: "Operational Period Date/Time", type: "text" },
        ],
      },
      {
        kind: "fields",
        title: "Treatment of Injured/Ill Staff",
        fields: [
          { key: "treatment_area_location", label: "Location of Staff Treatment Area", type: "text" },
          { key: "treatment_area_contact", label: "Contact Information", type: "text" },
          { key: "treatment_team_leader", label: "Treatment Area Team Leader", type: "text" },
          { key: "treatment_team_leader_contact", label: "Contact Information", type: "text" },
          { key: "special_instructions", label: "Special Instructions", type: "textarea" },
        ],
      },
      {
        kind: "fields",
        title: "Resources on Hand",
        fields: [
          { key: "staff_md_do", label: "MD/DO", type: "number" },
          { key: "staff_pa_np", label: "PA/NP", type: "number" },
          { key: "staff_rn_lpn", label: "RN/LPN", type: "number" },
          { key: "staff_technicians_cn", label: "Technicians/CN", type: "number" },
          { key: "staff_ancillary_other", label: "Ancillary/Other", type: "number" },
          { key: "transport_litters", label: "Litters", type: "number" },
          { key: "transport_portable_beds", label: "Portable Beds", type: "number" },
          { key: "transport_transport", label: "Transport", type: "number" },
          { key: "transport_wheelchairs", label: "Wheelchairs", type: "number" },
          { key: "medication", label: "Medication", type: "textarea" },
          { key: "supplies", label: "Supplies", type: "textarea" },
        ],
      },
      {
        kind: "repeating",
        title: "Temporary Medical Treatment Site(s)",
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "address", label: "Address", type: "text" },
          { key: "phone", label: "Phone", type: "text" },
          { key: "specialty_care", label: "Specialty Care (specify)", type: "text" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "prepared_by", label: "Prepared By (Support Branch Director)", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-251",
    title: "Facility System Status Report",
    purpose: "Record facility status for the operational period.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "op_period", label: "Operational Period Date/Time", type: "text" },
          { key: "date_prepared", label: "Date Prepared", type: "date" },
          { key: "time_prepared", label: "Time Prepared", type: "time" },
          { key: "building_name", label: "Building Name", type: "text" },
        ],
      },
      {
        kind: "grid",
        title: "Communication System",
        rowLabels: [
          "Fax",
          "Information Technology System (email/registration/patient records/time card system/intranet, etc.)",
          "Nurse Call System",
          "Paging - Public Address",
          "Radio Equipment",
          "Satellite System",
          "Telephone System, External",
          "Telephone System, Proprietary",
          "Video-Television-Internet-Cable",
          "Other",
        ],
        columns: [
          { key: "status", label: "Status", type: "select", options: FUNCTIONAL_OPTIONS },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "grid",
        title: "Infrastructure",
        rowLabels: [
          "Campus Roadways",
          "Fire Detection/Suppression System",
          "Food Preparation Equipment",
          "Ice Machines",
          "Laundry/Linen Service Equipment",
          "Structural Components (building integrity)",
          "Other",
        ],
        columns: [
          { key: "status", label: "Status", type: "select", options: FUNCTIONAL_OPTIONS },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "grid",
        title: "Patient Care System",
        rowLabels: [
          "Decontamination System (including containment)",
          "Digital Radiography System or other X-ray capacity",
          "Ethylene Oxide (EtO)/Sterilizers",
          "Isolation Rooms (positive/negative air)",
          "Other",
        ],
        columns: [
          { key: "status", label: "Status", type: "select", options: FUNCTIONAL_OPTIONS },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "grid",
        title: "Security System",
        rowLabels: ["Door Lockdown Systems", "Surveillance Cameras", "Other"],
        columns: [
          { key: "status", label: "Status", type: "select", options: FUNCTIONAL_OPTIONS },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "grid",
        title: "Utilities, External",
        rowLabels: ["Electrical Power-Primary Service", "Sanitation Systems", "Water", "Natural Gas", "Other"],
        columns: [
          { key: "status", label: "Status", type: "select", options: FUNCTIONAL_OPTIONS },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "grid",
        title: "Utilities, Internal",
        rowLabels: [
          "Air Compressor",
          "Electrical Power, Backup Generator",
          "Elevators/Escalators",
          "Hazardous Waste Containment System",
          "Heating, Ventilation, and Air Conditioning (HVAC)",
          "Medical Gases, Other",
          "Oxygen",
          "Pneumatic Tube",
          "Steam Boiler",
          "Sump Pump",
          "Well Water System",
          "Vacuum (for patient use)",
          "Water Heater and Circulators",
          "Other",
        ],
        columns: [
          { key: "status", label: "Status", type: "select", options: FUNCTIONAL_OPTIONS },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "certifying_officer", label: "Certifying Officer", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-252",
    title: "Section Personnel Time Sheet",
    purpose: "Record each Section's personnel time and activity.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "from_datetime", label: "From Date/Time", type: "text" },
          { key: "to_datetime", label: "To Date/Time", type: "text" },
          { key: "section", label: "Section", type: "text" },
          { key: "team_leader", label: "Team Leader", type: "text" },
        ],
      },
      {
        kind: "repeating",
        title: "Time Record",
        fields: [
          { key: "name", label: "Responder Name", type: "text" },
          { key: "rv", label: "Responder (R) / Volunteer (V)", type: "select", options: ["R", "V"] },
          { key: "responder_number", label: "Responder Number", type: "text" },
          { key: "job", label: "Response Function/Job", type: "text" },
          { key: "time_in", label: "Time In", type: "time" },
          { key: "time_out", label: "Time Out", type: "time" },
          { key: "total_hours", label: "Total Hours", type: "number" },
          { key: "signature", label: "Signature", type: "text" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "certifying_officer", label: "Certifying Officer", type: "text" },
          { key: "submitted_at", label: "Date/Time Submitted", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-253",
    title: "Volunteer Staff Registration",
    purpose: "Volunteer sign-in for the operational period.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "from_datetime", label: "From Date/Time", type: "text" },
          { key: "to_datetime", label: "To Date/Time", type: "text" },
          { key: "section", label: "Section", type: "text" },
          { key: "team_leader", label: "Team Leader", type: "text" },
        ],
      },
      {
        kind: "repeating",
        title: "Registration",
        fields: [
          { key: "name", label: "Name (Last, First)", type: "text" },
          { key: "address", label: "Address (City, State, Zip)", type: "text" },
          { key: "ssn", label: "Social Security Number", type: "text" },
          { key: "phone", label: "Telephone Number", type: "text" },
          { key: "certification", label: "Certification/Licensure and Number", type: "text" },
          { key: "time_in", label: "Time In", type: "time" },
          { key: "time_out", label: "Time Out", type: "time" },
          { key: "signature", label: "Signature", type: "text" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "certifying_officer", label: "Certifying Officer", type: "text" },
          { key: "submitted_at", label: "Date/Time Submitted", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-254",
    title: "Disaster Victim/Patient Tracking Form",
    purpose: "Account for victims of the identified event seeking medical attention.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "incident_name", label: "Incident Name", type: "text" },
          { key: "date_prepared", label: "Date/Time Prepared", type: "text" },
          { key: "op_period", label: "Operational Period Date/Time", type: "text" },
        ],
      },
      {
        kind: "repeating",
        title: "Triage Areas (Immediate, Delayed, Expectant, Minor, Morgue)",
        fields: [
          { key: "triage_no", label: "MR# / Triage #", type: "text" },
          { key: "name", label: "Name", type: "text" },
          { key: "sex", label: "Sex", type: "select", options: ["M", "F"] },
          { key: "dob_age", label: "DOB / Age", type: "text" },
          { key: "area_triaged_to", label: "Area Triaged To", type: "text" },
          { key: "diagnostic_procedures", label: "Location/Time of Diagnostic Procedures (x-ray, angio, CT, etc.)", type: "text" },
          { key: "time_to_surgery", label: "Time Sent to Surgery", type: "time" },
          { key: "disposition", label: "Disposition (home, admit, morgue, transfer)", type: "text" },
          { key: "time_of_disposition", label: "Time of Disposition", type: "time" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "submitted_by", label: "Submitted By", type: "text" },
          { key: "area_assigned_to", label: "Area Assigned To", type: "text" },
          { key: "submitted_at", label: "Date/Time Submitted", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-255",
    title: "Master Patient Evacuation Tracking Form",
    purpose: "Record patient disposition during a hospital/facility evacuation.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "incident_name", label: "Incident Name", type: "text" },
          { key: "date_prepared", label: "Date/Time Prepared", type: "text" },
          { key: "patient_tracking_manager", label: "Patient Tracking Manager", type: "text" },
        ],
      },
      {
        kind: "repeating",
        title: "Patient Evacuation Information",
        fields: [
          { key: "patient_name", label: "Patient Name", type: "text" },
          { key: "medical_record_no", label: "Medical Record #", type: "text" },
          { key: "disposition", label: "Disposition", type: "select", options: ["Home", "Transfer"] },
          { key: "triage_category", label: "Evacuation Triage Category", type: "select", options: ["Immediate", "Delayed", "Minor", "Expired"] },
          { key: "accepting_hospital", label: "Accepting Hospital", type: "text" },
          { key: "hospital_contacted_time", label: "Time Hospital Contacted & Report Given", type: "text" },
          { key: "transfer_initiated", label: "Transfer Initiated (Time / Transport Co.)", type: "text" },
          { key: "med_record_sent", label: "Med Record Sent", type: "select", options: YES_NO },
          { key: "medication_sent", label: "Medication Sent", type: "select", options: YES_NO },
          { key: "family_notified", label: "Family Notified", type: "select", options: YES_NO },
          { key: "arrival_confirmed", label: "Arrival Confirmed", type: "select", options: YES_NO },
          { key: "admit_location", label: "Admit Location", type: "select", options: ["Floor", "ICU", "ER"] },
          { key: "expired_time", label: "Expired (time)", type: "time" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "submitted_by", label: "Submitted By", type: "text" },
          { key: "area_assigned_to", label: "Area Assigned To", type: "text" },
          { key: "submitted_at", label: "Date/Time Submitted", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-257",
    title: "Resource Accounting Record",
    purpose: "Track requested equipment.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "section", label: "Section", type: "text" },
          { key: "op_period", label: "Operational Period Date/Time", type: "text" },
        ],
      },
      {
        kind: "repeating",
        title: "Resource Record",
        fields: [
          { key: "time", label: "Time", type: "time" },
          { key: "item", label: "Item/Facility Tracking ID #", type: "text" },
          { key: "condition", label: "Condition", type: "text" },
          { key: "received_from", label: "Received From", type: "text" },
          { key: "dispensed_to", label: "Dispensed To", type: "text" },
          { key: "returned_at", label: "Returned (Date/Time)", type: "text" },
          { key: "returned_condition", label: "Condition Returned (or nonrecoverable)", type: "text" },
          { key: "initials", label: "Initials", type: "text" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "certifying_officer", label: "Certifying Officer", type: "text" },
          { key: "submitted_at", label: "Date/Time Submitted", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-259",
    title: "Casualty/Fatality Report",
    purpose: "Document the number of injuries and fatalities.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "incident_name", label: "Incident Name", type: "text" },
          { key: "date", label: "Date", type: "date" },
          { key: "time", label: "Time", type: "time" },
          { key: "op_period", label: "Operational Period Date/Time", type: "text" },
        ],
      },
      {
        kind: "grid",
        title: "Number of Casualties/Fatalities",
        rowLabels: [
          "Patients seen",
          "Waiting to be seen",
          "Admitted",
          "Critical care bed",
          "Medical/surgical bed",
          "Pediatric bed",
          "Discharged",
          "Transferred",
          "Expired",
        ],
        columns: [
          { key: "adult", label: "Adult", type: "number" },
          { key: "pediatric", label: "Pediatric (<18 years old)", type: "number" },
          { key: "total", label: "Total", type: "number" },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "prepared_by", label: "Prepared By (Patient Tracking Manager)", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-260",
    title: "Patient Tracking Form (Transfers and Discharges)",
    purpose: "Document details and account for patients transferred to another facility.",
    sections: [
      {
        kind: "fields",
        title: "Patient Information",
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "unit", label: "Unit", type: "text" },
          { key: "patient_name", label: "Patient Name", type: "text" },
          { key: "age", label: "Age", type: "text" },
          { key: "mr_number", label: "MR #", type: "text" },
          { key: "diagnosis", label: "Diagnosis(es)", type: "textarea" },
          { key: "admitting_physician", label: "Admitting Physician", type: "text" },
          { key: "family_notified", label: "Family Notified", type: "select", options: YES_NO },
          { key: "family_contact_info", label: "Contact Information", type: "text" },
          { key: "isolation", label: "Isolation", type: "select", options: YES_NO },
          { key: "isolation_type", label: "Isolation Type", type: "text" },
          { key: "isolation_reason", label: "Isolation Reason", type: "text" },
        ],
      },
      {
        kind: "fields",
        title: "Accompanying Equipment",
        fields: [
          { key: "eq_hospital_bed", label: "Hospital Bed", type: "checkbox" },
          { key: "eq_gurney", label: "Gurney", type: "checkbox" },
          { key: "eq_wheelchair", label: "Wheel Chair", type: "checkbox" },
          { key: "eq_ambulatory", label: "Ambulatory", type: "checkbox" },
          { key: "eq_iv_pumps", label: "IV Pumps", type: "checkbox" },
          { key: "eq_oxygen", label: "Oxygen", type: "checkbox" },
          { key: "eq_ventilator", label: "Ventilator", type: "checkbox" },
          { key: "eq_chest_tubes", label: "Chest Tube(s)", type: "checkbox" },
          { key: "eq_isolette_warmer", label: "Isolette/Warmer", type: "checkbox" },
          { key: "eq_traction", label: "Traction", type: "checkbox" },
          { key: "eq_monitor", label: "Monitor", type: "checkbox" },
          { key: "eq_a_line_swan", label: "A-Line/Swan", type: "checkbox" },
          { key: "eq_foley_catheter", label: "Foley Catheter", type: "checkbox" },
          { key: "eq_halo_device", label: "Halo-Device", type: "checkbox" },
          { key: "eq_cranial_bolt_screw", label: "Cranial Bolt/Screw", type: "checkbox" },
          { key: "eq_io_device", label: "IO Device", type: "checkbox" },
          { key: "eq_other", label: "Other", type: "text" },
        ],
      },
      {
        kind: "fields",
        title: "Departing Location",
        fields: [
          { key: "departing_room", label: "Room #", type: "text" },
          { key: "departing_time", label: "Time", type: "time" },
          { key: "departing_id_band_confirmed", label: "ID Band Confirmed", type: "select", options: YES_NO },
          { key: "departing_id_band_by", label: "Confirmed By", type: "text" },
          { key: "departing_med_record_sent", label: "Medical Record Sent", type: "select", options: YES_NO },
          { key: "belongings", label: "Belongings", type: "select", options: ["With Patient", "Given to family", "None"] },
          { key: "valuables", label: "Valuables", type: "select", options: ["With Patient", "Left in Safe", "None"] },
          { key: "medications", label: "Medications", type: "select", options: ["With Patient", "Given to family", "Other"] },
          { key: "medications_other_explain", label: "Explain Other", type: "text" },
          { key: "peds_bag_mask_sent", label: "Peds: Bag/Mask with Tubing Sent", type: "select", options: YES_NO },
          { key: "peds_bulb_syringe_sent", label: "Peds: Bulb Syringe Sent", type: "select", options: YES_NO },
        ],
      },
      {
        kind: "fields",
        title: "Arriving Location",
        fields: [
          { key: "arriving_room", label: "Room #", type: "text" },
          { key: "arriving_time", label: "Time", type: "time" },
          { key: "arriving_id_band_confirmed", label: "ID Band Confirmed", type: "select", options: YES_NO },
          { key: "arriving_id_band_by", label: "Confirmed By", type: "text" },
          { key: "arriving_med_record_sent", label: "Medical Record Sent", type: "select", options: YES_NO },
          { key: "belongings_received", label: "Belongings Received", type: "select", options: YES_NO },
          { key: "valuables_received", label: "Valuables Received", type: "select", options: YES_NO },
          { key: "medications_received", label: "Medications Received", type: "select", options: YES_NO },
          { key: "peds_bag_mask_received", label: "Peds: Bag/Mask with Tubing Received", type: "select", options: YES_NO },
          { key: "peds_bulb_syringe_received", label: "Peds: Bulb Syringe Received", type: "select", options: YES_NO },
        ],
      },
      {
        kind: "fields",
        title: "Transferring to Another Facility",
        fields: [
          { key: "time_to_staging_area", label: "Time to Staging Area", type: "time" },
          { key: "time_departing", label: "Time Departing to Receiving Facility", type: "time" },
          { key: "destination", label: "Destination", type: "text" },
          { key: "transportation", label: "Transportation", type: "select", options: ["Ambulance", "Unit", "Helicopter", "Other"] },
          { key: "transfer_id_band_confirmed", label: "ID Band Confirmed", type: "select", options: YES_NO },
          { key: "transfer_id_band_by", label: "Confirmed By", type: "text" },
          { key: "departure_time", label: "Departure Time", type: "time" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
  {
    code: "HICS-261",
    title: "Incident Action Safety Analysis",
    purpose: "Document hazards and define mitigation.",
    sections: [
      {
        kind: "fields",
        fields: [
          { key: "incident_name", label: "Incident Name", type: "text" },
          { key: "date_prepared", label: "Date Prepared", type: "date" },
          { key: "time_prepared", label: "Time Prepared", type: "time" },
        ],
      },
      {
        kind: "repeating",
        title: "Hazard Mitigation",
        fields: [
          { key: "hazard", label: "Potential/Actual Hazards (biohazards, structural, utility, traffic, etc.)", type: "textarea" },
          { key: "location", label: "Section or Branch and Location", type: "text" },
          { key: "mitigations", label: "Mitigations (e.g., PPE, buddy system, escape routes)", type: "textarea" },
          { key: "completed_sign_off", label: "Mitigation Completed (Sign Off)", type: "text" },
        ],
      },
      {
        kind: "fields",
        fields: [
          { key: "safety_officer", label: "Safety Officer", type: "text" },
          { key: "facility_name", label: "Facility Name", type: "text" },
        ],
      },
    ],
  },
];

export function otherFormByCode(code: string): OtherFormDef | undefined {
  return OTHER_FORMS.find((f) => f.code === code);
}

// A short one-line summary for a submission's row in the list view, pulled
// from the first couple of fields in the form's first "fields" section
// (e.g. incident name / date) so entries are distinguishable at a glance.
export function summarizeSubmission(def: OtherFormDef, data: Record<string, unknown>): string {
  const firstFields = def.sections.find((s) => s.kind === "fields");
  if (!firstFields || firstFields.kind !== "fields") return "";
  const parts = firstFields.fields
    .slice(0, 2)
    .map((f) => data[f.key])
    .filter((v) => typeof v === "string" && v.trim() !== "");
  return parts.join(" — ");
}
