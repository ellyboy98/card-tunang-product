# Kad Tunang

Mobile-first invitation card for a Malay engagement ceremony (majlis pertunangan), opened from a WhatsApp link, plus a password-protected admin panel where the family edits the card and manages the guest list. One deployment hosts one event.

The specification lives in `docs/` and is the source of truth. Start with `docs/01-overview.md`; `docs/08-implementation-plan.md` is the build order. Editable draw.io diagrams are in `diagrams/`.

## Run locally

Requires Docker only.

```bash
docker compose up            # installs deps, migrates, serves http://localhost:3000
docker compose exec app npm run typecheck
docker compose exec app npm run lint
docker compose exec app npm test
```

Admin at http://localhost:3000/admin, password `admin`. Uploads go to a Compose volume and are served from `/uploads/…`. See `docs/06-local-dev-docker.md` for the rest.

## Deploy

Live: production at https://kad-tunang.vercel.app (Vercel team LAPLACE, project `kad-tunang`, `main` branch). Pushes to `development` build previews. Follow `docs/07-deployment.md` for a fresh setup. Production needs four things beside the Neon and Blob integrations: `ADMIN_PASSWORD`, `ADMIN_SECRET`, `STORAGE_DRIVER=vercel-blob` and `NEXT_PUBLIC_SITE_URL`. `.env.example` lists every variable with a note on where it comes from. Schema changes ship as committed migrations: run `npm run db:migrate` against Neon (`docs/07` step 5) before merging one, because Preview and Production share the database and the new code selects the new columns.

## Where things are

| Path | What |
|---|---|
| `src/components/card/` | The card. One `Card` component renders the public page and the admin live preview. |
| `src/components/admin/` | Admin UI: guest list, card form, form primitives. |
| `src/lib/` | Browser-safe: Zod schemas, presets, Malay date/phone/map helpers, API client. |
| `src/server/` | Server only: Drizzle schema and client, repositories, services, auth, storage. |
| `src/app/api/` | Thin route handlers: parse, call a service, respond. |
| `src/middleware.ts` | Denies `/admin` and `/api/admin` without the session cookie. |

## Deviations from the docs

Kept here so the docs stay the spec and the reasons stay findable. Where a doc was changed to match, it says so.

**Tooling**

- `Dockerfile.dev` runs as the image's `node` user and pre-creates the two volume mount points. The docs' three-line Dockerfile runs as root, which on Linux and WSL hosts leaves root-owned files in the bind mount.
- `lint` runs `eslint` directly instead of `next lint`, which Next 15.5 deprecates. Same config.
- `@types/node` is `^22` (the scaffold gives `^20`) because Vitest 5 requires it and the container runs Node 22.
- Fonts are self-hosted through `next/font` instead of a Google Fonts `<link>`. The external stylesheet was render-blocking and held Lighthouse mobile Performance at 78; with `next/font` it is 90. Only the selected preset's font files download. `docs/05` updated.

**Data and rules**

- `guestPatch` is built from un-defaulted fields. Zod 4 applies a field's default even through `partial()`, so the docs' `guestInput.partial()` would reset every group to "Lain-lain" on a PATCH that omits it. Same shapes as `docs/04`.
- Changing a guest's status in the admin also sets `confirmed_pax`: pax on attending, 0 on declined, null on pending, unless the patch names it. Without this the status pill left the Hadir column and the totals wrong. Lowering pax still lowers `confirmed_pax`, as documented.
- `rsvpInput.pax` has no upper bound. `docs/08` expects `pax: 99` to be stored as the allocation, which the `max(50)` in `docs/04` made impossible; the service clamp is the single bound. `docs/04` updated.
- Time-of-day words: pagi before 12:00, tengah hari 12:00 to 13:59, petang 14:00 to 18:59, malam from 19:00. The docs fix four examples, not the cut points.
- The upload service also accepts `audio/mp3` as an MP3, which some Windows browsers send for `.mp3` files.
- Migration `0002` replaces `cover_transition`, `petal_style` and `petal_density` (an earlier motion design) with `floral_preset`, `entrance_preset`, `wind_preset` and `reveal_preset`. It drops the three columns, so run it against Neon before merging (see Deploy).

**Card**

- Accent-coloured text and filled buttons use the accent mixed halfway to ink (`--c-accent-text`). The raw dusty rose on blush paper is 2.4:1, below WCAG even for large text. Strokes and botanicals keep the raw accent. A test guards the ratios for all six presets. `docs/05` updated.
- Names are split at "bin" or "binti" when rendered: given name large, patronym small beneath, as in the Figma. The admin keeps one field per name.
- The public page passes the dropdown guests to the card as a prop instead of the card fetching `/api/guests` on load. One fewer request before the RSVP section is usable; the route still exists.
- The 404 and error pages use the default blush and classic presets rather than the configured ones, so they can be static and never read the database at build time.

**Florals and motion**

- The seven compositions are rendered by `components/card/florals.ts` and `Florals.tsx`, a TypeScript port of `assets/gen.js` (the script that produced `assets/florals/*.svg`), not the pasted files. Same geometry and colours, about 20 KB of source instead of 500 KB of markup, and every `data-wind` group gets its sway phase and gust delay at render time, so server and client agree. `docs/05` updated.
- Every swaying group is wrapped in a positioning `<g>` that carries the SVG `transform` attribute. A CSS `transform` animation replaces the attribute on the element it targets, so animating the placed element directly would throw every leaf to the origin.
- The floral background recipes in `docs/05` are the blush renditions. They are written with `--c-bg` and `--c-soft` so another colour preset keeps its own paper; only `evening_garden` overrides the colours, as the doc says. `docs/05` updated.
- Sprig dividers and the arch take the floral theme's leaf colour (`--c-floral-leaf`) so switching the floral preset changes the divider colour, as `docs/08` expects. The colour preset's `leaf` still colours the schedule dots and the sage RSVP notice.
- `petal_fall` settles the card from `scale(1.03)` and 0 opacity, not from `blur(6px)`: the doc's own guardrails forbid `filter` animations. `docs/05` updated.
- The petal_fall scatter releases two petals per cover bloom (the first eight) plus ten from the top edge. The doc asks for 18–24 petals plus three per bloom and, a few lines later, for at most 18 alive at once; this sits between the two.
- `envelope` and `bloom` are Phase 6 (they need an extra SVG each). `ENTRANCE_PRESET_KEYS` lists only shipped variants, so the admin cannot save one that does not exist yet.
- Scroll reveals hide a section until it is 20 % in view, so a browser with JavaScript disabled would not see the sections. The card needs JavaScript for the cover and RSVP anyway.

**Deployment**

- `vercel.json` pins functions to `sin1` (Singapore), and the Neon and Blob stores were created there too. The docs don't name a region; the default `iad1` would put an ocean between the guests, the functions and the database.
- Storage was created from the CLI, not the dashboard: `vercel integration add neon -n kad-tunang-db -m region=sin1` (after accepting Neon's marketplace terms once in the browser) and `vercel blob create-store kad-tunang-blob --access public --region sin1 --yes`. Both inject their variables into every environment.
- Preview deployments keep Vercel's default authentication, so a preview link only opens for someone signed in to the Vercel team. Production is open. Turn it off under Settings → Deployment Protection if the family needs to test a preview on their phones.
- The Node image has no `curl`, so `vercel curl` (for protected previews) has to run from the host.

**Admin**

- The stats hint reads "N isi rumah" without the design's "· had 100". There is no field for a venue cap, so a fixed number would mislead.
- Contact phone numbers are normalised on blur, so "012-345 6789" becomes "0123456789" before the digits-only rule runs.
