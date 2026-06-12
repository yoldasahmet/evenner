-- Row Level Security for Evenner. Enable RLS and scope each table so users
-- can only touch their own data, while published events stay publicly readable.

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.sponsors enable row level security;
alter table public.onboarding_answers enable row level security;

-- Profiles: a user manages only their own row.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Events: published events are world-readable; organisers manage their own.
create policy "events_select_published_or_own" on public.events
  for select using (is_published or auth.uid() = organiser_id);
create policy "events_insert_own" on public.events
  for insert with check (auth.uid() = organiser_id);
create policy "events_modify_own" on public.events
  for update using (auth.uid() = organiser_id);
create policy "events_delete_own" on public.events
  for delete using (auth.uid() = organiser_id);

-- Helper: does the current user own the event a child row belongs to?
create or replace function public.owns_event(target_event uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event and e.organiser_id = auth.uid()
  );
$$;

-- Sponsors & questions: readable when the parent event is, writable by owner.
create policy "sponsors_select" on public.sponsors
  for select using (
    public.owns_event(event_id)
    or exists (select 1 from public.events e where e.id = event_id and e.is_published)
  );
create policy "sponsors_write" on public.sponsors
  for all using (public.owns_event(event_id))
  with check (public.owns_event(event_id));

-- Onboarding answers: strictly private to the owning profile.
create policy "answers_all_own" on public.onboarding_answers
  for all using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
