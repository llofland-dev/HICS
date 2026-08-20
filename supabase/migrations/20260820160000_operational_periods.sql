-- Operational periods: HICS/ICS shift structure for multi-day incidents
-- (e.g. 0700-1900 / 1900-0700). Command staffing is scoped to a period so a
-- facility can formally hand off between shifts -- and the HCC can stand
-- down between periods -- while keeping a clean staffing history per shift.
create table public.operational_periods (
  id             uuid primary key default gen_random_uuid(),
  incident_id    uuid not null references public.incidents (id) on delete cascade,
  period_number  int not null,
  date_from      date not null,
  time_from      time not null,
  date_to        date,
  time_to        time,
  status         text not null default 'active' check (status in ('active', 'closed')),
  created_at     timestamptz not null default now(),
  unique (incident_id, period_number)
);

create index operational_periods_incident_id_idx on public.operational_periods (incident_id);

-- Only one active period per incident at a time.
create unique index operational_periods_one_active_per_incident
  on public.operational_periods (incident_id)
  where status = 'active';

alter table public.assignments
  add column operational_period_id uuid references public.operational_periods (id);

-- Backfill: every existing incident gets an initial Period 1 covering it,
-- and its existing assignments are pointed at that period.
insert into public.operational_periods (incident_id, period_number, date_from, time_from, status)
select id, 1, incident_date, '07:00:00', case when status = 'active' then 'active' else 'closed' end
from public.incidents;

update public.assignments a
set operational_period_id = op.id
from public.operational_periods op
where op.incident_id = a.incident_id
  and op.period_number = 1
  and a.operational_period_id is null;

alter table public.assignments
  alter column operational_period_id set not null;

create index assignments_operational_period_id_idx on public.assignments (operational_period_id);

-- ---------------------------------------------------------------------------
-- RLS: same shape as the other incident-scoped tables -- visible to any
-- facility that can see the incident, writable only by its own facility.
-- ---------------------------------------------------------------------------
alter table public.operational_periods enable row level security;

create policy operational_periods_select on public.operational_periods
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy operational_periods_write on public.operational_periods
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));
