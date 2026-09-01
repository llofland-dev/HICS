-- Gives the AAR its own editable, curated timeline, distinct from the raw
-- unit_log_entries (ICS 214) it can be seeded from. A real AAR timeline
-- isn't a verbatim dump of the operational log -- it's consolidated,
-- corrected, and grouped by day/phase during a post-incident review
-- ("hotwash") before publishing. This replaces the derive-at-report-time
-- approach noted in 20260820150000_aar_expansion.sql.
--
-- `phase` is free text (e.g. "Day 1 - 6/24", "Command") matching the real
-- AAR's Time | Phase | Update/Action table -- not a separate day-grouping
-- construct, since the real report repeats it per row rather than using
-- section headers.
create table public.aar_timeline_entries (
  id                       uuid primary key default gen_random_uuid(),
  incident_id              uuid not null references public.incidents (id) on delete cascade,
  entry_date               date not null,
  entry_time               time not null,
  phase                    text,
  description              text not null,
  source_unit_log_entry_id uuid references public.unit_log_entries (id) on delete set null,
  created_at               timestamptz not null default now()
);

create index aar_timeline_entries_incident_id_idx on public.aar_timeline_entries (incident_id);
create index aar_timeline_entries_source_idx on public.aar_timeline_entries (source_unit_log_entry_id);

alter table public.aar_timeline_entries enable row level security;

create policy aar_timeline_entries_select on public.aar_timeline_entries
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy aar_timeline_entries_write on public.aar_timeline_entries
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));
