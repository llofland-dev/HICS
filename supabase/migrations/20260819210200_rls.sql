-- Row Level Security, implementing the permissions design in
-- HICS_App_Requirements_Addendum.md #1:
--   - a facility can edit only its own incident data
--   - any facility linked to an event can read the system-level rollup for it
--   - creating/closing events and linking facilities is a separate,
--     narrow system_admin permission

-- ---------------------------------------------------------------------------
-- Helper functions, evaluated against the calling user's profile row.
-- ---------------------------------------------------------------------------
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- The facility org the caller belongs to (null if their profile is attached
-- to a system org, or has no org yet).
create or replace function public.current_facility_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select o.id
  from public.organizations o
  where o.id = public.current_org_id()
    and o.type = 'facility';
$$;

-- The system org the caller's facility belongs to, or the system org itself
-- if the caller's profile is attached directly to a system org.
create or replace function public.current_system_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select o.parent_org_id from public.organizations o
     where o.id = public.current_org_id() and o.type = 'facility'),
    (select o.id from public.organizations o
     where o.id = public.current_org_id() and o.type = 'system')
  );
$$;

-- True if the given event has at least one incident linked from the
-- caller's own facility (i.e. the caller's facility participates in it).
create or replace function public.facility_linked_to_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.incidents i
    where i.event_id = p_event_id
      and i.facility_org_id = public.current_facility_org_id()
  );
$$;

-- True if the given incident belongs to the caller's own facility.
create or replace function public.incident_is_own_facility(p_incident_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.incidents i
    where i.id = p_incident_id
      and i.facility_org_id = public.current_facility_org_id()
  );
$$;

-- True if the caller's facility can at least view the given incident: it's
-- their own, or it's linked to an event their facility also participates in.
create or replace function public.incident_is_visible(p_incident_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.incidents i
    where i.id = p_incident_id
      and (
        i.facility_org_id = public.current_facility_org_id()
        or (i.event_id is not null and public.facility_linked_to_event(i.event_id))
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- positions: global reference data, readable by anyone signed in, writable
-- only by service_role (migrations), never by the app.
-- ---------------------------------------------------------------------------
alter table public.positions enable row level security;

create policy positions_select on public.positions
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;

create policy organizations_select on public.organizations
  for select to authenticated
  using (
    id = public.current_org_id()
    or id = public.current_system_org_id()
    or parent_org_id = public.current_system_org_id()
  );

create policy organizations_write on public.organizations
  for all to authenticated
  using (
    public.current_app_role() = 'system_admin'
    and (id = public.current_system_org_id() or parent_org_id = public.current_system_org_id())
  )
  with check (
    public.current_app_role() = 'system_admin'
    and (id = public.current_system_org_id() or parent_org_id = public.current_system_org_id())
  );

-- ---------------------------------------------------------------------------
-- staff, staff_qualifications, custom_positions: facility-scoped, both read
-- and write (roster data isn't part of the cross-facility rollup).
-- ---------------------------------------------------------------------------
alter table public.staff enable row level security;

create policy staff_all on public.staff
  for all to authenticated
  using (facility_org_id = public.current_facility_org_id())
  with check (facility_org_id = public.current_facility_org_id());

alter table public.staff_qualifications enable row level security;

create policy staff_qualifications_all on public.staff_qualifications
  for all to authenticated
  using (
    exists (
      select 1 from public.staff s
      where s.id = staff_qualifications.staff_id
        and s.facility_org_id = public.current_facility_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.staff s
      where s.id = staff_qualifications.staff_id
        and s.facility_org_id = public.current_facility_org_id()
    )
  );

alter table public.custom_positions enable row level security;

create policy custom_positions_all on public.custom_positions
  for all to authenticated
  using (facility_org_id = public.current_facility_org_id())
  with check (facility_org_id = public.current_facility_org_id());

-- ---------------------------------------------------------------------------
-- events: viewable by any facility linked to them (or the owning system);
-- create/close/link is system_admin only, scoped to their own system.
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;

create policy events_select on public.events
  for select to authenticated
  using (
    system_org_id = public.current_system_org_id()
    or public.facility_linked_to_event(id)
  );

create policy events_write on public.events
  for all to authenticated
  using (public.current_app_role() = 'system_admin' and system_org_id = public.current_system_org_id())
  with check (public.current_app_role() = 'system_admin' and system_org_id = public.current_system_org_id());

-- ---------------------------------------------------------------------------
-- incidents: own facility can read/write; other facilities linked to the
-- same event get read-only visibility (the system rollup).
-- ---------------------------------------------------------------------------
alter table public.incidents enable row level security;

create policy incidents_select on public.incidents
  for select to authenticated
  using (
    facility_org_id = public.current_facility_org_id()
    or (event_id is not null and public.facility_linked_to_event(event_id))
  );

create policy incidents_write on public.incidents
  for insert to authenticated
  with check (facility_org_id = public.current_facility_org_id());

create policy incidents_update on public.incidents
  for update to authenticated
  using (facility_org_id = public.current_facility_org_id())
  with check (facility_org_id = public.current_facility_org_id());

create policy incidents_delete on public.incidents
  for delete to authenticated
  using (facility_org_id = public.current_facility_org_id());

-- Linking/unlinking a facility's incident to an event is just an update of
-- incidents.event_id — already covered by incidents_update, which is scoped
-- to the caller's own facility, matching "each IC decides whether their own
-- incident joins the event."

-- ---------------------------------------------------------------------------
-- assignments, aar, aar_action_items: readable wherever the parent incident
-- is visible (rollup), writable only for the caller's own facility.
-- ---------------------------------------------------------------------------
alter table public.assignments enable row level security;

create policy assignments_select on public.assignments
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy assignments_write on public.assignments
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

alter table public.aar enable row level security;

create policy aar_select on public.aar
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy aar_write on public.aar
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

alter table public.aar_action_items enable row level security;

create policy aar_action_items_select on public.aar_action_items
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy aar_action_items_write on public.aar_action_items
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

-- ---------------------------------------------------------------------------
-- messages: intra-facility messages follow the incident; cross-facility
-- (event_id set) messages are also visible to any facility linked to that
-- event, but only the sending facility can create/edit its own messages.
-- ---------------------------------------------------------------------------
alter table public.messages enable row level security;

create policy messages_select on public.messages
  for select to authenticated
  using (
    public.incident_is_visible(incident_id)
    or (event_id is not null and public.facility_linked_to_event(event_id))
  );

create policy messages_write on public.messages
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

-- ---------------------------------------------------------------------------
-- profiles: a user can see their own profile and profiles in their own org.
-- Role/org assignment is deliberately left to service_role (admin
-- provisioning), not exposed as a user-writable policy here.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or org_id = public.current_org_id());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Restrict which columns that update policy can actually touch: org_id and
-- role are admin-managed (service_role), not self-service, so only grant
-- column-level UPDATE on display_name to the authenticated role.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
