# Kad Tunang build specification

Hand this folder to Claude Code. Start it with:

> Read `CLAUDE.md` and every file under `docs/` in numeric order, then execute `docs/08-implementation-plan.md` phase by phase on the `development` branch. Stop at the end of each phase and show me what changed before continuing. When you reach Phase 7, tell me exactly which commands I must run myself.

## What this is

A digital engagement-invitation card (kad tunang) for one event, with an admin panel where the family manages the guest list and every piece of card content. Deployed on Vercel. One deployment = one event; a new event is a fresh fork with its own database.

## Reading order

| File | What it settles |
|---|---|
| `CLAUDE.md` | Conventions Claude Code must follow while coding |
| `docs/01-overview.md` | Goals, scope, non-goals, the RSVP model |
| `docs/02-architecture.md` | Stack, layers, folder structure, principles |
| `docs/03-data-model.md` | ERD, tables, columns (snake_case), enums, validation |
| `docs/04-api.md` | Every route, request, response, error |
| `docs/05-design.md` | Figma link, tokens, per-screen behaviour |
| `docs/06-local-dev-docker.md` | Docker Compose, nothing installed on the host |
| `docs/07-deployment.md` | Vercel, Neon, Blob, env vars |
| `docs/08-implementation-plan.md` | Phased tasks with acceptance criteria, ending in deploy |
| `docs/09-git-workflow.md` | `development` and `main` branches, commit rules, release steps |
| `diagrams/` | `erd.drawio`, `architecture.drawio`, editable links |

## Design

Figma: https://www.figma.com/design/x7AEQ2Ar29jb38Xc5ZoVtE

Frames: `01 Cover`, `02 Card (scroll)`, `03 RSVP states`, `04 Admin — Tetamu`, `05 Admin — Kad`.
