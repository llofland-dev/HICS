-- Auto-provision a public.profiles row whenever a new auth.users row is
-- created (i.e. on sign-up), so the app never has to insert one itself.
-- org_id/role are left at their column defaults (null / 'member') — an
-- admin assigns the real org and role afterward, per the profiles RLS
-- design in 20260819210200_rls.sql.

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
