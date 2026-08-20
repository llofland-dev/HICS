-- ICS 214 Activity Log (carryover spec derived-view note: "reference for any
-- after-action report"). One unit_logs row per position/unit/resource per
-- operational period, with two repeating sections as child tables mirroring
-- the real form: block 6 (resources assigned) and block 7 (activity entries).
create table public.unit_logs (
  id                     uuid primary key default gen_random_uuid(),
  incident_id            uuid not null references public.incidents (id) on delete cascade,
  unit_name              text not null,
  position_code          text references public.positions (code),
  leader_name            text,
  home_agency            text,
  op_period_date_from    date,
  op_period_date_to      date,
  op_period_time_from    time,
  op_period_time_to      time,
  prepared_by_name       text,
  prepared_by_position   text,
  prepared_by_signature  text,
  prepared_at            timestamptz,
  created_at             timestamptz not null default now()
);

create index unit_logs_incident_id_idx on public.unit_logs (incident_id);

create table public.unit_log_resources (
  id            uuid primary key default gen_random_uuid(),
  unit_log_id   uuid not null references public.unit_logs (id) on delete cascade,
  name          text not null,
  ics_position  text,
  home_agency   text
);

create index unit_log_resources_unit_log_id_idx on public.unit_log_resources (unit_log_id);

create table public.unit_log_entries (
  id                 uuid primary key default gen_random_uuid(),
  unit_log_id        uuid not null references public.unit_logs (id) on delete cascade,
  entry_date         date not null,
  entry_time         time not null,
  notable_activity   text not null,
  created_at         timestamptz not null default now()
);

create index unit_log_entries_unit_log_id_idx on public.unit_log_entries (unit_log_id);

-- ---------------------------------------------------------------------------
-- RLS: same shape as messages (20260819210200_rls.sql) — visible to any
-- facility that can see the incident (own facility or linked event), but
-- writable only by the incident's own facility. Child tables join back to
-- unit_logs.incident_id for the same check.
-- ---------------------------------------------------------------------------
alter table public.unit_logs enable row level security;

create policy unit_logs_select on public.unit_logs
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy unit_logs_write on public.unit_logs
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

alter table public.unit_log_resources enable row level security;

create policy unit_log_resources_select on public.unit_log_resources
  for select to authenticated
  using (
    exists (
      select 1 from public.unit_logs ul
      where ul.id = unit_log_resources.unit_log_id
        and public.incident_is_visible(ul.incident_id)
    )
  );

create policy unit_log_resources_write on public.unit_log_resources
  for all to authenticated
  using (
    exists (
      select 1 from public.unit_logs ul
      where ul.id = unit_log_resources.unit_log_id
        and public.incident_is_own_facility(ul.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.unit_logs ul
      where ul.id = unit_log_resources.unit_log_id
        and public.incident_is_own_facility(ul.incident_id)
    )
  );

alter table public.unit_log_entries enable row level security;

create policy unit_log_entries_select on public.unit_log_entries
  for select to authenticated
  using (
    exists (
      select 1 from public.unit_logs ul
      where ul.id = unit_log_entries.unit_log_id
        and public.incident_is_visible(ul.incident_id)
    )
  );

create policy unit_log_entries_write on public.unit_log_entries
  for all to authenticated
  using (
    exists (
      select 1 from public.unit_logs ul
      where ul.id = unit_log_entries.unit_log_id
        and public.incident_is_own_facility(ul.incident_id)
    )
  )
  with check (
    exists (
      select 1 from public.unit_logs ul
      where ul.id = unit_log_entries.unit_log_id
        and public.incident_is_own_facility(ul.incident_id)
    )
  );
