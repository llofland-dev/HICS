-- Lets a facility_admin connect (or re-point) their OWN facility's Playbook
-- org link themselves. The existing organizations_write policy only allows
-- system_admin -- but system_admin's own org is always type 'system', so
-- current_facility_org_id() is null for them and incidents_select never
-- matches any facility's incident. That made the Import-from-Playbook page
-- (which requires reading the target incident first) unreachable for the
-- only role that could otherwise write this column -- a real dead end, not
-- just an inconvenience. Scoping this to the caller's own facility keeps it
-- self-service and no broader than "manage my own facility's integration."
create policy organizations_facility_admin_playbook_link on public.organizations
  for update to authenticated
  using (id = public.current_facility_org_id() and public.current_app_role() = 'facility_admin')
  with check (id = public.current_facility_org_id() and public.current_app_role() = 'facility_admin');
