-- Split profiles.display_name into first_name/last_name, matching the new
-- registration form (First Name, Last Name, Email).

alter table public.profiles add column first_name text;
alter table public.profiles add column last_name text;

update public.profiles
set
  first_name = split_part(display_name, ' ', 1),
  last_name = nullif(trim(substring(display_name from length(split_part(display_name, ' ', 1)) + 1)), '')
where display_name is not null;

alter table public.profiles drop column display_name;

-- Re-narrow the self-service update grant (20260819210200_rls.sql granted
-- update(display_name); that grant was dropped along with the column).
grant update (first_name, last_name) on public.profiles to authenticated;

-- Auto-provisioning trigger now reads first_name/last_name from signup
-- metadata instead of a single display_name field.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;
