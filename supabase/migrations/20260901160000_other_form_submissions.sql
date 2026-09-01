-- Generic, JSONB-backed submissions for the "Other Forms" tier -- the 10
-- additional HICS forms (206, 251-255, 257, 259-261) that don't warrant the
-- same fully-normalized bespoke-table treatment as 201/203/204/213/214/
-- 215A/AAR. One row per filled-out form, tied to an incident, with the
-- form's own fields captured as JSON per the schema in
-- app/src/lib/other-forms.ts.
create table public.other_form_submissions (
  id            uuid primary key default gen_random_uuid(),
  incident_id   uuid not null references public.incidents (id) on delete cascade,
  form_code     text not null,
  data          jsonb not null default '{}',
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index other_form_submissions_incident_id_idx on public.other_form_submissions (incident_id);
create index other_form_submissions_form_code_idx on public.other_form_submissions (form_code);

-- ---------------------------------------------------------------------------
-- RLS: same visible/own-facility shape as aar/assignments/messages.
-- ---------------------------------------------------------------------------
alter table public.other_form_submissions enable row level security;

create policy other_form_submissions_select on public.other_form_submissions
  for select to authenticated
  using (public.incident_is_visible(incident_id));

create policy other_form_submissions_write on public.other_form_submissions
  for all to authenticated
  using (public.incident_is_own_facility(incident_id))
  with check (public.incident_is_own_facility(incident_id));
