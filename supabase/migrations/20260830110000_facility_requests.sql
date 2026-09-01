-- Tracks what a pending signup asked for, so both admin screens (super
-- admin's "new facility requests" and a facility_admin's "pending users")
-- can be scoped correctly instead of leaking every unassigned profile.
alter table public.profiles
  add column requested_org_code text,
  add column requested_org_id uuid references public.organizations (id);

create index profiles_requested_org_id_idx on public.profiles (requested_org_id);

-- Resolve the typed facility code at signup time, inside the trigger --
-- this runs server-side as part of auth.users' own insert, so it works even
-- though the browser has no session yet (email confirmation pending).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := nullif(upper(trim(new.raw_user_meta_data ->> 'facility_code')), '');
begin
  insert into public.profiles (id, email, first_name, last_name, requested_org_code, requested_org_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    v_code,
    (select id from public.organizations where org_code = v_code and type = 'facility')
  );
  return new;
end;
$$;

-- Fix: previously ANY facility_admin could see ALL unassigned profiles
-- globally. Scope to only the requests that named *this* facility_admin's
-- own facility.
drop policy profiles_select_unassigned on public.profiles;

create policy profiles_select_unassigned on public.profiles
  for select to authenticated
  using (
    org_id is null
    and requested_org_id = public.current_facility_org_id()
    and public.current_app_role() = 'facility_admin'
  );

-- New: let the system_admin see signups that didn't match any facility
-- (blank code, or a code that matched nothing) -- these are the "new
-- facility" requests.
create policy profiles_select_new_facility_requests on public.profiles
  for select to authenticated
  using (
    org_id is null
    and requested_org_id is null
    and public.current_app_role() = 'system_admin'
  );
