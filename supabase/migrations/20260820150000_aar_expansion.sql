-- Expand the AAR from free-text fields into the structured, six-core-element
-- format used for real after-action reviews going to facility leadership:
-- header metadata, an executive summary, per-core-element findings, a
-- command-structure analysis (what worked / fell short / coordination
-- roles), an improvement plan matrix keyed by core element, a conclusion,
-- and a prepared-by sign-off. The incident timeline itself is not stored
-- here — it's derived at report time from unit_log_entries (ICS 214).

alter table public.aar
  drop column what_went_well,
  drop column needs_improvement,
  add column event_name               text,
  add column event_type               text,
  add column date_from                date,
  add column date_to                  date,
  add column report_date              date,
  add column location                 text,
  add column command_structure_narrative text,
  add column conclusion               text,
  add column prepared_by_name         text,
  add column prepared_by_title        text,
  add column prepared_by_organization text,
  add column prepared_at              date;

alter table public.aar_action_items
  rename column description to corrective_action;

alter table public.aar_action_items
  rename column owner_name to responsible_entity;

alter table public.aar_action_items
  add column core_element text check (
    core_element in (
      'Communications',
      'Resources and Assets',
      'Safety and Security',
      'Staff Responsibilities',
      'Utilities Management',
      'Patient Clinical and Support Activities'
    )
  ),
  add column observation text;

create table public.aar_core_element_notes (
  id            uuid primary key default gen_random_uuid(),
  incident_id   uuid not null references public.incidents (id) on delete cascade,
  core_element  text not null check (
    core_element in (
      'Communications',
      'Resources and Assets',
      'Safety and Security',
      'Staff Responsibilities',
      'Utilities Management',
      'Patient Clinical and Support Activities'
    )
  ),
  label         text not null,
  narrative     text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index aar_core_element_notes_incident_id_idx on public.aar_core_element_notes (incident_id);

create table public.aar_command_highlights (
  id            uuid primary key default gen_random_uuid(),
  incident_id   uuid not null references public.incidents (id) on delete cascade,
  kind          text not null check (kind in ('worked', 'fell_short')),
  narrative     text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index aar_command_highlights_incident_id_idx on public.aar_command_highlights (incident_id);

create table public.aar_coordination_roles (
  id            uuid primary key default gen_random_uuid(),
  incident_id   uuid not null references public.incidents (id) on delete cascade,
  role_title    text not null,
  person_name   text,
  description   text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index aar_coordination_roles_incident_id_idx on public.aar_coordination_roles (incident_id);

-- ---------------------------------------------------------------------------
-- RLS: same shape as the existing aar / aar_action_items policies — visible
-- to any facility that can see the incident, writable only by its own
-- facility. Each new table carries incident_id directly, so no join needed.
-- ---------------------------------------------------------------------------
alter table public.aar_core_element_notes enable row level security;

create policy aar_core_element_notes_select on public.aar_core_element_notes
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy aar_core_element_notes_write on public.aar_core_element_notes
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

alter table public.aar_command_highlights enable row level security;

create policy aar_command_highlights_select on public.aar_command_highlights
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy aar_command_highlights_write on public.aar_command_highlights
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));

alter table public.aar_coordination_roles enable row level security;

create policy aar_coordination_roles_select on public.aar_coordination_roles
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy aar_coordination_roles_write on public.aar_coordination_roles
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));
