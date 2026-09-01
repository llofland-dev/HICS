-- Public, code-keyed lookup for the signup form. Same trust level as
-- my-eop's eop_lookup_org -- org_code is documented there as "the public,
-- shareable lookup code," so returning just id/name to anon matches that
-- precedent.
create or replace function public.lookup_facility_by_code(p_code text)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name
  from public.organizations o
  where o.org_code = upper(trim(p_code)) and o.type = 'facility';
$$;

revoke all on function public.lookup_facility_by_code(text) from public;
grant execute on function public.lookup_facility_by_code(text) to anon, authenticated;

-- Notification-recipient resolution for the signup-notify route. Granted to
-- anon because it runs right after signUp(), before any session exists --
-- but keyed by the (unguessable, single-use) new profile's uuid rather than
-- by the (guessable, "public") facility code, specifically so this can't be
-- used to enumerate admin emails per facility code from the browser.
create or replace function public.facility_signup_notification_targets(p_profile_id uuid)
returns table (
  kind text,               -- 'new_facility' | 'existing_facility'
  org_id uuid,
  org_name text,
  recipient_emails text[],
  applicant_name text,
  applicant_email text,
  requested_code text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_org_name text;
  v_emails text[];
begin
  select p.first_name, p.last_name, p.email, p.requested_org_code, p.requested_org_id, p.org_id
  into v_profile
  from public.profiles p
  where p.id = p_profile_id;

  -- Unknown profile, or already assigned (stale/duplicate call): nothing to notify.
  if not found or v_profile.org_id is not null then
    return;
  end if;

  if v_profile.requested_org_id is not null then
    select o.name into v_org_name from public.organizations o where o.id = v_profile.requested_org_id;

    select coalesce(array_agg(a.email) filter (where a.email is not null), '{}')
    into v_emails
    from public.profiles a
    where a.org_id = v_profile.requested_org_id and a.role = 'facility_admin';

    -- That facility currently has zero admins: fall back to Super Admin
    -- rather than notifying no one.
    if array_length(v_emails, 1) is null then
      select coalesce(array_agg(sa.email) filter (where sa.email is not null), '{}')
      into v_emails
      from public.profiles sa where sa.role = 'system_admin';
    end if;

    return query select
      'existing_facility', v_profile.requested_org_id, v_org_name, v_emails,
      trim(coalesce(v_profile.first_name, '') || ' ' || coalesce(v_profile.last_name, '')),
      v_profile.email, v_profile.requested_org_code;
  else
    select coalesce(array_agg(sa.email) filter (where sa.email is not null), '{}')
    into v_emails
    from public.profiles sa where sa.role = 'system_admin';

    return query select
      'new_facility', null::uuid, null::text, v_emails,
      trim(coalesce(v_profile.first_name, '') || ' ' || coalesce(v_profile.last_name, '')),
      v_profile.email, v_profile.requested_org_code;
  end if;
end;
$$;

revoke all on function public.facility_signup_notification_targets(uuid) from public;
grant execute on function public.facility_signup_notification_targets(uuid) to anon, authenticated;

-- Super Admin approves a "new facility" request: creates the facility org
-- under EPS and promotes the requester to facility_admin of it, atomically.
create or replace function public.approve_facility_request(
  p_profile_id uuid,
  p_org_name text,
  p_org_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_system_org_id uuid := public.current_system_org_id();
  v_target record;
  v_new_org_id uuid;
begin
  if public.current_app_role() <> 'system_admin' or v_system_org_id is null then
    raise exception 'not authorized';
  end if;

  select org_id, requested_org_id into v_target from public.profiles where id = p_profile_id;
  if not found then
    raise exception 'profile not found';
  end if;
  if v_target.org_id is not null then
    raise exception 'profile is already assigned to a facility';
  end if;
  if v_target.requested_org_id is not null then
    raise exception 'profile requested an existing facility, not a new one';
  end if;
  if trim(coalesce(p_org_name, '')) = '' then
    raise exception 'organization name is required';
  end if;
  if trim(coalesce(p_org_code, '')) = '' then
    raise exception 'org_code is required';
  end if;

  insert into public.organizations (name, type, parent_org_id, org_code)
  values (trim(p_org_name), 'facility', v_system_org_id, upper(trim(p_org_code)))
  returning id into v_new_org_id;

  update public.profiles
  set org_id = v_new_org_id, role = 'facility_admin'
  where id = p_profile_id;

  return v_new_org_id;
end;
$$;

grant execute on function public.approve_facility_request(uuid, text, text) to authenticated;

-- Facility admin changes an existing member's role within their own facility.
create or replace function public.update_user_role(p_profile_id uuid, p_role text)
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
  if v_target_org_id is distinct from v_facility_org_id then
    raise exception 'profile is not in your facility';
  end if;
  if p_profile_id = auth.uid() and p_role <> 'facility_admin' then
    raise exception 'cannot demote yourself';
  end if;

  update public.profiles set role = p_role where id = p_profile_id;
end;
$$;

grant execute on function public.update_user_role(uuid, text) to authenticated;

-- Facility admin removes (unassigns, non-destructively) a member from
-- their own facility. Leaves requested_org_code/requested_org_id intact so
-- the removed person lands back in this same facility's pending queue
-- rather than needing to sign up again.
create or replace function public.remove_user_from_facility(p_profile_id uuid)
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

  select org_id into v_target_org_id from public.profiles where id = p_profile_id;
  if v_target_org_id is distinct from v_facility_org_id then
    raise exception 'profile is not in your facility';
  end if;
  if p_profile_id = auth.uid() then
    raise exception 'cannot remove yourself';
  end if;

  update public.profiles set org_id = null, role = 'member' where id = p_profile_id;
end;
$$;

grant execute on function public.remove_user_from_facility(uuid) to authenticated;
