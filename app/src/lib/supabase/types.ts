// Hand-written row types matching the migrations in supabase/migrations.
// Replace with `supabase gen types typescript` output once schema churn settles.

export type OrgType = "system" | "facility";
export type IncidentType = "incident" | "exercise" | "tabletop";
export type IncidentStatus = "active" | "closed";
export type AppRole = "member" | "facility_admin" | "system_admin";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  parent_org_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  role: AppRole;
  first_name: string | null;
  last_name: string | null;
}

export interface Incident {
  id: string;
  facility_org_id: string;
  event_id: string | null;
  name: string;
  incident_date: string;
  type: IncidentType;
  status: IncidentStatus;
  created_at: string;
}

export type PositionSection = "Command" | "Operations" | "Planning" | "Logistics" | "Finance";
export type PositionTier = "core" | "expansion";

export interface Position {
  code: string;
  title: string;
  section: PositionSection;
  reports_to_code: string | null;
  tier: PositionTier;
  description: string | null;
}

export interface CustomPosition {
  id: string;
  facility_org_id: string;
  title: string;
  created_at: string;
}

export interface Staff {
  id: string;
  facility_org_id: string;
  name: string;
  role_title: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export interface StaffQualification {
  staff_id: string;
  position_code: string;
  qualified: boolean;
}

export interface Message {
  id: string;
  incident_id: string;
  event_id: string | null;
  incident_name: string | null;
  to_name: string | null;
  to_position_code: string | null;
  from_name: string | null;
  from_position_code: string | null;
  subject: string | null;
  sent_date: string | null;
  sent_time: string | null;
  body: string | null;
  approved_by_name: string | null;
  approved_by_signature: string | null;
  approved_by_position: string | null;
  reply_body: string | null;
  replied_by_name: string | null;
  replied_by_position: string | null;
  reply_date: string | null;
  reply_time: string | null;
  created_at: string;
  created_by: string | null;
}

export interface UnitLog {
  id: string;
  incident_id: string;
  unit_name: string;
  position_code: string | null;
  leader_name: string | null;
  home_agency: string | null;
  op_period_date_from: string | null;
  op_period_date_to: string | null;
  op_period_time_from: string | null;
  op_period_time_to: string | null;
  prepared_by_name: string | null;
  prepared_by_position: string | null;
  prepared_by_signature: string | null;
  prepared_at: string | null;
  created_at: string;
}

export interface UnitLogResource {
  id: string;
  unit_log_id: string;
  name: string;
  ics_position: string | null;
  home_agency: string | null;
}

export interface UnitLogEntry {
  id: string;
  unit_log_id: string;
  entry_date: string;
  entry_time: string;
  notable_activity: string;
  created_at: string;
}

export type CoreElement =
  | "Communications"
  | "Resources and Assets"
  | "Safety and Security"
  | "Staff Responsibilities"
  | "Utilities Management"
  | "Patient Clinical and Support Activities";

export const CORE_ELEMENTS: CoreElement[] = [
  "Communications",
  "Resources and Assets",
  "Safety and Security",
  "Staff Responsibilities",
  "Utilities Management",
  "Patient Clinical and Support Activities",
];

export interface Aar {
  incident_id: string;
  summary: string | null;
  event_name: string | null;
  event_type: string | null;
  date_from: string | null;
  date_to: string | null;
  report_date: string | null;
  location: string | null;
  command_structure_narrative: string | null;
  conclusion: string | null;
  prepared_by_name: string | null;
  prepared_by_title: string | null;
  prepared_by_organization: string | null;
  prepared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AarActionItem {
  id: string;
  incident_id: string;
  core_element: CoreElement | null;
  observation: string | null;
  corrective_action: string;
  responsible_entity: string | null;
  due_date: string | null;
  status: "open" | "in_progress" | "done";
  created_at: string;
}

export interface AarCoreElementNote {
  id: string;
  incident_id: string;
  core_element: CoreElement;
  label: string;
  narrative: string;
  sort_order: number;
  created_at: string;
}

export interface AarCommandHighlight {
  id: string;
  incident_id: string;
  kind: "worked" | "fell_short";
  narrative: string;
  sort_order: number;
  created_at: string;
}

export interface AarCoordinationRole {
  id: string;
  incident_id: string;
  role_title: string;
  person_name: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  incident_id: string;
  position_code: string | null;
  custom_position_id: string | null;
  staff_id: string;
  assigned_at: string;
  unassigned_at: string | null;
}
