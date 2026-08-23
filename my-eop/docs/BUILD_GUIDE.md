# Playbook — Skeleton Build Guide

This is the ordered, de-duplicated build sequence for **Playbook**, a mobile-first PWA
that distributes a custom Emergency Operations Plan to hospital/org staff. It reflects
the architecture actually built and verified in the `TESTORG` instance, with all
customer-specific content (transcribed hospital Codes, POTS lines, Job Action Sheets,
etc.) stripped out. Use this to scaffold a clean starter template for onboarding a new
customer org.

**Not yet built — see [Known Gap](#known-gap-content-upload-ui) at the end.** Content for
`TESTORG` was loaded by an engineer running one-off Node scripts against the service-role
key. That doesn't work for self-serve customer onboarding and is the next thing to build,
not a step in this guide.

## 1. Product shape

- Two audiences, two access models:
  - **Field staff** (the actual app users): no account. Enter an org code, optionally a
    password, get read-only access to that org's content. Works offline once loaded.
  - **Org admin**: a real Supabase Auth account, full CRUD over their org's content.
- One Supabase project serves many orgs (`organizations` table), each fully isolated.
- Content model: **Sections → Pages** (rich-text reference material), **Contacts**
  (one-touch dial/email), **Forms** (fill + email, no backend inbox), **Checklists**
  (check-off state is local-only, per device).

## 2. Project scaffold

Next.js App Router project, sibling to (not integrated with) any existing app in the
repo — separate Supabase project, separate auth, separate schema.

- `next.config.ts`: set `turbopack.root` explicitly if the repo root has its own
  `package-lock.json` that would otherwise confuse Turbopack's root inference.
- Tailwind v4. **Gotcha:** the JIT scanner needs complete literal class strings in
  source — never build a Tailwind class via template-literal interpolation
  (`` `bg-[${COLOR}]` ``); write the full string once in a constants file and only ever
  concatenate the *already-resolved* string afterward.
- `server-only` package to hard-block the service-role Supabase client from ever being
  importable into client code.
- PWA basics: `public/manifest.webmanifest`, a hand-rolled `public/sw.js`
  (network-first with cache fallback for the app shell), and a client component that
  registers the service worker **in production only** — registering it in dev causes
  stale-chunk hydration errors across restarts, since chunk hashes change every restart
  but an already-registered SW can keep serving old ones.

## 3. Database schema — every migration, verbatim, in the order it was run

These are the actual `supabase/migrations/*.sql` files, in filename (timestamp) order.
Run them in exactly this order — later ones assume earlier tables/functions exist, and
some later ones (7–10) are easy to mis-order from memory since they read as
independent one-column additions but were not applied in the order their subject
matter might suggest.

### 1 — `20260821120000_schema.sql` (core schema)

```sql
-- Playbook: plan/contact/form/checklist distribution app — core schema.
-- Independent of the HICS incident-command schema in ../../supabase/migrations —
-- this project has its own Supabase instance.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Organizations: one row per client org. org_code is the public, shareable
-- lookup code staff type in at the front door (see /). access_password_hash
-- is the optional second factor — never selected directly by any client,
-- only ever touched via the security-definer RPCs in the RLS migration.
-- ---------------------------------------------------------------------------
create table public.organizations (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  org_code               text not null unique,
  access_password_hash   text,
  created_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles: links a Supabase auth user (an org's content admin) to the org
-- they manage, for RLS scoping on the admin side.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  org_id        uuid references public.organizations (id),
  role          text not null default 'admin' check (role in ('admin')),
  display_name  text,
  created_at    timestamptz not null default now()
);

create index profiles_org_id_idx on public.profiles (org_id);

-- ---------------------------------------------------------------------------
-- Plan content: sections are the flip-chart "tabs", pages are the content
-- within each tab, shown in sort_order.
-- ---------------------------------------------------------------------------
create table public.plan_sections (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index plan_sections_org_id_idx on public.plan_sections (org_id);

create table public.plan_pages (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.plan_sections (id) on delete cascade,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  body        text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index plan_pages_section_id_idx on public.plan_pages (section_id);
create index plan_pages_org_id_idx on public.plan_pages (org_id);

-- ---------------------------------------------------------------------------
-- Contacts: one-touch-dial contact list.
-- ---------------------------------------------------------------------------
create table public.contacts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  role_title  text,
  phone       text,
  category    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index contacts_org_id_idx on public.contacts (org_id);

-- ---------------------------------------------------------------------------
-- Forms: fillable forms staff complete on-device and email out. `fields` is
-- an ordered array of {id, label, type, required}, type one of
-- text|phone|email|textarea|checkbox|date. No submission storage — the
-- point (per the source product) is a mailto: composed on-device, not a
-- backend inbox.
-- ---------------------------------------------------------------------------
create table public.forms (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations (id) on delete cascade,
  title            text not null,
  description      text,
  recipient_email  text,
  fields           jsonb not null default '[]'::jsonb,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create index forms_org_id_idx on public.forms (org_id);

-- ---------------------------------------------------------------------------
-- Checklists: e.g. incident-command role checklists. Check-off state is kept
-- client-side (localStorage) since it's ephemeral per-drill/event use, so
-- there's no response/state table here — just the checklist definitions.
-- ---------------------------------------------------------------------------
create table public.checklists (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  category    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index checklists_org_id_idx on public.checklists (org_id);

create table public.checklist_items (
  id            uuid primary key default gen_random_uuid(),
  checklist_id  uuid not null references public.checklists (id) on delete cascade,
  org_id        uuid not null references public.organizations (id) on delete cascade,
  text          text not null,
  sort_order    integer not null default 0
);

create index checklist_items_checklist_id_idx on public.checklist_items (checklist_id);
```

### 2 — `20260821120100_rls.sql` (RLS + public-access RPCs)

Security-critical migration — `current_org_id()` helper, the three `eop_*` RPCs that
implement the public code+password gate without ever exposing the password hash, and
standard `authenticated`-role "all for my own org" policies on every content table.
**No anon `select` policy exists on any content table, on purpose** — public reads
never go through RLS at all (see §4/§5).

```sql
-- Row Level Security for the admin/content-editor side, plus the
-- security-definer RPCs that implement the public org-code + password gate.
--
-- Two distinct audiences, two distinct mechanisms:
--   - Org admins authenticate via Supabase Auth and get scoped read/write
--     access to their own org's content through ordinary RLS policies below.
--   - Field staff (the public /plan/[code] side) never get a Supabase Auth
--     session at all. They call the RPCs below through the anon key, and on
--     success the app issues its own signed session cookie
--     (src/lib/eop-session.ts). All public content reads then go through a
--     service-role client scoped explicitly to that cookie's org_id — see
--     src/lib/supabase/admin.ts — bypassing RLS by design, so there are
--     deliberately NO anon-role select policies on the content tables below.

-- ---------------------------------------------------------------------------
-- Helper: the calling (authenticated) user's own org id.
-- ---------------------------------------------------------------------------
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Public RPCs backing the org-code + password gate. security definer so
-- they can read organizations.access_password_hash without ever returning
-- it to the caller; granted to anon since field staff have no session.
-- ---------------------------------------------------------------------------
create or replace function public.eop_lookup_org(p_code text)
returns table (id uuid, name text, has_password boolean)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, (o.access_password_hash is not null)
  from public.organizations o
  where o.org_code = p_code;
$$;

revoke all on function public.eop_lookup_org(text) from public;
grant execute on function public.eop_lookup_org(text) to anon, authenticated;

create or replace function public.eop_verify_org_password(p_org_id uuid, p_password text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select coalesce(
    (select o.access_password_hash = crypt(p_password, o.access_password_hash)
     from public.organizations o
     where o.id = p_org_id),
    false
  );
$$;

revoke all on function public.eop_verify_org_password(uuid, text) from public;
grant execute on function public.eop_verify_org_password(uuid, text) to anon, authenticated;

-- Admin-only: set or clear (pass null/empty) the calling admin's own org
-- password. Never exposes the hash — write-only from the client's view.
create or replace function public.eop_set_org_password(p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public.current_org_id() is null then
    raise exception 'no org for current user';
  end if;

  update public.organizations
  set access_password_hash = case
    when p_password is null or p_password = '' then null
    else crypt(p_password, gen_salt('bf'))
  end
  where id = public.current_org_id();
end;
$$;

revoke all on function public.eop_set_org_password(text) from public;
grant execute on function public.eop_set_org_password(text) to authenticated;

-- ---------------------------------------------------------------------------
-- organizations: an admin can read/update their own org, but never the
-- password hash column directly (only through eop_set_org_password above).
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;

create policy organizations_select on public.organizations
  for select to authenticated
  using (id = public.current_org_id());

create policy organizations_update on public.organizations
  for update to authenticated
  using (id = public.current_org_id())
  with check (id = public.current_org_id());

revoke update on public.organizations from authenticated;
grant update (name, org_code) on public.organizations to authenticated;

-- ---------------------------------------------------------------------------
-- profiles: a user can see/update their own profile only.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Content tables: standard "all for my own org" policy, admin side only.
-- ---------------------------------------------------------------------------
create policy plan_sections_all on public.plan_sections
  for all to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());
alter table public.plan_sections enable row level security;

create policy plan_pages_all on public.plan_pages
  for all to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());
alter table public.plan_pages enable row level security;

create policy contacts_all on public.contacts
  for all to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());
alter table public.contacts enable row level security;

create policy forms_all on public.forms
  for all to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());
alter table public.forms enable row level security;

create policy checklists_all on public.checklists
  for all to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());
alter table public.checklists enable row level security;

create policy checklist_items_all on public.checklist_items
  for all to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());
alter table public.checklist_items enable row level security;
```

### 3 — `20260821120200_org_bootstrap.sql` (self-serve org creation)

```sql
-- Auto-provision a public.profiles row on sign-up (mirrors the HICS project's
-- profile_provisioning migration), plus the self-serve org bootstrap RPC: the
-- first admin for a new client org creates it themselves at sign-up time,
-- since (unlike HICS's facilities) my-eop orgs are independent customers
-- with no pre-existing admin to assign them.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.eop_create_org_for_self(p_name text, p_org_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if public.current_org_id() is not null then
    raise exception 'user already belongs to an org';
  end if;

  insert into public.organizations (name, org_code) values (p_name, p_org_code)
  returning id into v_org_id;

  update public.profiles set org_id = v_org_id where id = auth.uid();

  return v_org_id;
end;
$$;

revoke all on function public.eop_create_org_for_self(text, text) from public;
grant execute on function public.eop_create_org_for_self(text, text) to authenticated;
```

### 4 — `20260821130000_contacts_email.sql`

```sql
-- Contacts screen in the redesign matches the reference product's dedicated
-- call + email action buttons per contact — add the missing email column.
alter table public.contacts add column email text;
```

### 5 — `20260822090000_section_category.sql`

```sql
-- Top-level home-screen category each section belongs to (Codes, ICS, Job
-- Action Sheets, POTS — see src/lib/categories.ts for the fixed list). Null
-- means uncategorized; the admin UI defaults new sections to 'codes' so this
-- should rarely happen in practice, but nothing at the DB level enforces it.
alter table public.plan_sections add column category text;
```

### 6 — `20260822100000_checklist_home_category.sql`

```sql
-- Lets a checklist (e.g. a Job Action Sheet, converted into a checklist)
-- appear under one of the fixed home-screen categories in
-- src/lib/categories.ts, alongside category-filtered plan_sections. Distinct
-- from the existing free-text `category` column, which is just a display
-- subtitle (e.g. "Incident Commander") on the flat Checklists list and isn't
-- tied to the home-screen category system at all.
alter table public.checklists add column home_category text;
```

### 7 — `20260822110000_category_subcategory.sql`

```sql
-- Second nesting level under a home-screen category (e.g. HICS -> "Job
-- Action Sheets" -> the 4 role checklists), requested after the user
-- clarified Job Action Sheets should sit inside an "HICS" tile rather than
-- be its own top-level tile. Free text (not a fixed list like categories in
-- src/lib/categories.ts) since the user expects to add more HICS sub-groups
-- ad hoc (e.g. "Role Responsibilities"). Null means "show directly in the
-- category list, no sub-grouping" — the existing behavior for everything
-- that doesn't need this.
alter table public.plan_sections add column subcategory text;
alter table public.checklists add column subcategory text;
```

### 8 — `20260822120000_checklist_description.sql`

```sql
-- A checklist's mission/purpose statement (e.g. a Job Action Sheet's
-- "Mission:" line) is a statement, not an action — it shouldn't render as a
-- checkbox item. Gives checklists a dedicated place for that text, shown
-- above the checkable items instead of mixed into them.
alter table public.checklists add column description text;
```

### 9 — `20260823090000_section_color.sql`

```sql
-- Per-Code section colors (e.g. Code Red = red, Code Pink = pink) are a real
-- hospital convention, not something an auto-cycled palette can represent.
-- Null means "auto-cycle by list position", preserving existing behavior for
-- sections that don't set one.
alter table public.plan_sections add column color_key text;
```

### 10 — `20260823140000_contact_pinned.sql`

```sql
-- Backlog item 3 (AOC): every source doc references calling the
-- Administrator-on-Call, so the most useful thing is fast access to
-- whichever contact matters most right now — not a full on-call rotation
-- schedule, which nobody asked for. A generic "pinned" flag (rather than a
-- magic "AOC" category string) lets an org feature any contact — AOC today,
-- something else if their needs change — on the plan's home screen.
alter table public.contacts add column pinned boolean not null default false;
```

### 11 — `20260824090000_org_logo_storage.sql`

```sql
-- Storage bucket for org-uploaded logos, shown across that org's public
-- screens and admin dashboard once uploaded (see the logo_path column added
-- in the next migration). Public bucket — every logo must be readable
-- without auth, since staff view the public /plan/[code] side with no
-- Supabase Auth session at all. Writes are restricted to an authenticated
-- admin uploading only into their own org's folder (object path always
-- starts with "<org_id>/").
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy "org logos are publicly readable"
on storage.objects for select
using (bucket_id = 'org-logos');

create policy "admins upload their own org logo"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = public.current_org_id()::text
);

create policy "admins update their own org logo"
on storage.objects for update
to authenticated
using (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = public.current_org_id()::text
)
with check (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = public.current_org_id()::text
);

create policy "admins delete their own org logo"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = public.current_org_id()::text
);
```

### 12 — `20260824090100_organizations_logo.sql`

```sql
-- Path (within the org-logos storage bucket) to this org's uploaded logo.
-- Null means "no custom logo yet" — every screen falls back to the
-- Playbook product logo. Also extend eop_lookup_org so the pre-verification
-- access-gate screen (which runs before any session exists, via the anon
-- key) can show the org's own logo too, not just its name.
alter table public.organizations add column logo_path text;

drop function public.eop_lookup_org(text);

create or replace function public.eop_lookup_org(p_code text)
returns table (id uuid, name text, has_password boolean, logo_path text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, (o.access_password_hash is not null), o.logo_path
  from public.organizations o
  where o.org_code = p_code;
$$;

revoke all on function public.eop_lookup_org(text) from public;
grant execute on function public.eop_lookup_org(text) to anon, authenticated;
```

### 13 — `20260824100000_harden_org_bootstrap.sql`

Fixes a real bug found by testing the self-serve signup flow end-to-end: when Supabase
requires email confirmation (the default), `signUp()` returns no session, but the
original `eop_create_org_for_self` only checked "does this user already have an org" —
it never checked that there was an authenticated caller at all. Supabase's JS client
always sends *some* Authorization header (falling back to the anon key with no
session), so the unauthenticated call still reached the function, `auth.uid()` resolved
to null, the "already has an org" check trivially passed, and it created a real,
permanently orphaned organization while silently updating zero profile rows — success
returned to the caller with no indication anything was wrong. See §4 for the matching
app-code fix (the signup page no longer calls this RPC until it confirms a session
actually exists).

```sql
create or replace function public.eop_create_org_for_self(p_name text, p_org_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if public.current_org_id() is not null then
    raise exception 'user already belongs to an org';
  end if;

  insert into public.organizations (name, org_code) values (p_name, p_org_code)
  returning id into v_org_id;

  update public.profiles set org_id = v_org_id where id = auth.uid();

  return v_org_id;
end;
$$;
```

Note that migrations 5–8 (category/home_category/subcategory/description) landed
*before* migrations 9–10 (color_key/pinned) chronologically, even though this guide's
narrative sections above group color and pinned with the earlier core-schema
discussion for readability. Run them in the numeric order above, not the order topics
are introduced elsewhere in this document.

## 4. Auth & session plumbing

- **Admin side**: standard `@supabase/ssr` browser/server client pair
  (`lib/supabase/client.ts`, `lib/supabase/server.ts`), a `proxy.ts` (this Next
  version's replacement for `middleware.ts`) that refreshes the session cookie, and a
  route-group split — `src/app/admin/(protected)/**` requires an authenticated user
  with `profiles.org_id` set (else render nothing/redirect); `src/app/admin/login` and
  `src/app/admin/signup` sit **outside** that group so they aren't gated by their own
  login check.
- **Public side**: no Supabase Auth session at all.
  - `lib/eop-session.ts`: signs/verifies an HMAC-signed httpOnly cookie carrying
    `org_id` + expiry, using a server-only secret.
  - `POST /api/verify` route handler: calls `eop_lookup_org` /
    `eop_verify_org_password`, sets the cookie on success.
  - `lib/eop-org.ts`: `getVerifiedOrg(code)` (reads + validates the cookie against the
    URL's code param) and `lookupOrgByCode(code)` (pre-verification existence check),
    used by every public page.
  - `lib/supabase/admin.ts`: a **service-role** client, `server-only`-guarded, used for
    every public content read — always explicitly filtered to the verified cookie's
    `org_id` in the query itself. This is what makes the password a real gate instead
    of a guessable-UUID exercise, without needing per-visitor accounts.

**Self-serve signup gotcha** (`src/app/admin/signup/page.tsx`): don't call
`eop_create_org_for_self` immediately after `supabase.auth.signUp()`. If the project
requires email confirmation (the default), `signUp()` returns no session yet — check
`signUpData.session` first. If it's null, show a "check your email" screen instead of
proceeding; only call the org-creation RPC once a session actually exists. Two things
make this safe even if a caller gets it wrong: the RPC itself now rejects unauthenticated
calls outright (migration 13 in §3 — don't rely on `grant execute ... to authenticated`
alone, the JS client still sends a request with the anon key when there's no session,
so add an explicit `if auth.uid() is null then raise exception` inside the function
body too), and `src/app/admin/(protected)/create-org-form.tsx` (shown to a signed-in
user with no org yet) is the actual place org creation completes after confirming —
carry the org name/code the user already typed through as `signUp`'s
`options.data` (`pending_org_name`/`pending_org_code`) so `CreateOrgForm` can pre-fill
them instead of asking twice.

## 5. Public app — information architecture

Five-screen flow, each a route:

1. **`/`** — pure splash: logo, app name, "Get Started" → `/menu`.
2. **`/menu`** — "View My Plan" → `/code`, "Admin Sign In" → `/admin/login`.
3. **`/code`** — org-code entry form → `/plan/[code]`.
4. **`/plan/[code]`** (the hub) — three states:
   - No cookie + code doesn't resolve → "Code not found."
   - No cookie + code resolves → password/confirm gate (`access-gate.tsx`).
   - Verified → the home screen: an optional pinned-contact quick-call card, then a
     grid of tiles — one per fixed home category (see `lib/categories.ts`) plus one
     each for Contacts/Forms/Checklists (which stay in the bottom toolbar too, by
     design — both are live nav paths, not a replacement of one by the other).
5. **`/plan/[code]/categories/[categoryKey]`** and **`.../[categoryKey]/[subKey]`** —
   the category (and optional subcategory) drill-down: merges `plan_sections` and
   `checklists` that belong to that category into one colored-row list. If the list
   resolves to exactly one item, redirect straight through it (skip a pointless
   one-item screen) — reuse this list-building logic as a shared helper
   (`lib/category-items.ts`), don't duplicate it per route.
6. **`.../sections/[sectionId]`** → **`.../pages/[pageId]`** — section table-of-contents,
   then single-page view (prev/next between pages), header colored to match the
   section.
7. **`.../contacts`**, **`.../forms`** → **`.../forms/[formId]`**, **`.../checklists`** →
   **`.../checklists/[checklistId]`** — each a colored-row index page plus a detail
   view. A checklist assigned to a home category is excluded from the generic
   `/checklists` index (it lives under its home tile instead — don't show it twice). A
   checklist's `description`, if set, renders above the items with no checkbox.

All of `/plan/[code]/**` shares a `layout.tsx` that re-verifies the cookie and renders
the floating bottom toolbar (Home/Contacts/Forms/Checklists) only when verified — never
on the pre-verification gate screen.

**Back-link discipline**: every detail page's back link should point to where the user
actually came from in the category/subcategory hierarchy (e.g. a section under
category → subcategory should return to that subcategory list, not jump to Home) —
compute it from the row's own `category`/`subcategory` columns, not a hardcoded parent
route.

## 6. Design system

- `lib/palette.ts`: a named, ordered array of row/button color pairs. **Only ever
  append new colors — never reorder or insert** — the array's position also serves as
  the auto-cycle sequence for anything with no explicit color, so reordering silently
  recolors existing content. `colorForIndex(i)` (pure position-based cycling, for
  Forms/Checklists which have no real-world color convention) and
  `colorForSection(section, i)` (honors an explicit `color_key` if set, else falls back
  to `colorForIndex`).
- `lib/categories.ts`: the fixed, small list of home-screen categories (not free text —
  a dropdown, so content can't fragment into typo'd near-duplicates), each with an
  icon and a color reused from the palette.
- Hand-rolled minimal inline SVG icon set (`components/icons.tsx`) — no icon library
  dependency for a small, stable set of glyphs.
- Shared `PlanHeader` (solid color bar, back chevron, title) and `PlanToolbar` (floating
  pill bottom nav) components, reused across every public screen.
- `components/markdown.tsx`: `react-markdown` + `remark-gfm`, styled to match app
  typography, tables wrapped in a horizontal-scroll container (won't fit a phone
  screen otherwise). Two non-obvious pieces:
  - A pre-processing regex linkifies bare NANP-format phone numbers
    (`\b\d{3}-\d{3}-\d{4}\b`) into `tel:` markdown links before parsing, so any phone
    number typed into any page body becomes tap-to-dial automatically.
  - `react-markdown`'s default URL sanitizer strips non-http(s)/mailto schemes
    (including `tel:`) — pass a custom `urlTransform` that explicitly allows `tel:`
    through (falling back to the library default for everything else), or the linkified
    links above render with an empty `href`.
- **Per-org logo** (migrations 11–12 in §3): an org can upload its own logo (Supabase
  Storage, bucket `org-logos`, object path always `<org_id>/...` so the storage RLS
  policies can scope writes per org), shown in place of the product logo everywhere
  *after* code entry — hub, category/section headers, the pre-verification access-gate
  screen, and that org's own admin dashboard. Before code entry (`/`, `/menu`), there's
  no org context yet, so those screens keep the product's own branding. A fresh
  filename per upload (`<org_id>/logo-<timestamp>.<ext>`, not a fixed name + overwrite)
  sidesteps browser image-caching — the public URL changes whenever the logo changes,
  so there's no stale cached copy to invalidate. `PlanHeader` takes an optional
  `logoUrl` prop; thread it through from `getVerifiedOrg`'s (or `lookupOrgByCode`'s, on
  the pre-verification path) computed public URL on every page that renders it — there
  are close to a dozen of these, all one-line additions, easy to miss one.

## 7. Admin app

- `src/app/admin/(protected)/layout.tsx`: shared shell (logo, org name, nav).
- One editor per content type (`plan/plan-editor.tsx`, `contacts/contacts-editor.tsx`,
  `forms/forms-editor.tsx`, `checklists/checklists-editor.tsx`) — each a client
  component doing direct Supabase-client CRUD against its table, reordering via
  simple up/down buttons that swap `sort_order` values (no drag-and-drop dependency).
- Section/checklist editors include the color and category/subcategory pickers
  described above; forms support a `select` field type with a comma-separated options
  input shown conditionally.
- `create-org-form.tsx`: shown in place of the dashboard when a logged-in admin has no
  `org_id` yet — calls `eop_create_org_for_self`. Accepts optional pre-fill props (see
  the signup gotcha in §4) so a user arriving here after confirming their email doesn't
  have to retype the org name/code they already entered at signup.
- **Getting-started guidance** (`admin/(protected)/page.tsx`): when an org has zero rows
  across all four content tables (checked with `count: "exact", head: true` queries, no
  need to fetch actual rows), the Overview page shows a short numbered guide pointing at
  Plan content → Contacts → Checklists → Forms, in that priority order, instead of just
  the bare org-settings form. It has no dismiss state to track — once the org has any
  content the counts stop being all-zero and the guide stops rendering on its own.

## Onboarding model: shared deployment, not one deployment per customer

The schema is genuinely multi-tenant already — every content table is `org_id`-scoped,
RLS enforces isolation on the admin side at the database level, and the public side
enforces it in application code (every service-role query explicitly filtered by the
verified session cookie's `org_id` — see §4). A new customer does **not** need a
separate deployment or a separate Supabase project: they self-serve sign up at
`/admin/signup`, same as any other customer, on this same running app and database.
"Skeleton" in that model means making sure a brand-new org's first-run experience is
clean, not maintaining a separate template codebase to clone. Concretely, that meant
(and this list is worth re-running whenever something new is added to the schema):

- No hardcoded references to any specific customer's org code anywhere in `src/`.
- Every content-list screen — admin and public — has a real empty state, not a blank or
  broken one, when a table has zero rows for that org.
- The self-serve signup flow was **broken** until the fix described in §3/§4 above — it
  silently created an orphaned, unreachable organization and dead-ended on a blank page
  whenever email confirmation was required (which is the default for a new Supabase
  project). This is the kind of bug that only surfaces by actually running the flow
  end-to-end, not by reading the code — worth doing again after any future change to
  the signup path.

There's no ceiling on customer count imposed by this design — it scales the same way
any other row in a Postgres table scales. The real constraints are whichever Supabase
and hosting plan tier is in use (storage/bandwidth/connection quotas), not the schema.

## Known gap: content-upload UI

Every piece of real content in the working instance was loaded by an engineer running
one-off Node scripts (`scripts/*.mjs`) directly against the service-role key — reading
a source `.docx`/`.xlsx`, hand-mapping it into the schema above, and inserting rows.
That is **not a viable onboarding path for a new customer** and is the next real
feature to build before this can be a self-serve starter template:

- An authenticated admin-side flow to **upload a document** (Word/Excel) and have it
  parsed into a proposed set of sections/pages (or checklist items), with the color and
  category/subcategory already assignable in the same flow.
- A **review-before-publish step** — this content is safety-critical (evacuation
  procedures, active-assailant response, etc.); the admin should see and approve the
  parsed result before it goes live, not have it published sight-unseen.
- Reasonable handling for content that isn't a clean fit for the Section/Page model
  (e.g. a fillable form embedded in a procedure doc, or a checklist-shaped document —
  see the Forms and Checklists content types above, which already exist for exactly
  this) — the upload flow should detect or let the admin choose the right content type
  rather than forcing everything into one shape.
