-- Links a MEDICS facility to its Playbook org code, so an incident's
-- Import-from-Playbook page knows which Playbook org to pull from. No new
-- RLS policy needed: the existing organizations_write policy (system_admin
-- only, own system/facility orgs) already covers this column correctly --
-- deciding which external org an incident's data maps to is exactly the
-- kind of consequential change that policy exists to gate.
alter table public.organizations
  add column playbook_org_code text;
