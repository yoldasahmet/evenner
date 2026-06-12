-- Evenner initial schema.
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- 1. Profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  headline text,
  avatar_url text,
  role text not null default 'attendee' check (role in ('attendee', 'organiser')),
  linkedin_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Events -----------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists events_organiser_idx on public.events (organiser_id);

-- 3. Sponsors ---------------------------------------------------------------
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  tier text,
  website_url text,
  logo_url text,
  created_at timestamptz not null default now()
);
create index if not exists sponsors_event_idx on public.sponsors (event_id);

-- 4. Onboarding answers (AI agent interview, per profile) -------------------
create table if not exists public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  question_key text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, question_key)
);
