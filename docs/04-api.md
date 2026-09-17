# 04 API

All routes are Next.js route handlers under `src/app/api/`. JSON in, JSON out. Errors are `{ "error": string }` with a meaningful status. Timestamps are ISO 8601 UTC. Field names in JSON are `camelCase` (they are the Drizzle property names); the database columns behind them are `snake_case`.

## Authentication

| Route | Method | Body | Response |
|---|---|---|---|
| `/api/admin/login` | POST | `{ password }` | `200 { ok: true }` + sets cookie `kt_admin` (httpOnly, sameSite=lax, secure in prod, 30 d). `401 { error }` on wrong password. |
| `/api/admin/logout` | POST | – | `200 { ok: true }`, clears cookie. |

`middleware.ts` matches `/admin/:path*` and `/api/admin/:path*`. It allows `/admin/login` and `/api/admin/login` through, validates the cookie for everything else, and returns `401` JSON for API paths or redirects to `/admin/login` for pages.

Token: `HMAC-SHA256("kad-tunang-admin-session", ADMIN_SECRET)` as hex. Compared in constant time. No server-side session store.

## Public routes

### `GET /api/guests`
Dropdown data. Returns only what the card needs.

```json
[{ "id": 12, "label": "Pak Cik Ahmad (Klang) sekeluarga", "groupName": "Keluarga pengantin perempuan" }]
```
- Excludes `is_hidden = true`.
- Ordered by `group_name`, `sort_order`, `label`.
- `Cache-Control: no-store`.

### `GET /api/rsvp?guestId=12`
Current state for one household, shown after selection.

```json
{ "id": 12, "label": "…", "pax": 4, "status": "attending", "confirmedPax": 3 }
```
- `400` if `guestId` missing or not an integer. `404` if not found or hidden.

### `POST /api/rsvp`
```json
{ "guestId": 12, "status": "attending", "pax": 3 }
```
Rules (in `rsvp.service.respond`):
- `403 { error: "RSVP ditutup" }` when `settings.is_rsvp_enabled = false`.
- `404` if guest missing or hidden.
- `status = "declined"` → `confirmed_pax = 0`, `pax` ignored.
- `status = "attending"` → `confirmed_pax = clamp(pax ?? guest.pax, 1, guest.pax)`.
- Sets `updated_at`.

Response `200`:
```json
{ "id": 12, "label": "…", "pax": 4, "status": "attending", "confirmedPax": 3 }
```

## Admin routes (cookie required)

### `GET /api/admin/guests`
Full rows, all columns, ordered `group_name, sort_order, label`. Also returns totals so the stats bar needs no second call:

```json
{
  "guests": [ { "id": 1, "label": "…", "groupName": "…", "pax": 4, "confirmedPax": 4, "status": "attending", "sortOrder": 0, "isHidden": false, "note": null, "createdAt": "…", "updatedAt": "…" } ],
  "totals": { "households": 31, "invited": 98, "attending": 64, "declined": 6, "pending": 28 }
}
```

### `POST /api/admin/guests`
Body: `guestInput` = `{ label, groupName?, pax, note? }`. Returns `201` with the row.

### `PATCH /api/admin/guests/:id`
Body: any subset of `{ label, groupName, pax, status, confirmedPax, sortOrder, isHidden, note }` (`guestPatch`). Returns the updated row. `404` if missing. If `pax` is lowered below `confirmed_pax`, the service lowers `confirmed_pax` to match.

### `DELETE /api/admin/guests/:id`
`200 { ok: true }`. Hard delete; the admin UI confirms first.

### `POST /api/admin/guests/reorder`
Body: `{ ids: number[] }` in the desired order within one group. Service writes `sort_order = index`. Returns `200 { ok: true }`. Used by the up/down buttons in v1; ready for drag-and-drop later.

### `GET /api/admin/settings`
Returns the settings row (created with defaults if absent).

### `PUT /api/admin/settings`
Body: the full `settingsInput` object (every field, nullable ones may be `null`). Returns the updated row. Whole-object PUT keeps the form simple: the admin form state *is* the payload.

### `POST /api/admin/upload`
`multipart/form-data` with `kind` (`music` | `background`) and `file`.

| kind | Accepted MIME | Max size |
|---|---|---|
| `music` | `audio/mpeg` | 3 MB |
| `background` | `image/jpeg`, `image/png`, `image/webp` | 2 MB |

- `400` missing fields · `415` wrong type · `413` too big.
- Stored at `{kind}/{timestamp}.{ext}` via the storage adapter. Client file names are never used.
- Returns `200 { url }`. The URL is only persisted when the admin saves settings; orphaned uploads are acceptable in v1.

### `GET /api/admin/export`
`text/csv; charset=utf-8` with BOM (so Excel opens it correctly). Columns: `Kumpulan, Nama, Pax dijemput, Status, Pax hadir, Nota, Dikemaskini`. `Content-Disposition: attachment; filename="tetamu-YYYY-MM-DD.csv"`.

## Zod schemas (single source of truth: `src/lib/validation.ts`)

```ts
export const guestInput = z.object({
  label: z.string().trim().min(1).max(120),
  groupName: z.string().trim().min(1).max(60).default("Lain-lain"),
  pax: z.number().int().min(1).max(50),
  note: z.string().max(500).nullable().optional(),
});
export const guestPatch = guestInput.partial().extend({
  status: z.enum(["pending", "attending", "declined"]).optional(),
  confirmedPax: z.number().int().min(0).max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isHidden: z.boolean().optional(),
});
export const rsvpInput = z.object({
  guestId: z.number().int().positive(),
  status: z.enum(["attending", "declined"]),
  pax: z.number().int().min(1).optional(), // no upper bound: the service clamps to the allocation
});
export const scheduleItem = z.object({ time: z.string().trim().max(20), label: z.string().trim().max(120) });
export const contact = z.object({ name: z.string().trim().max(80), relation: z.string().trim().max(60).optional(), phone: z.string().trim().regex(/^\+?\d{9,13}$/) });
export const settingsInput = z.object({
  title: z.string().trim().max(120),
  brideName: z.string().trim().max(120),
  groomName: z.string().trim().max(120),
  brideParents: z.string().trim().max(240),
  groomParents: z.string().trim().max(240),
  hostSide: z.enum(["bride", "groom"]),
  openingText: z.string().trim().max(600),
  closingText: z.string().trim().max(300),
  hashtag: z.string().trim().max(60).nullable(),
  eventStartAt: z.string().datetime({ offset: true }).nullable(),
  eventEndAt: z.string().datetime({ offset: true }).nullable(),
  venueName: z.string().trim().max(160),
  venueAddress: z.string().trim().max(400),
  venueLat: z.number().min(-90).max(90).nullable(),
  venueLng: z.number().min(-180).max(180).nullable(),
  schedule: z.array(scheduleItem).max(20),
  contacts: z.array(contact).max(10),
  musicUrl: z.string().url().nullable(),
  backgroundUrl: z.string().url().nullable(),
  fontPreset: z.enum(FONT_PRESET_KEYS),
  colorPreset: z.enum(COLOR_PRESET_KEYS),
  isRsvpEnabled: z.boolean(),
}).refine(s => !s.eventEndAt || !s.eventStartAt || s.eventEndAt > s.eventStartAt, { message: "Tamat mesti selepas mula", path: ["eventEndAt"] });
```

Route handlers call `schema.safeParse(await req.json())` and return `400 { error: "Data tidak sah", issues: parsed.error.flatten() }` on failure. The admin form uses the same schema client-side to show field errors before submitting.
