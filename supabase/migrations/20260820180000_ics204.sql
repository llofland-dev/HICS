-- ICS/HICS 204 Assignment List: the tactical assignment sheet each activated
-- Section Chief or Branch Director completes for an operational period
-- (objectives -> strategies/tactics -> resources -> assigned unit, plus the
-- roster of units/teams actually assigned). Multiple 204s can exist per
-- operational period -- one per activated section/branch -- same shape as
-- unit_logs (ICS 214) being one per position/unit.
create table public.ics204_assignment_lists (
  id                      uuid primary key default gen_random_uuid(),
  operational_period_id   uuid not null references public.operational_periods (id) on delete cascade,
  section                 text not null check (
    section in ('Command', 'Operations', 'Planning', 'Logistics', 'Finance')
  ),
  section_chief_name      text,
  branch                  text,
  branch_director_name    text,
  special_info            text,
  prepared_by_name        text,
  prepared_by_signature   text,
  prepared_at             timestamptz,
  prepared_by_facility    text,
  created_at              timestamptz not null default now()
);

create index ics204_assignment_lists_op_id_idx on public.ics204_assignment_lists (operational_period_id);

create table public.ics204_objectives (
  id                     uuid primary key default gen_random_uuid(),
  assignment_list_id     uuid not null references public.ics204_assignment_lists (id) on delete cascade,
  objective              text not null,
  strategies_tactics     text,
  resources_required     text,
  unit_assigned_to       text,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics204_objectives_assignment_list_id_idx on public.ics204_objectives (assignment_list_id);

create table public.ics204_units (
  id                     uuid primary key default gen_random_uuid(),
  assignment_list_id     uuid not null references public.ics204_assignment_lists (id) on delete cascade,
  unit_name              text not null,
  leader_name            text,
  location               text,
  members_teams          text,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now()
);

create index ics204_units_assignment_list_id_idx on public.ics204_units (assignment_list_id);

-- ---------------------------------------------------------------------------
-- RLS: same visible/own-facility shape as everywhere else. The parent table
-- joins through operational_periods; the two child tables join through the
-- parent as well.
-- ---------------------------------------------------------------------------
alter table public.ics204_assignment_lists enable row level security;

create policy ics204_assignment_lists_select on public.ics204_assignment_lists
  for select to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics204_assignment_lists.operational_period_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics204_assignment_lists_write on public.ics204_assignment_lists
  for all to authenticated
  using (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics204_assignment_lists.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.operational_periods op
      where op.id = ics204_assignment_lists.operational_period_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics204_objectives enable row level security;

create policy ics204_objectives_select on public.ics204_objectives
  for select to authenticated
  using (
    exists (
      select 1 from public.ics204_assignment_lists al
      join public.operational_periods op on op.id = al.operational_period_id
      where al.id = ics204_objectives.assignment_list_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics204_objectives_write on public.ics204_objectives
  for all to authenticated
  using (
    exists (
      select 1 from public.ics204_assignment_lists al
      join public.operational_periods op on op.id = al.operational_period_id
      where al.id = ics204_objectives.assignment_list_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.ics204_assignment_lists al
      join public.operational_periods op on op.id = al.operational_period_id
      where al.id = ics204_objectives.assignment_list_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );

alter table public.ics204_units enable row level security;

create policy ics204_units_select on public.ics204_units
  for select to authenticated
  using (
    exists (
      select 1 from public.ics204_assignment_lists al
      join public.operational_periods op on op.id = al.operational_period_id
      where al.id = ics204_units.assignment_list_id
        and public.incident_is_visible(op.incident_id)
    )
  );

create policy ics204_units_write on public.ics204_units
  for all to authenticated
  using (
    exists (
      select 1 from public.ics204_assignment_lists al
      join public.operational_periods op on op.id = al.operational_period_id
      where al.id = ics204_units.assignment_list_id
        and public.incident_is_own_facility(op.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.ics204_assignment_lists al
      join public.operational_periods op on op.id = al.operational_period_id
      where al.id = ics204_units.assignment_list_id
        and public.incident_is_own_facility(op.incident_id)
    )
  );
