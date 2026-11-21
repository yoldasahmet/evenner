# Contributing to evenner

Thanks for your interest! Bug reports, ideas and pull requests are welcome.

## Getting set up

```bash
npm install
cp .env.example .env.local   # optional — the app runs without keys
npm run dev
```

Without Supabase keys the app runs in **offline mode** (everyone is signed
out, DB-backed pages are empty). To work on auth or data, create a free
Supabase project and apply `supabase/migrations/*.sql` in order.

## Before opening a PR

- `npm run typecheck` and `npm run lint` pass.
- Follow the conventions in [`AGENTS.md`](AGENTS.md) (files under 250 lines,
  mobile-first, Server Components by default, `src/lib/types.ts` in sync with
  migrations).
- Update `AGENTS.md`'s project map if you change structure.
- Keep PRs focused; describe what changed and how you tested it. Screenshots
  help for UI changes.

## Secrets

Never commit `.env*` files, API keys, or real account credentials. If you
spot one, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.
