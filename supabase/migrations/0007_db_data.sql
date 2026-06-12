-- Moves all hard-coded app data into the database.
-- 1. Schema tweaks: seeded events have no organiser auth user; events gain
--    highlights; sessions gain has_prize.
-- 2. onboarding_questions table + seed (was src/lib/onboarding-questions.ts).
-- 3. Seeds the three demo events (was src/lib/demo/*) with fixed uuids.
-- Idempotent: safe to re-run.

alter table public.events alter column organiser_id drop not null;
alter table public.events add column if not exists highlights text[];
alter table public.sessions add column if not exists has_prize boolean not null default false;

create table if not exists public.onboarding_questions (
  key text primary key,
  prompt text not null,
  hint text,
  icon text,
  placeholder text,
  choices text[],
  multi boolean not null default false,
  category text,
  position integer not null default 0
);
alter table public.onboarding_questions enable row level security;
drop policy if exists "questions_read_all" on public.onboarding_questions;
create policy "questions_read_all" on public.onboarding_questions
  for select using (true);

insert into public.onboarding_questions (key, prompt, hint, icon, placeholder, choices, multi, category, position) values
  ('name', 'What should we call you?', 'Your name as you''d like it shown across evenner.', '👋', 'e.g. Ada Okonkwo', null, false, 'identity', 0),
  ('profession', 'What do you do?', 'Your role and where — one line is plenty.', '💼', 'e.g. Staff Engineer at a fintech startup', null, false, 'identity', 1),
  ('goal', 'What brings you to evenner?', null, '🎯', null, array['Discover events to attend','Organise my own events','Both'], false, 'identity', 2),
  ('primary_domain', 'Which tech domain is closest to your heart?', null, '🧭', null, array['AI & Machine Learning','Web & Frontend','Mobile','Cloud & DevOps','Data & Analytics','Security'], false, 'tech', 3),
  ('experience_level', 'How long have you been in tech?', null, '📈', null, array['Just starting','1–3 years','4–7 years','8+ years'], false, 'tech', 4),
  ('interests', 'Pick the topics that excite you most.', 'Choose as many as you like.', '✨', null, array['AI agents','LLMs','Frontend','Backend','DevOps','Databases','Security','Design systems','Startups','Open source'], true, 'tech', 5),
  ('languages', 'Which languages do you reach for?', 'Pick your daily drivers.', '⌨️', null, array['TypeScript','Python','Go','Rust','Java','C#','Swift','SQL'], true, 'tech', 6),
  ('tools', 'Favourite frameworks & tools?', null, '🧰', 'e.g. Next.js, Supabase, Docker, Figma…', null, false, 'tech', 7),
  ('ai_tools', 'Which AI tools are part of your workflow?', null, '🤖', null, array['Claude','Copilot','Cursor','ChatGPT','Local models','None yet'], true, 'tech', 8),
  ('session_format', 'What kind of sessions pull you in?', null, '🎤', null, array['Hands-on workshops','Keynotes','Panels','Lightning talks','Networking'], true, 'events', 9),
  ('learning_goal', 'What do you want to learn next?', null, '🌱', 'e.g. Ship a production RAG pipeline', null, false, 'events', 10),
  ('community', 'How involved are you in the tech community?', null, '🌍', null, array['I mostly observe','I attend regularly','I speak & contribute','I organise things'], false, 'events', 11),
  ('format', 'Which event formats do you prefer?', null, '🗺️', null, array['In-person','Virtual','Hybrid','No preference'], false, 'events', 12)
on conflict (key) do update set
  prompt = excluded.prompt, hint = excluded.hint, icon = excluded.icon,
  placeholder = excluded.placeholder, choices = excluded.choices,
  multi = excluded.multi, category = excluded.category, position = excluded.position;

-- Evenner I/O Connect 2026 (was demo id "io-connect-2026")
insert into public.events (id, organiser_id, title, tagline, description, category, format, location, website_url, starts_at, ends_at, capacity, is_published, highlights) values
  ('00000000-0000-4000-a000-000000000001', null, 'Evenner I/O Connect 2026', 'Two days of keynotes, deep-dive sessions and hands-on workshops.', 'Evenner I/O Connect is our flagship gathering for developers, founders and product builders. Expect three parallel tracks — AI, Cloud and Web — plus interactive codelabs, a sponsor expo, after-hours networking and live Q&A with the engineers behind the platform. Tickets include all sessions, workshop access (first come, first served) and catered lunch.', 'Developer conference', 'hybrid', 'Shoreline Amphitheatre, Mountain View, CA', 'https://ioconnect.evenner.dev', '2026-08-18T08:00:00Z', '2026-08-20T20:00:00Z', 6000, true, array['30+ sessions across 3 tracks','3 parallel stages with hands-on workshops','Sponsor expo & demo floor','After-party networking each evening','Prize draws and giveaways'])
on conflict (id) do nothing;

insert into public.sessions (id, event_id, day, type, title, description, track, speaker, speaker_title, room, starts_at, ends_at, position, has_prize) values
  ('00000000-0000-4000-a010-000000000000', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'keynote', 'Opening Keynote: The agentic era of software', 'Vision keynote on where AI agents, edge compute and the modern web are heading, with live product reveals.', 'Main stage', 'Ada Okonkwo', 'Chief Technology Officer, Evenner', 'Main Amphitheatre', '09:00', '10:00', 0, false),
  ('00000000-0000-4000-a010-000000000001', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'session', 'Building production RAG with pgvector & Supabase', 'Patterns for retrieval-augmented generation at scale.', 'AI', 'Marcus Lin', 'Staff Engineer, Supabase', 'Hall A', '10:30', '11:15', 1, true),
  ('00000000-0000-4000-a010-000000000002', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'session', 'Streaming UIs with React Server Components', 'Ship interactive, server-first UIs without the waterfall.', 'Web', 'Priya Raman', 'DX Engineer, Vercel', 'Hall B', '10:30', '11:15', 2, false),
  ('00000000-0000-4000-a010-000000000003', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'session', 'Building real-time features with WebSockets', 'Learn how to implement WebSocket connections for real-time updates.', 'Cloud', 'Jennifer Wong', 'Backend Engineer, AWS', 'Hall C', '10:30', '11:15', 3, true),
  ('00000000-0000-4000-a010-000000000004', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'workshop', 'Codelab: Ship an AI agent in 90 minutes', 'Bring a laptop — build, deploy and observe a tool-using agent end to end. Limited to 60 seats.', 'AI', 'Jordan Estevez', 'Developer Advocate, Evenner', 'Workshop Lab 1', '13:00', '15:00', 4, false),
  ('00000000-0000-4000-a010-000000000005', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'panel', 'Panel: Scaling engineering culture past 100 people', null, 'Leadership', 'Moderated by Sam Devi', 'VP Engineering, Linear', 'Hall A', '15:30', '16:15', 5, false),
  ('00000000-0000-4000-a010-000000000006', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'session', 'Database indexing strategies for billion-row tables', 'Deep dive into query optimization and index design patterns.', 'Cloud', 'David Kim', 'Principal Architect, CloudFlare', 'Hall B', '15:30', '16:15', 6, false),
  ('00000000-0000-4000-a010-000000000007', '00000000-0000-4000-a000-000000000001', '2026-08-18', 'session', 'Securing your API with OAuth2 and JWTs', 'Modern authentication patterns for distributed systems.', 'Security', 'Sarah Chen', 'Security Engineer, Stripe', 'Hall C', '16:30', '17:15', 7, true),
  ('00000000-0000-4000-a010-000000000008', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'keynote', 'Day 2 Keynote: Edge, data and the cost of latency', null, 'Main stage', 'Elena Costa', 'Principal Architect, Vercel', 'Main Amphitheatre', '09:30', '10:15', 8, false),
  ('00000000-0000-4000-a010-000000000009', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'session', 'Observability at scale: Metrics, logs and traces', 'Building comprehensive monitoring for microservices.', 'Cloud', 'Alex Rodriguez', 'DevOps Lead, AWS', 'Hall A', '11:00', '12:00', 9, true),
  ('00000000-0000-4000-a010-000000000010', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'session', 'React Server Components deep dive', 'Advanced patterns for RSC architecture and performance.', 'Web', 'Emma Thompson', 'Principal Engineer, Vercel', 'Hall B', '11:00', '12:00', 10, false),
  ('00000000-0000-4000-a010-000000000011', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'session', 'Building AI-powered applications responsibly', 'Ethics, bias, and safety considerations in AI systems.', 'AI', 'Dr. Aisha Patel', 'AI Ethics Lead, Evenner', 'Hall C', '11:00', '12:00', 11, false),
  ('00000000-0000-4000-a010-000000000012', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'workshop', 'Codelab: Row Level Security from zero to prod', 'Design airtight multi-tenant Postgres policies, hands-on.', 'Cloud', 'Marcus Lin', 'Staff Engineer, Supabase', 'Workshop Lab 1', '13:00', '15:00', 12, false),
  ('00000000-0000-4000-a010-000000000013', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'workshop', 'Building a full-stack app with Next.js and Supabase', 'End-to-end tutorial: from database to deployment.', 'Web', 'Thomas Ballinger', 'Developer Advocate, Supabase', 'Workshop Lab 2', '13:00', '15:00', 13, true),
  ('00000000-0000-4000-a010-000000000014', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'session', 'Payments that scale: idempotency & webhooks done right', null, 'Cloud', 'Tom Baird', 'Engineer, Stripe', 'Hall B', '15:30', '16:15', 14, false),
  ('00000000-0000-4000-a010-000000000015', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'panel', 'Panel: The future of AI-assisted development', null, 'AI', 'Moderated by Dr. Sarah Greene', 'VP AI Research, Linear', 'Hall A', '15:30', '16:15', 15, true),
  ('00000000-0000-4000-a010-000000000016', '00000000-0000-4000-a000-000000000001', '2026-08-19', 'session', 'Containerization best practices with Docker & K8s', 'Building production-ready container infrastructure.', 'Cloud', 'Michael Zhang', 'Platform Engineer, AWS', 'Hall C', '16:30', '17:15', 16, false),
  ('00000000-0000-4000-a010-000000000017', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'keynote', 'Day 3 Keynote: Building the next generation of web apps', null, 'Main stage', 'Guillermo Rauch', 'CEO, Vercel', 'Main Amphitheatre', '10:00', '10:45', 17, false),
  ('00000000-0000-4000-a010-000000000018', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'GraphQL best practices and anti-patterns', 'Schema design, caching, and N+1 query solutions.', 'Web', 'Lisa Anderson', 'Staff Engineer, Stripe', 'Hall A', '11:00', '11:45', 18, true),
  ('00000000-0000-4000-a010-000000000019', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'Machine learning model deployment in production', 'From notebooks to serving ML models at scale.', 'AI', 'Dr. James Mitchell', 'ML Engineer, Linear', 'Hall B', '11:00', '11:45', 19, false),
  ('00000000-0000-4000-a010-000000000020', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'Serverless architecture: Trade-offs and best practices', 'When to use serverless, and when not to.', 'Cloud', 'Patricia Green', 'Solutions Architect, AWS', 'Hall C', '11:00', '11:45', 20, true),
  ('00000000-0000-4000-a010-000000000021', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'workshop', 'Codelab: Deploy a full-stack web app to the edge', 'Hands-on workshop building and deploying edge functions.', 'Cloud', 'Jake Rankin', 'Engineer, Vercel', 'Workshop Lab 1', '12:00', '13:30', 21, false),
  ('00000000-0000-4000-a010-000000000022', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'Testing strategies for modern web applications', 'Unit, integration, E2E testing and test pyramid design.', 'Web', 'Rachel Hall', 'QA Lead, Supabase', 'Hall A', '14:00', '14:45', 22, true),
  ('00000000-0000-4000-a010-000000000023', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'panel', 'Panel: Career growth for engineers at any level', null, 'Leadership', 'Moderated by Lisa Wong', 'Head of Engineering, Evenner', 'Hall B', '14:00', '14:45', 23, false),
  ('00000000-0000-4000-a010-000000000024', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'Design systems and component libraries at scale', 'Building and maintaining scalable UI component systems.', 'Web', 'Oliver Chen', 'Design Systems Lead, Linear', 'Hall C', '15:00', '15:45', 24, false),
  ('00000000-0000-4000-a010-000000000025', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'Accessibility: Building inclusive web experiences', 'WCAG, aria, and semantic HTML best practices.', 'Web', 'Jasmine Williams', 'Accessibility Engineer, Vercel', 'Hall A', '15:00', '15:45', 25, true),
  ('00000000-0000-4000-a010-000000000026', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'The road to production: monitoring and incident response', 'On-call rotations, alerting strategies, and post-mortems.', 'Cloud', 'Kevin Brown', 'SRE Manager, CloudFlare', 'Hall B', '16:00', '17:00', 26, true),
  ('00000000-0000-4000-a010-000000000027', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'panel', 'Panel: Open source sustainability and community', null, 'Leadership', 'Moderated by James Wilson', 'Open Source Advocate, Linear', 'Hall A', '16:30', '17:15', 27, true),
  ('00000000-0000-4000-a010-000000000028', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'session', 'Performance optimization in the wild', 'Real-world strategies for improving web application performance.', 'Web', 'Natalie Hughes', 'Performance Engineer, Vercel', 'Hall C', '16:30', '17:15', 28, true),
  ('00000000-0000-4000-a010-000000000029', '00000000-0000-4000-a000-000000000001', '2026-08-20', 'keynote', 'Closing Keynote: The future is collaborative', null, 'Main stage', 'Ada Okonkwo', 'Chief Technology Officer, Evenner', 'Main Amphitheatre', '17:30', '18:30', 29, false)
on conflict (id) do nothing;

insert into public.sponsors (id, event_id, name, tier, website_url, logo_url) values
  ('00000000-0000-4000-a01f-000000000000', '00000000-0000-4000-a000-000000000001', 'Vercel', 'Platinum', 'https://vercel.com', 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png'),
  ('00000000-0000-4000-a01f-000000000001', '00000000-0000-4000-a000-000000000001', 'Supabase', 'Platinum', 'https://supabase.com', 'https://supabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-square.dbbeb048.png&w=256&q=75'),
  ('00000000-0000-4000-a01f-000000000002', '00000000-0000-4000-a000-000000000001', 'Stripe', 'Gold', 'https://stripe.com', 'https://images.ctfassets.net/fzn2n1nzqrizm/kA4W7cris8ifJmyHQ8H5j/eda55b3e88f4e1fa146e0e92f7317ad9/stripe_mark_blue.png'),
  ('00000000-0000-4000-a01f-000000000003', '00000000-0000-4000-a000-000000000001', 'Linear', 'Gold', 'https://linear.app', 'https://linear.app/linear-logo.svg'),
  ('00000000-0000-4000-a01f-000000000004', '00000000-0000-4000-a000-000000000001', 'AWS', 'Silver', 'https://aws.amazon.com', 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg'),
  ('00000000-0000-4000-a01f-000000000005', '00000000-0000-4000-a000-000000000001', 'CloudFlare', 'Silver', 'https://cloudflare.com', 'https://www.cloudflare.com/favicon.ico')
on conflict (id) do nothing;

-- Frontend Horizons 2026 (was demo id "frontend-horizons-2026")
insert into public.events (id, organiser_id, title, tagline, description, category, format, location, website_url, starts_at, ends_at, capacity, is_published, highlights) values
  ('00000000-0000-4000-a000-000000000002', null, 'Frontend Horizons 2026', 'Where front-end engineering meets product design.', 'A two-day community-focused conference on front-end engineering and product design. 30+ sessions across design systems, performance, accessibility and component architecture. Hands-on workshops, intimate discussions, and famous for its hallway track. Ticket includes lunch, swag and the closing social.', 'Conference', 'in_person', 'Kulturbrauerei, Berlin', 'https://horizons.evenner.dev', '2026-11-21T08:00:00Z', '2026-11-22T20:00:00Z', 1200, true, array['30+ curated talks across 2 days','3 parallel rooms for different tracks','Hands-on workshops on design & performance','Design systems & accessibility focus','Closing social with the speakers','Prize draws and community awards'])
on conflict (id) do nothing;

insert into public.sessions (id, event_id, day, type, title, description, track, speaker, speaker_title, room, starts_at, ends_at, position, has_prize) values
  ('00000000-0000-4000-a020-000000000000', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'keynote', 'Keynote: Designing interfaces that feel instant', 'Perceived performance as a design discipline.', 'Main stage', 'Sofia Andersson', 'Principal Designer, Figma', 'Main Hall', '09:30', '10:10', 0, false),
  ('00000000-0000-4000-a020-000000000001', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'session', 'Component APIs that scale across teams', null, 'Design Systems', 'Lukas Becker', 'Design Systems Lead, Progress', 'Room A', '10:20', '10:55', 1, true),
  ('00000000-0000-4000-a020-000000000002', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'session', 'Web performance best practices 2026', null, 'Performance', 'Tom Simonite', 'Performance Consultant', 'Room B', '10:20', '10:55', 2, false),
  ('00000000-0000-4000-a020-000000000003', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'session', 'Accessibility testing automation', null, 'Accessibility', 'Nadia Haddad', 'Staff Engineer, Sentry', 'Room C', '10:20', '10:55', 3, true),
  ('00000000-0000-4000-a020-000000000004', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'session', 'Shadow DOM patterns in modern apps', null, 'Design Systems', 'Stephanie Stimac', 'Chrome DevRel', 'Room A', '11:10', '11:45', 4, false),
  ('00000000-0000-4000-a020-000000000005', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'session', 'React 19 and the future of frontend frameworks', null, 'Performance', 'Veronica Chen', 'Senior Engineer, Meta', 'Room B', '11:10', '11:45', 5, true),
  ('00000000-0000-4000-a020-000000000006', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'session', 'ARIA live regions and dynamic content', null, 'Accessibility', 'Heather Migliorisi', 'Accessibility Lead, Deque', 'Room C', '11:10', '11:45', 6, false),
  ('00000000-0000-4000-a020-000000000007', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'workshop', 'Workshop: Building a themeable design system', 'Hands-on: tokens, theming and accessible components with KendoReact + Tailwind. 40 seats.', 'Design Systems', 'Lukas Becker', 'Design Systems Lead, Progress', 'Studio 1', '13:30', '15:30', 7, false),
  ('00000000-0000-4000-a020-000000000008', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'workshop', 'Workshop: Measuring & fixing Core Web Vitals', 'Profile a real app and ship measurable wins. 40 seats.', 'Performance', 'Nadia Haddad', 'Staff Engineer, Sentry', 'Studio 2', '13:30', '15:30', 8, true),
  ('00000000-0000-4000-a020-000000000009', '00000000-0000-4000-a000-000000000002', '2026-11-21', 'panel', 'Panel: The future of the design–engineering handoff', null, 'Main stage', 'Moderated by Sofia Andersson', 'Principal Designer, Figma', 'Main Hall', '16:00', '16:40', 9, false),
  ('00000000-0000-4000-a020-000000000010', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'keynote', 'Day 2 Keynote: Design systems at scale', null, 'Main stage', 'Will Larson', 'VP Design, Figma', 'Main Hall', '09:30', '10:10', 10, false),
  ('00000000-0000-4000-a020-000000000011', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'TypeScript for better component development', null, 'Design Systems', 'Mark Erikson', 'Redux Maintainer', 'Room A', '10:20', '10:55', 11, true),
  ('00000000-0000-4000-a020-000000000012', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Image optimization strategies', null, 'Performance', 'Jake Archibald', 'Google Chrome', 'Room B', '10:20', '10:55', 12, false),
  ('00000000-0000-4000-a020-000000000013', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Building accessible data visualizations', null, 'Accessibility', 'Miriam Suzanne', 'CSS Expert, Oddbird', 'Room C', '10:20', '10:55', 13, true),
  ('00000000-0000-4000-a020-000000000014', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Storybook best practices for teams', null, 'Design Systems', 'Tom Coleman', 'Co-founder, Storybook', 'Room A', '11:10', '11:45', 14, false),
  ('00000000-0000-4000-a020-000000000015', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Hydration and streaming in Next.js', null, 'Performance', 'Isabella Molod', 'Engineer, Vercel', 'Room B', '11:10', '11:45', 15, true),
  ('00000000-0000-4000-a020-000000000016', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Color contrast and WCAG compliance', null, 'Accessibility', 'Dr. Andrew Arch', 'W3C/WAI', 'Room C', '11:10', '11:45', 16, false),
  ('00000000-0000-4000-a020-000000000017', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'workshop', 'Workshop: Accessible component patterns', 'Hands-on: building accessible interactive components. 40 seats.', 'Accessibility', 'Heather Migliorisi', 'Accessibility Lead, Deque', 'Studio 1', '13:30', '15:30', 17, true),
  ('00000000-0000-4000-a020-000000000018', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'workshop', 'Workshop: Advanced design system patterns', 'Deep dive into compound components and composition. 40 seats.', 'Design Systems', 'Lukas Becker', 'Design Systems Lead, Progress', 'Studio 2', '13:30', '15:30', 18, false),
  ('00000000-0000-4000-a020-000000000019', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'The state of CSS 2026', null, 'Design Systems', 'Chris Coyier', 'Co-founder, CodePen', 'Room A', '16:00', '16:40', 19, true),
  ('00000000-0000-4000-a020-000000000020', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Streaming and selective hydration', null, 'Performance', 'Dominik Dorfmeister', 'TanStack Creator', 'Room B', '16:00', '16:40', 20, false),
  ('00000000-0000-4000-a020-000000000021', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'panel', 'Panel: Accessibility in modern frameworks', null, 'Accessibility', 'Moderated by Miriam Suzanne', 'CSS Expert, Oddbird', 'Room C', '16:00', '16:40', 21, true),
  ('00000000-0000-4000-a020-000000000022', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Responsive web design beyond media queries', null, 'Design Systems', 'Stephanie Stimac', 'Chrome DevRel', 'Room A', '17:00', '17:45', 22, false),
  ('00000000-0000-4000-a020-000000000023', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Bundle analysis and tree shaking', null, 'Performance', 'Nolan Lawson', 'Open Source Contributor', 'Room B', '17:00', '17:45', 23, true),
  ('00000000-0000-4000-a020-000000000024', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Testing for accessibility', null, 'Accessibility', 'Léonie Watson', 'Tetralogical Director', 'Room C', '17:00', '17:45', 24, false),
  ('00000000-0000-4000-a020-000000000025', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Testing for accessibility', null, 'Accessibility', 'Léonie Watson', 'Tetralogical Director', 'Room C', '17:00', '17:45', 25, false),
  ('00000000-0000-4000-a020-000000000026', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Advanced CSS layout patterns', null, 'Design Systems', 'Andy Bell', 'Designer & Developer, Piccalilli', 'Room A', '15:30', '16:15', 26, true),
  ('00000000-0000-4000-a020-000000000027', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Lighthouse and Core Web Vitals deep dive', null, 'Performance', 'Kristofer Baxter', 'Chrome DevRel', 'Room B', '15:30', '16:15', 27, false),
  ('00000000-0000-4000-a020-000000000028', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'session', 'Form accessibility and validation', null, 'Accessibility', 'Jennison Asuncion', 'Accessibility Lead, Mozilla', 'Room C', '15:30', '16:15', 28, true),
  ('00000000-0000-4000-a020-000000000029', '00000000-0000-4000-a000-000000000002', '2026-11-22', 'keynote', 'Closing Keynote: Building accessible experiences for all', null, 'Main stage', 'Sofia Andersson', 'Principal Designer, Figma', 'Main Hall', '18:00', '19:00', 29, true)
on conflict (id) do nothing;

insert into public.sponsors (id, event_id, name, tier, website_url, logo_url) values
  ('00000000-0000-4000-a02f-000000000000', '00000000-0000-4000-a000-000000000002', 'Figma', 'Platinum', 'https://figma.com', 'https://avatars.githubusercontent.com/u/5039857?s=200'),
  ('00000000-0000-4000-a02f-000000000001', '00000000-0000-4000-a000-000000000002', 'Progress KendoReact', 'Gold', 'https://www.telerik.com/kendo-react-ui', 'https://www.telerik.com/favicon.ico'),
  ('00000000-0000-4000-a02f-000000000002', '00000000-0000-4000-a000-000000000002', 'Sentry', 'Gold', 'https://sentry.io', 'https://sentry-brand.vercel.app/sentry-logo-black.png'),
  ('00000000-0000-4000-a02f-000000000003', '00000000-0000-4000-a000-000000000002', 'Storybook', 'Silver', 'https://storybook.js.org', 'https://avatars.githubusercontent.com/u/22632046?s=200'),
  ('00000000-0000-4000-a02f-000000000004', '00000000-0000-4000-a000-000000000002', 'Chromatic', 'Silver', 'https://chromatic.com', 'https://chromatic.com/favicon.ico')
on conflict (id) do nothing;

-- DevFest Cloud & AI Summit 2026 (was demo id "cloud-ai-summit-2026")
insert into public.events (id, organiser_id, title, tagline, description, category, format, location, website_url, starts_at, ends_at, capacity, is_published, highlights) values
  ('00000000-0000-4000-a000-000000000003', null, 'DevFest Cloud & AI Summit 2026', 'A focused day on production AI, data platforms and infrastructure.', 'An intense two-day summit for platform and ML engineers. Two parallel tracks — Infrastructure and Applied AI — with hands-on workshops, live Q&A and networking. Streamed worldwide for remote attendees, with moderated discussions and downloadable codelab materials.', 'Summit', 'hybrid', 'ExCeL London & livestream', 'https://cloudai.evenner.dev', '2026-06-11T08:00:00Z', '2026-06-12T20:00:00Z', 2500, true, array['30+ sessions across 2 tracks','3 parallel rooms for separate pipelines','Hands-on workshop tracks','Live global stream with Q&A','Evening networking sessions','Prize draws and giveaways'])
on conflict (id) do nothing;

insert into public.sessions (id, event_id, day, type, title, description, track, speaker, speaker_title, room, starts_at, ends_at, position, has_prize) values
  ('00000000-0000-4000-a030-000000000000', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'keynote', 'Keynote: The infrastructure behind useful AI', 'What actually breaks when you put models in production.', 'Main stage', 'Dr. Hannah Weiss', 'Head of Platform, Cloudflare', 'Auditorium', '04:15', '05:00', 0, false),
  ('00000000-0000-4000-a030-000000000001', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Serverless Postgres at scale with branching', null, 'Infrastructure', 'Diego Marín', 'Solutions Engineer, Neon', 'Room 1', '10:15', '11:00', 1, true),
  ('00000000-0000-4000-a030-000000000002', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Evaluating LLM apps: metrics that matter', null, 'Applied AI', 'Kira Nakamura', 'ML Lead, Evenner', 'Room 2', '10:15', '11:00', 2, false),
  ('00000000-0000-4000-a030-000000000003', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Vector databases for production search', null, 'Infrastructure', 'James Liu', 'Product Manager, Pinecone', 'Room 3', '10:15', '11:00', 3, true),
  ('00000000-0000-4000-a030-000000000004', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'workshop', 'Workshop: Observability for AI pipelines', 'Instrument an end-to-end inference pipeline with traces, metrics and cost dashboards. Bring a laptop; 50 seats.', 'Infrastructure', 'Olu Adeyemi', 'Developer Advocate, Grafana Labs', 'Workshop Hall', '11:30', '13:30', 4, false),
  ('00000000-0000-4000-a030-000000000005', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Fine-tuning at scale: cost and quality trade-offs', null, 'Applied AI', 'Maya Patel', 'ML Engineer, Lambda Labs', 'Room 1', '14:00', '14:45', 5, true),
  ('00000000-0000-4000-a030-000000000006', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Redis as a vector cache for LLMs', null, 'Infrastructure', 'Boris Kuznetsov', 'Solutions Architect, Redis', 'Room 2', '14:00', '14:45', 6, false),
  ('00000000-0000-4000-a030-000000000007', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'panel', 'Panel: Open source ML infrastructure', null, 'Infrastructure', 'Moderated by Lena Fischer', 'Principal Engineer, Supabase', 'Room 3', '14:00', '14:45', 7, false),
  ('00000000-0000-4000-a030-000000000008', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Streaming inference for low-latency applications', null, 'Applied AI', 'Elena Vasquez', 'Research Lead, Anyscale', 'Room 1', '15:00', '15:45', 8, true),
  ('00000000-0000-4000-a030-000000000009', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Kubernetes for ML workloads in production', null, 'Infrastructure', 'Marcus Chen', 'Platform Engineer, Google Cloud', 'Room 2', '15:00', '15:45', 9, false),
  ('00000000-0000-4000-a030-000000000010', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Prompt engineering at scale', null, 'Applied AI', 'Sophia Richardson', 'Prompt Engineer Lead, OpenAI', 'Room 3', '16:00', '16:45', 10, true),
  ('00000000-0000-4000-a030-000000000011', '00000000-0000-4000-a000-000000000003', '2026-06-11', 'session', 'Fireside: Lessons from shipping agents to millions', null, 'Applied AI', 'Ravi Shah', 'Co-founder, Evenner', 'Auditorium', '17:00', '18:00', 11, false),
  ('00000000-0000-4000-a030-000000000012', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'keynote', 'Day 2 Keynote: The future of model optimization', null, 'Main stage', 'Dr. Yann LeCun', 'Chief AI Scientist, Meta', 'Auditorium', '04:15', '05:00', 12, false),
  ('00000000-0000-4000-a030-000000000013', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Cost optimization for large language models', null, 'Infrastructure', 'Andrew Park', 'Cost Optimization Lead, AWS', 'Room 1', '10:30', '11:15', 13, true),
  ('00000000-0000-4000-a030-000000000014', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Retrieval-augmented generation in production', null, 'Applied AI', 'Dr. Priya Verma', 'Senior Research Scientist, Microsoft', 'Room 2', '10:30', '11:15', 14, false),
  ('00000000-0000-4000-a030-000000000015', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Caching strategies for ML inference', null, 'Infrastructure', 'Jonathan Park', 'Performance Engineer, Cloudflare', 'Room 3', '10:30', '11:15', 15, true),
  ('00000000-0000-4000-a030-000000000016', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'workshop', 'Workshop: Building RAG applications', 'Hands-on: building and deploying RAG systems. Bring a laptop; 50 seats.', 'Applied AI', 'Dr. Priya Verma', 'Senior Research Scientist, Microsoft', 'Workshop Hall', '12:00', '14:00', 16, false),
  ('00000000-0000-4000-a030-000000000017', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Multi-modal models: vision + language in practice', null, 'Applied AI', 'Aisha Mohammed', 'ML Engineer, Google DeepMind', 'Room 1', '14:30', '15:15', 17, true),
  ('00000000-0000-4000-a030-000000000018', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Scaling data pipelines for AI training', null, 'Infrastructure', 'Robert Wilson', 'Data Infrastructure Lead, Tesla', 'Room 2', '14:30', '15:15', 18, false),
  ('00000000-0000-4000-a030-000000000019', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'panel', 'Panel: Privacy and security in AI systems', null, 'Applied AI', 'Moderated by Dr. Hannah Weiss', 'Head of Platform, Cloudflare', 'Room 3', '14:30', '15:15', 19, false),
  ('00000000-0000-4000-a030-000000000020', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Monitoring and debugging ML models', null, 'Infrastructure', 'Fatima Al-Rashid', 'Senior Engineer, Datadog', 'Room 1', '15:30', '16:15', 20, true),
  ('00000000-0000-4000-a030-000000000021', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Tokenization strategies for LLMs', null, 'Applied AI', 'Chen Wei', 'Language Lead, Anthropic', 'Room 2', '15:30', '16:15', 21, false),
  ('00000000-0000-4000-a030-000000000022', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Building distributed training infrastructure', null, 'Infrastructure', 'Lisa Wong', 'Infrastructure Lead, Anyscale', 'Room 3', '15:30', '16:15', 22, true),
  ('00000000-0000-4000-a030-000000000023', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Agent architectures and frameworks', null, 'Applied AI', 'David Miller', 'Technical Lead, Langchain', 'Room 1', '16:30', '17:15', 23, true),
  ('00000000-0000-4000-a030-000000000024', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'GeoMIP: Geographic distribution of ML workloads', null, 'Infrastructure', 'Zara Khan', 'Systems Engineer, Meta', 'Room 2', '16:30', '17:15', 24, false),
  ('00000000-0000-4000-a030-000000000025', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Quantization and model compression for inference', null, 'Infrastructure', 'Tim Dettmers', 'ML Systems Engineer, University of Washington', 'Room 3', '15:30', '16:15', 25, true),
  ('00000000-0000-4000-a030-000000000026', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Building reliable ML systems in production', null, 'Applied AI', 'Dr. Nilesh Dalvi', 'Research Scientist, Amazon', 'Room 1', '16:30', '17:15', 26, false),
  ('00000000-0000-4000-a030-000000000027', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Streaming pipelines for real-time ML', null, 'Infrastructure', 'Eric Tschetter', 'Apache Druid Committer', 'Room 2', '16:30', '17:15', 27, true),
  ('00000000-0000-4000-a030-000000000028', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'session', 'Prompt caching and efficient inference', null, 'Applied AI', 'Liane Lovitt', 'Anthropic Research', 'Room 3', '16:30', '17:15', 28, true),
  ('00000000-0000-4000-a030-000000000029', '00000000-0000-4000-a000-000000000003', '2026-06-12', 'keynote', 'Closing Keynote: AI for everyone', null, 'Main stage', 'Dr. Hannah Weiss', 'Head of Platform, Cloudflare', 'Auditorium', '17:30', '18:30', 29, false)
on conflict (id) do nothing;

insert into public.sponsors (id, event_id, name, tier, website_url, logo_url) values
  ('00000000-0000-4000-a03f-000000000000', '00000000-0000-4000-a000-000000000003', 'Cloudflare', 'Platinum', 'https://cloudflare.com', 'https://www.cloudflare.com/favicon.ico'),
  ('00000000-0000-4000-a03f-000000000001', '00000000-0000-4000-a000-000000000003', 'Supabase', 'Gold', 'https://supabase.com', 'https://supabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-square.dbbeb048.png&w=256&q=75'),
  ('00000000-0000-4000-a03f-000000000002', '00000000-0000-4000-a000-000000000003', 'Neon', 'Gold', 'https://neon.tech', 'https://avatars.githubusercontent.com/u/67140913?s=200'),
  ('00000000-0000-4000-a03f-000000000003', '00000000-0000-4000-a000-000000000003', 'Grafana Labs', 'Silver', 'https://grafana.com', 'https://grafana.com/favicon.ico'),
  ('00000000-0000-4000-a03f-000000000004', '00000000-0000-4000-a000-000000000003', 'PlanetScale', 'Silver', 'https://planetscale.com', 'https://planetscale.com/favicon.ico')
on conflict (id) do nothing;

