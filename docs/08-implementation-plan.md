# 08 Implementation plan

Work in phases. Each phase ends with `typecheck`, `lint`, and `test` passing inside the container, and a short summary for review. Do not start the next phase until the previous one is reviewed.

Estimated total: 2–3 focused days. The card design (Phase 5) is the largest single piece.

---

## Phase 0: Repo and Docker

**Tasks**
- `npx create-next-app@latest kad-tunang --ts --tailwind --app --src-dir --eslint --no-import-alias` then fix alias to `@/*`.
- Add `docker-compose.yml`, `Dockerfile.dev`, `.dockerignore`, `.env.example` exactly as in `docs/06`.
- Add `vitest` and a `test` script. One trivial test so the pipeline is proven.
- `CLAUDE.md` and `docs/` copied into the repo root.
- Git initialised with `main` and `development` per `docs/09`; GitHub remote added; both branches pushed.

- Start Docker yourself. Check with `docker info`; if the daemon is not running, launch Docker Desktop (`open -a Docker` on macOS, `Start-Process "Docker Desktop"` on Windows, `sudo systemctl start docker` on Linux) and poll `docker info` every 5 s for up to 2 minutes. Then `docker compose up -d --build` and wait for `curl -sf http://localhost:3000` to succeed. Only ask the owner if Docker Desktop is not installed.

**Acceptance**
- `docker compose up -d` serves the default Next page on :3000 with no host installs.
- `docker compose exec app npm run typecheck && npm run lint && npm test` all pass.

---

## Phase 1: Data layer

**Tasks**
- `src/server/db/schema.ts` per `docs/03` (snake_case columns, camelCase properties, both enums, CHECK constraints, index).
- `src/server/db/client.ts`: `drizzle(postgres(process.env.DATABASE_URL!))` with a module-level singleton; `max: 1` connection in serverless.
- `drizzle.config.ts` pointing at `src/server/db/migrations`.
- Generate and commit the first migration.
- `repositories/guests.repo.ts`: `list()`, `listVisibleForDropdown()`, `getById()`, `create()`, `update()`, `remove()`, `reorder(ids)`.
- `repositories/settings.repo.ts`: `get()`, `insertDefault()`, `update()`.
- `services/settings.service.ts`: `get()` guarantees the row exists.
- `services/guests.service.ts`: CRUD pass-through plus `totals()` and the "lowering pax lowers confirmed_pax" rule.
- `services/rsvp.service.ts`: `getStatus(id)`, `respond({guestId, status, pax})` with the clamp and the hidden/disabled checks.
- `lib/validation.ts` per `docs/04`.
- `lib/presets.ts` per `docs/05`.
- `lib/format.ts`: `formatDateMs`, `formatTimeMs`, `formatTimeRangeMs`, `toIntlMy`, `mapLinks`, `icsDataUrl`, `googleCalendarUrl`, `parseLatLng`.

**Tests** (vitest, no database)
- `format.ts`: Malay weekday/month, time period boundaries (11:59 pagi, 12:00 tengah hari, 3:00 petang, 7:00 malam), phone normalisation (`0123456789`, `+60123456789`, `60123456789`), `parseLatLng` on a bare pair and on a Google Maps URL.
- `rsvp.service.respond`: attending with pax > allocation clamps; declined sets 0; hidden guest → not found; disabled → forbidden. Use an in-memory fake repo.

**Acceptance**
- `npm run db:migrate` creates both tables and enums in the local container.
- Tests pass.

---

## Phase 2: Auth and admin API

**Tasks**
- `server/auth.ts`: `checkPassword`, `makeSessionToken`, `isValidSession` (Web Crypto HMAC, constant-time compare). Test the compare.
- `middleware.ts` per `docs/04`.
- Routes: `/api/admin/login`, `/logout`, `/guests` (GET with totals, POST), `/guests/[id]` (PATCH, DELETE), `/guests/reorder`, `/settings` (GET, PUT), `/upload`, `/export`.
- `server/storage/*`: interface, `LocalDiskStorage`, `VercelBlobStorage`, selector.
- `services/upload.service.ts`: MIME + size table from `docs/04`, generated file names.

**Acceptance**
- `curl` without cookie → 401 on every admin route; with cookie → works.
- Upload a 1 MB MP3 locally → file appears under `public/uploads/music/` and the returned URL serves it.
- `GET /api/admin/export` opens in Excel with Malay characters intact.

---

## Phase 3: Public API

**Tasks**
- `/api/guests` (GET), `/api/rsvp` (GET, POST).

**Acceptance**
- Hidden guests never appear in `/api/guests`.
- `POST /api/rsvp` with `pax: 99` for a 4-pax household stores 4.
- With `is_rsvp_enabled=false`, POST returns 403.

---

## Phase 4: Admin UI

**Tasks**
- `/admin/login` page.
- `/admin` shell with tabs.
- `GuestsTab`: stats bar, add row (with `<datalist>` for groups), table with click-to-edit name, inline group/pax inputs saving on blur, status select, ↑↓ reorder, hide/show, delete with confirm, CSV link. Optimistic updates; on failure revert and show a one-line error.
- `CardTab`: all panels from `docs/05`, `ListEditor` generic for schedule and contacts rows, coordinate paste box using `parseLatLng`, swatch row, upload zones with progress and error messages, sticky save bar with "Disimpan N minit lalu".
- Client-side validation using the same Zod schemas; field errors shown inline.

**Acceptance**
- Starting from an empty database, an admin can add 5 households, fill every card field, upload a song and an image, and save, using only the UI. Refresh shows everything persisted.
- Keyboard-only navigation works through the whole Kad form.

---

## Phase 5: The card

**Tasks**
- `components/card/`: `Card.tsx` (server-friendly, takes `settings` prop), `Cover.tsx`, `Countdown.tsx`, `Rsvp.tsx`, `MusicToggle.tsx`, `Sprig.tsx`, `Arch.tsx`, `card.css`.
- `app/page.tsx`: loads settings, injects preset `<link>` and CSS variables, renders `<Card>`. `generateMetadata` for Open Graph.
- Follow `docs/05` section by section. Every section hides when its data is empty.
- Cover unlocks audio; music toggle; body scroll lock while cover is up.
- Countdown with no layout shift; day-boundary logic in `Asia/Kuala_Lumpur`.
- RSVP flow with all states in `docs/05`.
- Florals per `docs/05` → Floral themes: inline the SVGs from `assets/florals` and `assets/elements` as components, keep `data-wind` and ids, apply the preset's background recipe, reuse corner clusters and sprig dividers in the card body.
- Motion per `docs/05` → Motion, Wind, Entrance variants, Section transitions: `<Entrance>` with `petal_fall`, `curtain`, `slide_up`, `slide_left`, `fade` first (`envelope`, `bloom` in Phase 6), wind sway + gusts with per-element seeded phase, `PetalDrift`, `useInView` reveals with the three reveal presets, micro-interactions. All CSS transform/opacity; all gated on `prefers-reduced-motion`; wind never runs during the entrance.

**Acceptance**
- Each shipped entrance preset plays as specified; `petal_fall` shows the cover blooms scattering into petals and the card clusters regrowing. With `prefers-reduced-motion: reduce` every preset becomes a 200 ms fade.
- With `wind_preset=gentle`, florals sway out of phase and a gust visibly travels left→right every 9–16 s; `off` freezes them; `breezy` is noticeably stronger but never distracting from text.
- Switching `floral_preset` in admin changes the cover, the card's corner clusters, the divider colour, and (for `evening_garden`) text colours, with no code change.
- Matches the Figma frames `01`, `02`, `03` closely enough that a side-by-side at 390 px shows the same hierarchy, spacing rhythm, and colours.
- Lighthouse mobile on the card: Performance ≥ 90, Accessibility ≥ 95, with music, background, and motion enabled.
- Tested on a real Android Chrome and iOS Safari: cover tap starts music; Waze button opens the Waze app when installed.

---

## Phase 6: Live preview and polish

**Tasks**
- Mount `<Card settings={formState} preview />` in the Kad tab's right column, scaled with `transform: scale(300/390)` inside a fixed-size wrapper; `preview` prop disables the cover lock and the RSVP fetches (render RSVP with placeholder options).
- Every colour preset checked for contrast; every font preset checked for Malay diacritics and the "&".
- `envelope` and `bloom` entrance presets, with their extra SVGs.
- "Pratonton animasi" button in the Kad tab replays the selected entrance in the preview.
- 404 and error pages in the card's style.
- README updated with any deviations from the docs, and why.

**Acceptance**
- Typing in the Kad form updates the preview within one frame.
- `docs/07` followed verbatim on a fresh Vercel project produces a working card.

---

## Phase 7: Deploy

**Tasks**
- Authenticate with the available Vercel token or MCP (see `docs/07`); ask the owner to log in only if neither exists.
- Follow `docs/07` Option A steps 1 to 6. Ask the owner for the admin password; create Neon and Blob via the dashboard prompts.
- Run migrations against Neon. Push `development`, confirm the preview URL. On owner approval, merge to `main`, tag `v0.1.0`.

**Acceptance**
- `vercel ls` shows Preview and Production Ready.
- Owner logs in at the production `/admin`, saves settings, adds a household; `/` shows the card with that household in the dropdown.
- WhatsApp link preview shows title and image.

---

## Things to ask the owner before deciding

- Whether to include the guest's `bin/binti` line on the card or fold it into `bride_name` / `groom_name`. The Figma shows it separate; the schema keeps one field. **Default: put the full name including bin/binti in the name field, and render it on one line if it fits, two if not.** Ask if unsure.
- Whether `event_end_at` should be required. **Default: optional, +3 h.**
- Whether to run migrations in `vercel-build`. **Default: manual on first deploy.**
