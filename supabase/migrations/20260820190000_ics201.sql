-- ICS/HICS 201 Incident Briefing: the initial (or transfer-of-command)
-- briefing packet for an operational period. Section 6, "Current Hospital
-- Incident Management Team," isn't stored here -- it's the same command
-- roster already modeled by assignments/positions for the operational
-- period, rendered as a briefing chart. Everything else on the form is new.
create table public.ics201_briefings (
  operational_period_id    uuid primary key references public.operational_periods (id) on delete cascade,
  situation_summary        text,
  health_safety_briefing   text,
  map_attached             boolean not null default false,
  map_note                 text,
  prepared_by_name         text,
  prepared_by_signature    text,
  briefing_at              timestamptz,
  prepared_by_facility     text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.ics201_objectives (
  id                     uuid primary key default gen_random_uuid(),
  operational_period_id  uuid not null references public.operational_periods (id) on delete cascade,
  objective              text not null,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics201_objectives_op_id_idx on public.ics201_objectives (operational_period_id);

create table public.ics201_actions (
  id                     uuid primary key default gen_random_uuid(),
  operational_period_id  uuid not null references public.operational_periods (id) on delete cascade,
  action_time            time,
  description            text not null,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics201_actions_op_id_idx on public.ics201_actions (operational_period_id);

create table public.ics201_resources (
  id                       uuid primary key default gen_random_uuid(),
  operational_period_id    uuid not null references public.operational_periods (id) on delete cascade,
  resource                 text not null,
  date_time_ordered        timestamptz,
  eta                      timestamptz,
  date_time_arrived        timestamptz,
  notes                    text,
  sort_order               int not null default 0,
  created_at               timestamptz not null default now()
);

create index ics201_resources_op_id_idx on public.ics201_resources (operational_period_id);

-- ---------------------------------------------------------------------------
-- RLS: same visible/own-facility shape as the 203/204 tables -- everything
-- here hangs off operational_period_id, so join through operational_periods.
-- ---------------------------------------------------------------------------
alter table public.ics201_briefings enable row level security;

create policy ics201_briefings_select on public.ics201_briefings
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_briefings.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics201_briefings_write on public.ics201_briefings
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_briefings.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_briefings.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics201_objectives enable row level security;

create policy ics201_objectives_select on public.ics201_objectives
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_objectives.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics201_objectives_write on public.ics201_objectives
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_objectives.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_objectives.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics201_actions enable row level security;

create policy ics201_actions_select on public.ics201_actions
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_actions.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics201_actions_write on public.ics201_actions
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_actions.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_actions.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics201_resources enable row level security;

create policy ics201_resources_select on public.ics201_resources
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_resources.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics201_resources_write on public.ics201_resources
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_resources.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics201_resources.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );
