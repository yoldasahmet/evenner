create table if not exists public.evenns (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_ref text not null,
  event_id uuid references public.events(id) on delete cascade,
  event_title text not null,
  event_starts_at text,
  preferences jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','live','completed')),
  created_at timestamptz not null default now()
);
create index if not exists evenns_profile_idx on public.evenns (profile_id);

create table if not exists public.evenn_sessions (
  id uuid primary key default gen_random_uuid(),
  evenn_id uuid not null references public.evenns(id) on delete cascade,
  session_ref text not null,
  position integer not null default 0,
  day text,
  starts_at text,
  ends_at text,
  title text not null,
  speaker text,
  room text,
  track text,
  type text not null default 'session',
  reason text,
  status text not null default 'upcoming' check (status in ('upcoming','joined','completed','skipped')),
  created_at timestamptz not null default now()
);
create index if not exists evenn_sessions_evenn_idx on public.evenn_sessions (evenn_id);

alter table public.evenns enable row level security;
alter table public.evenn_sessions enable row level security;

drop policy if exists "evenns_own" on public.evenns;
create policy "evenns_own" on public.evenns
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "evenn_sessions_own" on public.evenn_sessions;
create policy "evenn_sessions_own" on public.evenn_sessions
  for all using (exists (select 1 from public.evenns v where v.id = evenn_id and v.profile_id = auth.uid()))
  with check (exists (select 1 from public.evenns v where v.id = evenn_id and v.profile_id = auth.uid()));
