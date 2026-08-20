-- HICS multi-facility incident tracker: core schema
-- See HICS_App_Carryover_Spec.md and HICS_App_Requirements_Addendum.md for the requirements
-- this schema implements.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Reference data: standard HICS position taxonomy (seeded in the next
-- migration from hics_positions_seed.json). Global, not facility-scoped.
-- ---------------------------------------------------------------------------
create table public.positions (
  code             text primary key,
  title            text not null,
  section          text not null check (section in ('Command','Operations','Planning','Logistics','Finance')),
  reports_to_code  text references public.positions (code),
  tier             text not null check (tier in ('core','expansion')),
  description      text
);

-- ---------------------------------------------------------------------------
-- Organizations: health systems and their member facilities, in one table
-- (addendum #1). A 'system' row has no parent; a 'facility' row optionally
-- points at the system it belongs to.
-- ---------------------------------------------------------------------------
create table public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           text not null check (type in ('system','facility')),
  parent_org_id  uuid references public.organizations (id),
  created_at     timestamptz not null default now(),
  constraint system_has_no_parent check (type <> 'system' or parent_org_id is null)
);

create index organizations_parent_org_id_idx on public.organizations (parent_org_id);

-- Helper: raise unless the given organization has the expected type.
-- Used by triggers below to keep facility-scoped / system-scoped FKs honest,
-- since a plain FK can't distinguish organizations.type.
create or replace function public.assert_org_type(p_org_id uuid, p_expected_type text)
returns void
language plpgsql
as $$
declare
  v_actual_type text;
begin
  select type into v_actual_type from public.organizations where id = p_org_id;
  if v_actual_type is null then
    raise exception 'organization % not found', p_org_id;
  end if;
  if v_actual_type <> p_expected_type then
    raise exception 'organization % must be type %, got %', p_org_id, p_expected_type, v_actual_type;
  end if;
end;
$$;

create or replace function public.check_facility_org_id()
returns trigger
language plpgsql
as $$
begin
  perform public.assert_org_type(new.facility_org_id, 'facility');
  return new;
end;
$$;

create or replace function public.check_system_org_id()
returns trigger
language plpgsql
as $$
begin
  perform public.assert_org_type(new.system_org_id, 'system');
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Staff roster + qualification matrix (carryover spec #1). One staff row
-- belongs to exactly one facility.
-- ---------------------------------------------------------------------------
create table public.staff (
  id                uuid primary key default gen_random_uuid(),
  facility_org_id   uuid not null references public.organizations (id),
  name              text not null,
  role_title        text,
  phone             text,
  email             text,
  notes             text,
  created_at        timestamptz not null default now()
);

create index staff_facility_org_id_idx on public.staff (facility_org_id);

create trigger staff_check_facility_org
  before insert or update of facility_org_id on public.staff
  for each row execute function public.check_facility_org_id();

create table public.staff_qualifications (
  staff_id       uuid not null references public.staff (id) on delete cascade,
  position_code  text not null references public.positions (code),
  qualified      boolean not null default true,
  primary key (staff_id, position_code)
);

-- ---------------------------------------------------------------------------
-- Custom/local positions: ad-hoc, facility-specific, no qualification
-- tracking (carryover spec #2).
-- ---------------------------------------------------------------------------
create table public.custom_positions (
  id                uuid primary key default gen_random_uuid(),
  facility_org_id   uuid not null references public.organizations (id),
  title             text not null,
  created_at        timestamptz not null default now()
);

create index custom_positions_facility_org_id_idx on public.custom_positions (facility_org_id);

create trigger custom_positions_check_facility_org
  before insert or update of facility_org_id on public.custom_positions
  for each row execute function public.check_facility_org_id();

-- ---------------------------------------------------------------------------
-- Events: system-wide incidents that link multiple facilities' own HICS
-- activations together (addendum #1, the "9/11 scenario").
-- ---------------------------------------------------------------------------
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  system_org_id  uuid not null references public.organizations (id),
  name           text not null,
  event_date     date not null,
  type           text not null check (type in ('incident','exercise','tabletop')),
  status         text not null default 'active' check (status in ('active','closed')),
  created_at     timestamptz not null default now()
);

create index events_system_org_id_idx on public.events (system_org_id);

create trigger events_check_system_org
  before insert or update of system_org_id on public.events
  for each row execute function public.check_system_org_id();

-- ---------------------------------------------------------------------------
-- Incidents: a single facility's own HICS activation (carryover spec #1),
-- optionally linked to a parent event (addendum #1).
-- ---------------------------------------------------------------------------
create table public.incidents (
  id                uuid primary key default gen_random_uuid(),
  facility_org_id   uuid not null references public.organizations (id),
  event_id          uuid references public.events (id),
  name              text not null,
  incident_date     date not null,
  type              text not null check (type in ('incident','exercise','tabletop')),
  status            text not null default 'active' check (status in ('active','closed')),
  created_at        timestamptz not null default now()
);

create index incidents_facility_org_id_idx on public.incidents (facility_org_id);
create index incidents_event_id_idx on public.incidents (event_id);

create trigger incidents_check_facility_org
  before insert or update of facility_org_id on public.incidents
  for each row execute function public.check_facility_org_id();

-- ---------------------------------------------------------------------------
-- Assignments: who is filling which position for a given incident
-- (carryover spec #1/#2). Exactly one of position_code / custom_position_id
-- must be set. unassigned_at (nullable) preserves history for the AAR
-- roster-at-time-of-incident export, while null means "currently assigned".
-- ---------------------------------------------------------------------------
create table public.assignments (
  id                   uuid primary key default gen_random_uuid(),
  incident_id          uuid not null references public.incidents (id) on delete cascade,
  position_code        text references public.positions (code),
  custom_position_id   uuid references public.custom_positions (id),
  staff_id             uuid not null references public.staff (id),
  assigned_at          timestamptz not null default now(),
  unassigned_at        timestamptz,
  constraint one_position_kind check (
    (position_code is not null)::int + (custom_position_id is not null)::int = 1
  )
);

create index assignments_incident_id_idx on public.assignments (incident_id);
create index assignments_staff_id_idx on public.assignments (staff_id);
create index assignments_position_code_idx on public.assignments (position_code);
create index assignments_custom_position_id_idx on public.assignments (custom_position_id);

-- ---------------------------------------------------------------------------
-- Messages: ICS 213 General Message (addendum #2). Supports both
-- intra-facility messages and, via event_id, inter-facility messages within
-- a linked system event.
-- ---------------------------------------------------------------------------
create table public.messages (
  id                     uuid primary key default gen_random_uuid(),
  incident_id            uuid not null references public.incidents (id) on delete cascade,
  event_id               uuid references public.events (id),
  incident_name          text,
  to_name                text,
  to_position_code       text references public.positions (code),
  from_name              text,
  from_position_code     text references public.positions (code),
  subject                text,
  sent_date              date,
  sent_time              time,
  body                   text,
  approved_by_name       text,
  approved_by_signature  text,
  approved_by_position   text,
  reply_body             text,
  replied_by_name        text,
  replied_by_position    text,
  reply_date             date,
  reply_time             time,
  created_at             timestamptz not null default now(),
  created_by             uuid references auth.users (id)
);

create index messages_incident_id_idx on public.messages (incident_id);
create index messages_event_id_idx on public.messages (event_id);

-- ---------------------------------------------------------------------------
-- After Action Review (carryover spec #3), one per incident, plus its
-- action items as their own table for reporting/querying across incidents.
-- ---------------------------------------------------------------------------
create table public.aar (
  incident_id         uuid primary key references public.incidents (id) on delete cascade,
  summary             text,
  what_went_well      text,
  needs_improvement   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.aar_action_items (
  id            uuid primary key default gen_random_uuid(),
  incident_id   uuid not null references public.incidents (id) on delete cascade,
  description   text not null,
  owner_name    text,
  due_date      date,
  status        text not null default 'open' check (status in ('open','in_progress','done')),
  created_at    timestamptz not null default now()
);

create index aar_action_items_incident_id_idx on public.aar_action_items (incident_id);

-- ---------------------------------------------------------------------------
-- Profiles: links a Supabase auth user to an organization and a role, for
-- RLS (addendum #1 permissions section).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  org_id        uuid references public.organizations (id),
  role          text not null default 'member' check (role in ('member','facility_admin','system_admin')),
  display_name  text,
  created_at    timestamptz not null default now()
);

create index profiles_org_id_idx on public.profiles (org_id);
