# AGENTS.md

Guidance for AI coding agents (and humans) working in the **evenner** repo.
Keep this file up to date whenever you change the structure.

## What this is

Evenner is a mobile-first event planner. An AI agent learns about each user
during onboarding and helps them discover, organise and run events.

## Roles & templates

Each user has a `role` (`attendee` | `organiser`) set from their onboarding
"goal" answer. The authenticated shell (`AppShell`) renders a role-specific
navigation:

- **attendee** → Events · My hub · Profile (light violet template)
- **organiser** → Dashboard · Organise · Profile (dark "studio" template:
  slate + amber chrome, dark cards)

`/organiser` (incl. `/organiser/dashboard`) is gated to the organiser role;
attendees are redirected to `/events`. Onboarding is a profile-level interview
shown on every login until complete, then editable from Profile. Organisers'
Profile hides answers/recommendations and instead edits their
company/organisation details (columns on `profiles`).

## Stack

| Concern    | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript               |
| UI         | KendoReact components + Tailwind CSS (mobile-first) |
| Backend    | Supabase (Postgres, Auth, RLS)                     |
| Auth       | Supabase Auth — LinkedIn OIDC + email magic link   |

## Conventions

- **Keep every file under 250 lines.** Split components and helpers early.
- **Mobile-first**: style for small screens first, scale up with `sm:`/`md:`/`lg:`.
- **Server vs client**: default to Server Components. Add `"use client"` only
  for interactivity. Mutations go through Server Actions in an `actions.ts`
  colocated with the route.
- **Supabase access**: use `@/lib/supabase/server` in server code,
  `@/lib/supabase/client` in client code. Never hardcode keys.
- **Types** live in `src/lib/types.ts` and mirror the SQL in
  `supabase/migrations`. Update both together.
- **Auth-gated routes** are listed in `src/lib/supabase/middleware.ts`
  (`PROTECTED_PREFIXES`). Add new private routes there.

## Project map

```
src/
  middleware.ts           Session refresh + route guards (MUST live in src/)
  app/
    page.tsx              Public landing ("/")
    login/                Auth page + LoginForm (LinkedIn / magic link)
    auth/callback/        OAuth + magic-link callback route handler
    onboarding/           Profile-setup interview (page + actions)
    (app)/                Authed route group; layout gates auth + onboarding
      events/             Browse events + events/[id] detail
      attendee/           Attendee hub (placeholder)
      profile/            Profile (+actions): attendee answers vs organiser company
      organiser/          Organiser console (events, agenda, sponsors) + actions
        dashboard/        Organiser dashboard (live now, next up, stats widgets)
  components/
    AppShell, TopBar, BottomNav, PageHeader, EmptyState, SignOutButton
    auth/                 LoginForm
    onboarding/           OnboardingWizard, ChoiceField (single/multi choices)
    profile/              ProfileHeader (completeness ring, role variants),
                          InterestGraphics, AnswersSection, OrganiserCompanyCard
    organiser/            OrganiserBoard, EventForm, SessionsEditor,
                          SponsorsEditor, DashboardWidgets (stat tiles + cards)
    events/               EventCard, AgendaList, AgendaExplorer (2-col),
                          SessionDetail, SponsorsSection + SponsorCard, PrizeSection
    illustrations/        Inline SVG cartoons (OnboardingHero, EventHeroArt)
  lib/
    supabase/             client / server / middleware helpers
    types.ts              Database-row domain models
    event-view.ts         Presentation view-models (EventDetail/Summary) + helpers
    events.ts             Loader: merges demo + DB events
    demo/                 3 richly-detailed demo events (one file each)
    profile.ts            Profile sync + fetch helpers
    organiser-stats.ts    Pure stat computations for the organiser dashboard
    profile-insights.ts   Derives Profile graphics data from onboarding answers
    sponsor-info.ts       Editorial sponsor detail (industry/products) by name
    onboarding-questions.ts  The AI agent interview questions (name, profession,
                          goal + tech-interest questions; some multi-select)
supabase/migrations/      0001 schema · 0002 RLS · 0003 events+sessions ·
                          0004 profile auto-create trigger + backfill ·
                          0005 evenns · 0006 live · 0007 db data ·
                          0008 organiser company fields + dashboard data
                          (re-anchors seeded events to yesterday/today)
```

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Data model (see supabase/migrations)

`profiles` · `events` · `sessions` (agenda: keynotes/sessions/workshops/panels)
· `sponsors` · `onboarding_answers` (per-profile AI agent interview). RLS
scopes every table to its owner; published events and their sessions/sponsors
are publicly readable.

The 3 showcase events live as static data in `src/lib/demo/` (no DB rows
needed); `src/lib/events.ts` merges them with published DB events.

## When you change structure

1. Update the **Project map** above.
2. Keep `src/lib/types.ts` and the SQL migrations in sync.
3. If you add a private route, add its prefix to `PROTECTED_PREFIXES`.
4. Update `SKILL.md` if you change what the product's AI agent can do.
