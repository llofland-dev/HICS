// Hand-written row types matching the migrations in supabase/migrations.
// Replace with `supabase gen types typescript` output once schema churn settles.

export interface Organization {
  id: string;
  name: string;
  org_code: string;
  logo_path: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  role: "admin";
  display_name: string | null;
  created_at: string;
}

export interface PlanSection {
  id: string;
  org_id: string;
  title: string;
  color_key: string | null;
  category: string | null;
  subcategory: string | null;
  sort_order: number;
  created_at: string;
}

export interface PlanPage {
  id: string;
  section_id: string;
  org_id: string;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  org_id: string;
  name: string;
  role_title: string | null;
  phone: string | null;
  email: string | null;
  category: string | null;
  pinned: boolean;
  sort_order: number;
  created_at: string;
}

export type FormFieldType = "text" | "phone" | "email" | "textarea" | "checkbox" | "date" | "select";

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[]; // choices for type "select"
}

export interface EopForm {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  recipient_email: string | null;
  fields: FormField[];
  sort_order: number;
  created_at: string;
}

export interface Checklist {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  category: string | null;
  home_category: string | null;
  subcategory: string | null;
  sort_order: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  org_id: string;
  text: string;
  sort_order: number;
}
