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

export interface Assignment {
  id: string;
  incident_id: string;
  position_code: string | null;
  custom_position_id: string | null;
  staff_id: string;
  assigned_at: string;
  unassigned_at: string | null;
}
