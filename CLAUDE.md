# CLAUDE.md: conventions for this repo

Read `docs/` before writing code. The docs are the source of truth; when code and docs disagree, fix one and say which.

## Principles

**KISS.** The whole app is two tables, nine routes, two pages. Do not add state management libraries, ORMs beyond Drizzle, auth libraries, form libraries, component libraries, or animation libraries (all motion is CSS; see `docs/05` → Motion). If a task seems to need one, stop and ask. Prefer a 20-line function over a dependency.

**DRY, but not prematurely.** Extract when the same logic exists in two places and is likely to change together. Do not create abstractions for a single caller. The places DRY matters here:
- The card is rendered once, by `components/card/Card.tsx`, and reused for the public page and the admin live preview. Never fork it.
- Zod schemas in `src/lib/validation.ts` are the single definition of every input shape. API routes and admin forms both import them. Never redefine a shape inline.
- Data access goes through `src/server/repositories/*`. Routes never import Drizzle directly.
- Formatting helpers (Malay and English date, time period, phone normalisation, map links) live in `src/lib/format.ts` and nowhere else; user-facing strings live in `src/lib/i18n.ts` and nowhere else.

**Push back.** If a requirement in `docs/` is contradictory, unsafe, or has a simpler equivalent, say so before implementing.

## Naming

- Database: tables and columns in `snake_case`, tables plural (`guests`, `settings`). Booleans prefixed `is_`. Timestamps suffixed `_at`.
- TypeScript: `camelCase` for variables and properties, `PascalCase` for types and components. Drizzle maps `snake_case` columns to `camelCase` properties explicitly in the schema, e.g. `groupName: text("group_name")`.
- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for components.
- API routes: nouns, plural, REST-shaped. No verbs in paths.

## Stack (fixed, do not substitute)

Next.js 15 App Router · TypeScript strict · Tailwind v4 · Drizzle ORM with `postgres` (postgres.js) driver · Zod · Vercel Blob (prod) / local filesystem (dev) behind one storage interface · Docker Compose for local dev.

## Language

User-facing text (card and admin) is bilingual: Bahasa Melayu and English, chosen by the guest on the card and by the admin in the admin UI. Every fixed string lives in `src/lib/i18n.ts` in both languages; never write a user-facing literal in a component. Text the family types in has a Malay field and an optional English field (`*En`), and the card falls back to Malay where English is blank. Code, comments, commit messages, and docs are English.

## Style

- Server components by default; `"use client"` only where there is state or browser APIs.
- No `any`. No `// eslint-disable` without a one-line reason.
- Errors from routes are `{ error: string }` with a correct HTTP status. Never leak stack traces.
- Comments explain why, not what. Keep them short.
- Do not write tests for things TypeScript already guarantees. Do write tests for `format.ts`, the RSVP pax-cap rule, and the auth token compare.

## Working method

You run everything: Docker, tests, git, deployment. Start the Docker daemon if it is down (see `docs/08` Phase 0). Do not ask the owner to run a command you can run yourself; ask only for things you cannot know, such as the admin password.

Follow `docs/08-implementation-plan.md` phase by phase. After each phase: run `docker compose exec app npm run typecheck && npm run lint && npm test`, commit on `development` with a Conventional Commits message, push, then summarise what changed and stop for review.

## Git

Two branches: `development` (all work) and `main` (production, fast-forward merges only, on the owner's say-so). Full rules in `docs/09-git-workflow.md`. Never commit secrets; `.env.example` is the only env file in the repo.

## Deployment

You deploy end to end using the Vercel access you have; the owner only supplies the admin password. Follow `docs/07-deployment.md` Option A. Ask the owner for the admin password; never generate or echo it.
