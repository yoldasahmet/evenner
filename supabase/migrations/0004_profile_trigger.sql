-- Auto-create a profile row whenever a new auth user is created. Runs as
-- SECURITY DEFINER so it bypasses RLS (the app's own insert can be blocked by
-- the row-level policies). This is the canonical Supabase pattern and makes
-- profile creation reliable regardless of how the user signed up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, linkedin_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    new.raw_user_meta_data ->> 'linkedin_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: create profiles for any existing users that don't have one yet
-- (e.g. accounts created before this trigger existed).
insert into public.profiles (id, full_name, avatar_url, linkedin_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'),
  u.raw_user_meta_data ->> 'linkedin_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
