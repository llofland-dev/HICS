-- org_code: the public, shareable lookup code a new user types at signup
-- to join an existing facility (mirrors my-eop's organizations.org_code).
-- Nullable at the column level (system-type orgs don't need one); unique
-- only where present.
alter table public.organizations add column org_code text;

create unique index organizations_org_code_key
  on public.organizations (org_code)
  where org_code is not null;
