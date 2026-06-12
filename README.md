# evenner

> Your agentic event planner.

A mobile-first event planner built with **Next.js (App Router)**,
**KendoReact**, **Tailwind CSS** and **Supabase**. An AI agent learns about
each user during onboarding to help them discover, organise and run events.

## Features

- 🔐 Auth via **LinkedIn** (OIDC, with consent) or passwordless email magic link
- 🧭 Post-login **AI onboarding** interview that profiles the user and sets their role
- 👥 **Two role templates** — attendees (Events · My hub · Profile) and
  organisers (Organise · Profile) — chosen from the onboarding answers
- 🗓️ **Detailed events** with multi-day agendas (keynotes, sessions, workshops,
  panels), tracks, sponsors and venues — ships with 3 showcase events
- ✨ **Organiser console** — create events, build the agenda, add sponsors
- 📱 Mobile-first responsive UI (bottom tab bar on mobile, top nav on desktop)
- 🛡️ Postgres with **Row Level Security** scoping data to its owner

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your Supabase keys

# 3. Apply the database schema — run ALL migrations, in order
#    Supabase CLI:  supabase db push
#    or paste each supabase/migrations/000*.sql into the SQL editor in order.
#    0004 adds a trigger that auto-creates a profile for every user (and
#    backfills existing ones) — without it you'll see "couldn't load your
#    profile" after signing in.

# 4. Run
npm run dev                  # http://localhost:3000
```

## Configuration

Set these in `.env.local` (see `.env.example`):

| Variable                        | Purpose                                |
| ------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key               |
| `NEXT_PUBLIC_SITE_URL`          | Origin used for OAuth redirects        |
| `KENDO_UI_LICENSE`              | Optional KendoReact license (no watermark) |

### Enabling LinkedIn login

1. In **Supabase → Authentication → Providers**, enable **LinkedIn (OIDC)**.
2. Create a LinkedIn app at <https://www.linkedin.com/developers/>, request the
   *Sign In with LinkedIn using OpenID Connect* product, and copy the Client ID
   and Secret into Supabase.
3. Add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to the provider's redirect URLs.

The app requests `openid profile email` scopes and mirrors the granted name,
picture and email into the `profiles` table on first sign-in.

## Troubleshooting

**"We couldn't load your profile" after signing in** — your `profiles` row
couldn't be created. Make sure **all** migrations (including `0004`) are
applied; `0004` adds a `SECURITY DEFINER` trigger that creates the profile
(RLS can block an app-side insert) and backfills existing accounts. Re-run the
migrations, then refresh. Check the server logs for `[evenner] could not
create profile:` for the underlying Postgres error.

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start the dev server     |
| `npm run build`     | Production build         |
| `npm run start`     | Serve the production build |
| `npm run typecheck` | Type-check with `tsc`    |
| `npm run lint`      | Lint with `next lint`    |

## For AI agents

- [`AGENTS.md`](AGENTS.md) — repo conventions and project map for coding agents.
- [`SKILL.md`](SKILL.md) — spec for evenner's in-product AI agent.

## License

MIT © 2026 — see [LICENSE](LICENSE).
