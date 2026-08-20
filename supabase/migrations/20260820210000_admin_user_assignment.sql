-- Minimal admin onboarding flow for a tight, isolated test group: a
-- facility_admin needs to see who's signed up but not yet linked to a
-- facility, and assign them.

-- profiles.email, so the admin screen can identify a pending signup by more
-- than first/last name (which the signer could leave blank or duplicate).
alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;

-- Let a facility_admin see profiles still waiting for a facility
-- (org_id is null). Read-only -- no write grant on org_id/role is given to
-- `authenticated` at all, so the actual assignment goes through the
-- function below instead of a client-side UPDATE.
create policy profiles_select_unassigned on public.profiles
  for select to authenticated
  using (
    org_id is null
    and public.current_app_role() = 'facility_admin'
  );

-- Assign a pending profile into the calling facility_admin's own facility.
-- Runs as the function owner (bypasses RLS), so org_id/role never need a
-- blanket client-side UPDATE grant -- all the assignment logic (caller must
-- be a facility_admin, target must still be unassigned, role must be
-- member/facility_admin) lives here instead of in a declarative policy that
-- can't compare old vs. new column values.
create or replace function public.assign_profile_to_facility(
  p_profile_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_facility_org_id uuid := public.current_facility_org_id();
  v_target_org_id uuid;
begin
  if public.current_app_role() <> 'facility_admin' or v_facility_org_id is null then
    raise exception 'not authorized';
  end if;

  if p_role not in ('member', 'facility_admin') then
    raise exception 'invalid role %', p_role;
  end if;

  select org_id into v_target_org_id from public.profiles where id = p_profile_id;
  if v_target_org_id is not null then
    raise exception 'profile is already assigned to a facility';
  end if;

  update public.profiles
  set org_id = v_facility_org_id, role = p_role
  where id = p_profile_id;
end;
$$;

grant execute on function public.assign_profile_to_facility(uuid, text) to authenticated;

-- Bootstrap: the test account used throughout development becomes the first
-- facility_admin, so there's someone who can actually see this screen.
update public.profiles
set role = 'facility_admin'
where email = 'emergencyprepsolutions34@gmail.com';
