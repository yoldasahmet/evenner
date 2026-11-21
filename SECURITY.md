# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead, report
them privately via GitHub's
[private vulnerability reporting](https://github.com/yoldasahmet/evenner/security/advisories/new).

Include steps to reproduce and the impact you expect. We'll acknowledge the
report as soon as we can and keep you updated on the fix.

## Scope notes

- Supabase **anon** keys are public by design; data access is enforced by
  Row Level Security in `supabase/migrations/0002_rls.sql`. RLS bypasses are
  in scope.
- Service-role keys and LLM provider keys must only ever live in server-side
  environment variables — never in client code or the repo.
