create table if not exists public.session_joins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  evenn_session_id uuid not null,
  event_ref text not null,
  event_id uuid references public.events(id) on delete cascade,
  session_ref text not null,
  session_title text not null,
  joined_at timestamptz not null default now()
);
create index if not exists session_joins_event_ref_idx on public.session_joins (event_ref);

create table if not exists public.session_feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  evenn_session_id uuid not null,
  event_ref text not null,
  event_id uuid references public.events(id) on delete cascade,
  session_ref text not null,
  session_title text not null,
  transcript text,
  rating integer check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now()
);
create index if not exists session_feedback_event_ref_idx on public.session_feedback (event_ref);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  evenn_id uuid not null,
  kind text not null check (kind in ('article','repo','video')),
  title text not null,
  url text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists recommendations_evenn_idx on public.recommendations (evenn_id);

alter table public.session_joins enable row level security;
alter table public.session_feedback enable row level security;
alter table public.recommendations enable row level security;

drop policy if exists "joins_own" on public.session_joins;
create policy "joins_own" on public.session_joins
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
drop policy if exists "feedback_own" on public.session_feedback;
create policy "feedback_own" on public.session_feedback
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
drop policy if exists "recs_own" on public.recommendations;
create policy "recs_own" on public.recommendations
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "joins_organiser_read" on public.session_joins;
create policy "joins_organiser_read" on public.session_joins
  for select using (
    (event_id is not null and public.owns_event(event_id))
    or (event_id is null and auth.uid() is not null)
  );
drop policy if exists "feedback_organiser_read" on public.session_feedback;
create policy "feedback_organiser_read" on public.session_feedback
  for select using (
    (event_id is not null and public.owns_event(event_id))
    or (event_id is null and auth.uid() is not null)
  );

do $$ begin
  alter publication supabase_realtime add table public.session_joins;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.session_feedback;
exception when duplicate_object then null; end $$;
