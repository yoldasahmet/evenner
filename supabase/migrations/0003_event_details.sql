-- Richer events: extra event columns + an agenda `sessions` table covering
-- keynotes, sessions, workshops and panels.

-- 1. Extend events ----------------------------------------------------------
alter table public.events
  add column if not exists tagline text,
  add column if not exists category text,
  add column if not exists format text not null default 'in_person'
    check (format in ('in_person', 'virtual', 'hybrid')),
  add column if not exists website_url text,
  add column if not exists cover_image_url text;

-- 2. Sessions / agenda ------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  day date,
  type text not null default 'session'
    check (type in ('keynote', 'session', 'workshop', 'panel')),
  title text not null,
  description text,
  track text,
  speaker text,
  speaker_title text,
  room text,
  starts_at text,  -- display time, e.g. "09:00"
  ends_at text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists sessions_event_idx on public.sessions (event_id);

alter table public.sessions enable row level security;

create policy "sessions_select" on public.sessions
  for select using (
    public.owns_event(event_id)
    or exists (select 1 from public.events e where e.id = event_id and e.is_published)
  );
create policy "sessions_write" on public.sessions
  for all using (public.owns_event(event_id))
  with check (public.owns_event(event_id));
