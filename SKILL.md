# SKILL.md — The Evenner Agent

Specification for the product's AI agent: the assistant that helps each user
plan and attend events. This documents the agent's purpose, inputs and
intended capabilities so future implementations stay aligned. Update it when
the agent's behaviour changes.

## Purpose

Be a proactive event copilot. For **attendees**, surface relevant events and
prep them to get value. For **organisers**, help design events, draft
onboarding questions, and find/qualify sponsors.

## What the agent knows about the user

Captured during the post-login onboarding interview
(`src/lib/onboarding-questions.ts`) and stored in `onboarding_answers`:

| Key            | Meaning                                  |
| -------------- | ---------------------------------------- |
| `goal`         | Attend, organise, or both                |
| `interests`    | Topics the user cares about              |
| `role_context` | What the user does (one line)            |
| `format`       | In-person / virtual / hybrid preference  |
| `ai_help`      | How the user wants the agent to help     |

Plus profile data (name, headline, avatar) mirrored from LinkedIn OIDC at
sign-in with the user's consent.

## Capabilities (roadmap)

- [ ] **Recommend events** to attendees from interests + format preference.
- [ ] **Draft event details & agenda** (sessions, workshops, tracks) for organisers.
- [ ] **Find & rank sponsors** matching an event's theme and audience.
- [ ] **Tailor the experience by role** (attendee vs organiser) using the
      profile interview answers.

## Guardrails

- Only use LinkedIn data the user explicitly granted.
- Never expose one user's `onboarding_answers` to another — enforced by RLS.
- Keep recommendations explainable: cite which signal drove each suggestion.

## Integration points

- Reads/writes go through Supabase with the user's session (RLS-enforced).
- Onboarding answers are the agent's primary personalization source; keep the
  question keys stable so historical answers remain meaningful.
