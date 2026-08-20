-- ICS/HICS 215A IAP Safety Analysis: the Safety Officer's operational risk
-- assessment for an operational period -- a hazard mitigation log plus
-- Safety Officer / Incident Commander sign-off. One row per operational
-- period (like ics201_briefings / ics203_details), with a repeating
-- hazards table as the child.
create table public.ics215a_analyses (
  operational_period_id    uuid primary key references public.operational_periods (id) on delete cascade,
  prepared_by_name         text,
  prepared_by_signature    text,
  prepared_at              timestamptz,
  prepared_by_facility     text,
  approved_by_name         text,
  approved_by_signature    text,
  approved_at              timestamptz,
  approved_by_facility     text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.ics215a_hazards (
  id                     uuid primary key default gen_random_uuid(),
  operational_period_id  uuid not null references public.operational_periods (id) on delete cascade,
  hazard                 text not null,
  affected_area          text,
  mitigation             text,
  completed              boolean not null default false,
  completed_note         text,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics215a_hazards_op_id_idx on public.ics215a_hazards (operational_period_id);

-- ---------------------------------------------------------------------------
-- RLS: same visible/own-facility shape as the 201/203/204 tables -- both
-- hang off operational_period_id, joined through operational_periods.
-- ---------------------------------------------------------------------------
alter table public.ics215a_analyses enable row level security;

create policy ics215a_analyses_select on public.ics215a_analyses
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics215a_analyses.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics215a_analyses_write on public.ics215a_analyses
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics215a_analyses.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics215a_analyses.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics215a_hazards enable row level security;

create policy ics215a_hazards_select on public.ics215a_hazards
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics215a_hazards.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics215a_hazards_write on public.ics215a_hazards
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics215a_hazards.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics215a_hazards.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );
