# Kad Tunang build specification

Hand this folder to Claude Code. Start it with:

> Read `CLAUDE.md` and every file under `docs/` in numeric order, then execute `docs/08-implementation-plan.md` phase by phase on the `development` branch. Start Docker and run everything yourself; ask me only for things you cannot know. Stop at the end of each phase and show me what changed before continuing.

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
| `assets/florals/` | The seven cover compositions as SVG, one per `floral_preset` |
| `assets/elements/` | Reusable floral pieces (peony, petal, leaf, sprig divider…) for animation |

## Design

Figma: https://www.figma.com/design/x7AEQ2Ar29jb38Xc5ZoVtE

Page **Kad**: `01 Cover`, `02 Card (scroll)`, `03 RSVP states`, `04 Admin — Tetamu`, `05 Admin — Kad`.
Page **Design options**: seven cover directions A to G (see `docs/05` → Floral themes for node IDs and the matching SVG files).

To export any frame as an image: open the file, select the frame on the canvas, then in the right panel under **Export** click **+**, choose PNG at 2x, and **Export**. Or right-click the frame → Copy/Paste as → Copy as PNG.
