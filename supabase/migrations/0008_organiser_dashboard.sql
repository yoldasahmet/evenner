-- Organiser profile + dashboard.
-- 1. profiles gain organiser company/organisation fields (edited on Profile).
-- 2. Organisers can read registrations (evenns) for their events so the
--    dashboard can compute registration percentages.
-- 3. Seeds two more demo events (AI DevDays, Web Platform Days).
-- 4. Re-anchors every platform-seeded event so its final day is *today*
--    (two-day events land on yesterday + today) — keeps active-event stats
--    demoable on any date.
-- Idempotent: re-running simply re-anchors the dates to the current day.

-- 1. Organiser company fields --------------------------------------------
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists company_website text;
alter table public.profiles add column if not exists company_role text;
alter table public.profiles add column if not exists company_size text;
alter table public.profiles add column if not exists company_about text;

-- 2. Registration visibility for organisers -------------------------------
-- An attendee's evenn is their registration/plan for an event. Owners of an
-- event (and anyone, for platform-seeded events) may count them.
drop policy if exists "evenns_organiser_read" on public.evenns;
create policy "evenns_organiser_read" on public.evenns
  for select using (
    event_id is not null and (
      public.owns_event(event_id)
      or exists (
        select 1 from public.events e
        where e.id = event_id and e.organiser_id is null
      )
    )
  );

-- 3. Two more demo events (yesterday + today) -----------------------------
insert into public.events (id, organiser_id, title, tagline, description, category, format, location, website_url, starts_at, ends_at, capacity, is_published, highlights) values
  ('00000000-0000-4000-a000-000000000004', null, 'Evenner AI DevDays 2026', 'Two days of agents, models and the tooling that ships them.', 'A hands-on gathering for engineers building with AI. Two tracks — Applied AI and Platform — with codelabs, live evals clinics, an expo floor and evening networking. Streamed worldwide with moderated Q&A.', 'Developer conference', 'hybrid', 'Station Berlin & livestream', 'https://devdays.evenner.dev', ((current_date - 1) + time '08:00')::timestamptz, (current_date + time '20:00')::timestamptz, 1800, true, array['20+ sessions across 2 tracks','Hands-on agent codelabs','Live evals clinic','Sponsor expo & demo floor','Prize draws and giveaways']),
  ('00000000-0000-4000-a000-000000000005', null, 'Evenner Web Platform Days 2026', 'A community deep-dive into the modern web platform.', 'Two community-curated days on what the web platform can do natively in 2026: view transitions, speculation rules, modern CSS and edge rendering. Intimate rooms, hands-on workshops and the famous hallway track.', 'Conference', 'in_person', 'Beurs van Berlage, Amsterdam', 'https://webdays.evenner.dev', ((current_date - 1) + time '08:00')::timestamptz, (current_date + time '20:00')::timestamptz, 900, true, array['Two community-curated days','3 rooms and 2 workshop studios','Modern CSS & performance focus','Closing social with the speakers','Prize draws and community awards'])
on conflict (id) do nothing;

insert into public.sessions (id, event_id, day, type, title, description, track, speaker, speaker_title, room, starts_at, ends_at, position, has_prize) values
  -- Evenner AI DevDays 2026 — day 1 (yesterday)
  ('00000000-0000-4000-a040-000000000000', '00000000-0000-4000-a000-000000000004', current_date - 1, 'keynote', 'Opening Keynote: Agents that earn their keep', 'What separates AI demos from AI products in production.', 'Main stage', 'Ada Okonkwo', 'Chief Technology Officer, Evenner', 'Main Hall', '09:00', '09:45', 0, false),
  ('00000000-0000-4000-a040-000000000001', '00000000-0000-4000-a000-000000000004', current_date - 1, 'session', 'Designing tool APIs for LLM agents', null, 'Applied AI', 'Kira Nakamura', 'ML Lead, Evenner', 'Room 1', '10:15', '11:00', 1, true),
  ('00000000-0000-4000-a040-000000000002', '00000000-0000-4000-a000-000000000004', current_date - 1, 'session', 'GPU scheduling for bursty inference', null, 'Platform', 'Marcus Chen', 'Platform Engineer, Google Cloud', 'Room 2', '10:15', '11:00', 2, false),
  ('00000000-0000-4000-a040-000000000003', '00000000-0000-4000-a000-000000000004', current_date - 1, 'workshop', 'Codelab: Evals before vibes', 'Build an eval harness for a real agent. Bring a laptop; 50 seats.', 'Applied AI', 'Jordan Estevez', 'Developer Advocate, Evenner', 'Workshop Hall', '13:00', '15:00', 3, false),
  ('00000000-0000-4000-a040-000000000004', '00000000-0000-4000-a000-000000000004', current_date - 1, 'panel', 'Panel: Build vs buy for AI platforms', null, 'Platform', 'Moderated by Lena Fischer', 'Principal Engineer, Supabase', 'Room 1', '15:30', '16:15', 4, false),
  ('00000000-0000-4000-a040-000000000005', '00000000-0000-4000-a000-000000000004', current_date - 1, 'session', 'Lightning round: community agent demos', null, 'Applied AI', 'Community speakers', null, 'Main Hall', '17:00', '18:00', 5, true),
  -- Evenner AI DevDays 2026 — day 2 (today)
  ('00000000-0000-4000-a040-000000000006', '00000000-0000-4000-a000-000000000004', current_date, 'keynote', 'Day 2 Keynote: Small models, big products', null, 'Main stage', 'Dr. Hannah Weiss', 'Head of Platform, Cloudflare', 'Main Hall', '09:30', '10:15', 6, false),
  ('00000000-0000-4000-a040-000000000007', '00000000-0000-4000-a000-000000000004', current_date, 'session', 'Streaming UX for agentic apps', null, 'Applied AI', 'Priya Raman', 'DX Engineer, Vercel', 'Room 1', '10:45', '11:30', 7, true),
  ('00000000-0000-4000-a040-000000000008', '00000000-0000-4000-a000-000000000004', current_date, 'session', 'Guardrails and policy engines in production', null, 'Platform', 'Sarah Chen', 'Security Engineer, Stripe', 'Room 2', '11:45', '12:30', 8, false),
  ('00000000-0000-4000-a040-000000000009', '00000000-0000-4000-a000-000000000004', current_date, 'workshop', 'Codelab: Ship a multi-agent workflow', 'From single tool-user to orchestrated team. 50 seats.', 'Applied AI', 'David Miller', 'Technical Lead, Langchain', 'Workshop Hall', '13:30', '15:00', 9, false),
  ('00000000-0000-4000-a040-000000000010', '00000000-0000-4000-a000-000000000004', current_date, 'session', 'Cost engineering for LLM products', null, 'Platform', 'Andrew Park', 'Cost Optimization Lead, AWS', 'Room 1', '15:30', '16:15', 10, true),
  ('00000000-0000-4000-a040-000000000011', '00000000-0000-4000-a000-000000000004', current_date, 'keynote', 'Closing Keynote: The next 12 months of AI engineering', null, 'Main stage', 'Ravi Shah', 'Co-founder, Evenner', 'Main Hall', '17:30', '18:30', 11, false),
  -- Evenner Web Platform Days 2026 — day 1 (yesterday)
  ('00000000-0000-4000-a050-000000000000', '00000000-0000-4000-a000-000000000005', current_date - 1, 'keynote', 'Opening Keynote: The platform is the framework', 'How much framework do we still need in 2026?', 'Main stage', 'Sofia Andersson', 'Principal Designer, Figma', 'Grote Zaal', '09:30', '10:10', 0, false),
  ('00000000-0000-4000-a050-000000000001', '00000000-0000-4000-a000-000000000005', current_date - 1, 'session', 'View transitions in production', null, 'Web Platform', 'Jake Archibald', 'Google Chrome', 'Room A', '10:30', '11:05', 1, true),
  ('00000000-0000-4000-a050-000000000002', '00000000-0000-4000-a000-000000000005', current_date - 1, 'session', 'Edge rendering patterns that hold up', null, 'Performance', 'Isabella Molod', 'Engineer, Vercel', 'Room B', '10:30', '11:05', 2, false),
  ('00000000-0000-4000-a050-000000000003', '00000000-0000-4000-a000-000000000005', current_date - 1, 'workshop', 'Workshop: Modern CSS architecture', 'Layers, container queries and scope, hands-on. 40 seats.', 'Web Platform', 'Miriam Suzanne', 'CSS Expert, Oddbird', 'Studio 1', '13:30', '15:30', 3, false),
  ('00000000-0000-4000-a050-000000000004', '00000000-0000-4000-a000-000000000005', current_date - 1, 'panel', 'Panel: Frameworks in 2027', null, 'Main stage', 'Moderated by Chris Coyier', 'Co-founder, CodePen', 'Grote Zaal', '16:00', '16:40', 4, true),
  -- Evenner Web Platform Days 2026 — day 2 (today)
  ('00000000-0000-4000-a050-000000000005', '00000000-0000-4000-a000-000000000005', current_date, 'keynote', 'Day 2 Keynote: A faster web by default', null, 'Main stage', 'Kristofer Baxter', 'Chrome DevRel', 'Grote Zaal', '09:30', '10:10', 5, false),
  ('00000000-0000-4000-a050-000000000006', '00000000-0000-4000-a000-000000000005', current_date, 'session', 'Web components interop in real apps', null, 'Web Platform', 'Stephanie Stimac', 'Chrome DevRel', 'Room A', '10:30', '11:05', 6, false),
  ('00000000-0000-4000-a050-000000000007', '00000000-0000-4000-a000-000000000005', current_date, 'session', 'Speculation rules & instant navigations', null, 'Performance', 'Nolan Lawson', 'Open Source Contributor', 'Room B', '10:30', '11:05', 7, true),
  ('00000000-0000-4000-a050-000000000008', '00000000-0000-4000-a000-000000000005', current_date, 'workshop', 'Workshop: Performance budgeting hands-on', 'Set, measure and defend a real performance budget. 40 seats.', 'Performance', 'Nadia Haddad', 'Staff Engineer, Sentry', 'Studio 1', '13:30', '15:30', 8, false),
  ('00000000-0000-4000-a050-000000000009', '00000000-0000-4000-a000-000000000005', current_date, 'session', 'Privacy-first analytics on the web', null, 'Web Platform', 'Andy Bell', 'Designer & Developer, Piccalilli', 'Room A', '16:00', '16:40', 9, false),
  ('00000000-0000-4000-a050-000000000010', '00000000-0000-4000-a000-000000000005', current_date, 'keynote', 'Closing Keynote: Built on the platform', null, 'Main stage', 'Sofia Andersson', 'Principal Designer, Figma', 'Grote Zaal', '17:30', '18:30', 10, true)
on conflict (id) do nothing;

insert into public.sponsors (id, event_id, name, tier, website_url, logo_url) values
  ('00000000-0000-4000-a04f-000000000000', '00000000-0000-4000-a000-000000000004', 'Anthropic', 'Platinum', 'https://anthropic.com', null),
  ('00000000-0000-4000-a04f-000000000001', '00000000-0000-4000-a000-000000000004', 'Supabase', 'Gold', 'https://supabase.com', 'https://supabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-square.dbbeb048.png&w=256&q=75'),
  ('00000000-0000-4000-a04f-000000000002', '00000000-0000-4000-a000-000000000004', 'Vercel', 'Gold', 'https://vercel.com', 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png'),
  ('00000000-0000-4000-a04f-000000000003', '00000000-0000-4000-a000-000000000004', 'Grafana Labs', 'Silver', 'https://grafana.com', 'https://grafana.com/favicon.ico'),
  ('00000000-0000-4000-a05f-000000000000', '00000000-0000-4000-a000-000000000005', 'Figma', 'Platinum', 'https://figma.com', 'https://avatars.githubusercontent.com/u/5039857?s=200'),
  ('00000000-0000-4000-a05f-000000000001', '00000000-0000-4000-a000-000000000005', 'Progress KendoReact', 'Gold', 'https://www.telerik.com/kendo-react-ui', 'https://www.telerik.com/favicon.ico'),
  ('00000000-0000-4000-a05f-000000000002', '00000000-0000-4000-a000-000000000005', 'Sentry', 'Gold', 'https://sentry.io', 'https://sentry-brand.vercel.app/sentry-logo-black.png'),
  ('00000000-0000-4000-a05f-000000000003', '00000000-0000-4000-a000-000000000005', 'Chromatic', 'Silver', 'https://chromatic.com', 'https://chromatic.com/favicon.ico')
on conflict (id) do nothing;

-- 4. Re-anchor seeded events so their final day is today -------------------
-- Shifts whole events (sessions + event timestamps) by full days; two-day
-- events end up on yesterday + today. Display-time fine-tuning of the last
-- session's clock time stays in src/lib/demo-clock.ts.
do $$
declare ev record; off integer;
begin
  for ev in
    select e.id, max(s.day) as last_day
    from public.events e
    join public.sessions s on s.event_id = e.id
    where e.organiser_id is null and s.day is not null
    group by e.id
  loop
    off := current_date - ev.last_day;
    if off <> 0 then
      update public.sessions set day = day + off where event_id = ev.id;
      update public.events
        set starts_at = starts_at + make_interval(days => off),
            ends_at = ends_at + make_interval(days => off)
        where id = ev.id;
    end if;
  end loop;
end $$;
