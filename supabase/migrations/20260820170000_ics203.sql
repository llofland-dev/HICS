-- ICS/HICS 203 Organization Assignment List: the command-staffing roster
-- for one operational period. Sections 3-7 of the real form (Command
-- Staff, Operations, Planning, Logistics, Finance/Admin) are already fully
-- modeled -- they're just assignments grouped by positions.section for the
-- selected operational period. What's new here is the handful of fields
-- the form has beyond the org chart: Agency Executive, External Agency
-- Representative(s), Hospital Representative(s), and the prepared-by
-- sign-off -- all scoped to an operational period like the roster itself.
create table public.ics203_details (
  operational_period_id    uuid primary key references public.operational_periods (id) on delete cascade,
  agency_executive_name    text,
  agency_executive_contact text,
  prepared_by_name         text,
  prepared_by_signature    text,
  prepared_at              timestamptz,
  prepared_by_facility     text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.ics203_external_reps (
  id                     uuid primary key default gen_random_uuid(),
  operational_period_id  uuid not null references public.operational_periods (id) on delete cascade,
  agency_name            text not null,
  representative_name    text,
  contact_info           text,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics203_external_reps_op_id_idx on public.ics203_external_reps (operational_period_id);

create table public.ics203_hospital_reps (
  id                     uuid primary key default gen_random_uuid(),
  operational_period_id  uuid not null references public.operational_periods (id) on delete cascade,
  name                   text not null,
  role                   text,
  location               text,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics203_hospital_reps_op_id_idx on public.ics203_hospital_reps (operational_period_id);

-- ---------------------------------------------------------------------------
-- RLS: each table hangs off operational_period_id rather than incident_id
-- directly, so join through operational_periods for the same
-- visible/own-facility checks used everywhere else.
-- ---------------------------------------------------------------------------
alter table public.ics203_details enable row level security;

create policy ics203_details_select on public.ics203_details
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_details.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics203_details_write on public.ics203_details
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_details.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_details.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics203_external_reps enable row level security;

create policy ics203_external_reps_select on public.ics203_external_reps
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_external_reps.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics203_external_reps_write on public.ics203_external_reps
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_external_reps.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_external_reps.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics203_hospital_reps enable row level security;

create policy ics203_hospital_reps_select on public.ics203_hospital_reps
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_hospital_reps.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics203_hospital_reps_write on public.ics203_hospital_reps
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_hospital_reps.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics203_hospital_reps.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );
