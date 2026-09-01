-- Persists which Playbook incident a MEDICS incident has been matched to,
-- so the human only picks it once instead of re-selecting from a dropdown
-- on every visit to Import-from-Playbook. No FK: the referenced row lives in
-- Playbook's own separate Supabase project, not this database. Same pattern
-- as incidents.event_id (see incidents_update RLS policy) -- an incident's
-- own facility decides what it links to, gated by the existing policy.
alter table public.incidents
  add column playbook_incident_id uuid;
