# 05 Design

**Figma:** https://www.figma.com/design/x7AEQ2Ar29jb38Xc5ZoVtE

| Frame | Node | Shows |
|---|---|---|
| `01 Cover` | 2:2 | Cover screen before tap |
| `02 Card (scroll)` | 3:2 | Full card, every section, 390 px wide |
| `03 RSVP states` | 5:94 | Kehadiran before a name is picked, and after confirming |
| `04 Admin — Tetamu` | 7:2 | Guest list page, 1280 px |
| `05 Admin — Kad` | 9:2 | Card settings form with live preview, 1280 px |

Claude Code: if the Figma MCP is available, pull `get_design_context` on these nodes for exact spacing. If not, the values below are sufficient; the design is deliberately simple enough to build from the spec.

## Direction

Soft floral. Blush paper, deep mulberry ink, dusty rose accent, sage botanicals. Everything quiet except one element: a botanical arch of sage leaves and rose buds framing the couple's names. Section dividers are small leaf sprigs, not rules. No cards inside cards, no shadows, no gradients apart from the background wash.

## Tokens

These are the `blush` colour preset and `classic` font preset. Other presets change the values, not the structure. All card styling reads from these CSS variables; nothing in the card is hard-coded to a hex value. A derived `--c-accent-text` (the accent mixed halfway to ink) carries accent-coloured text and filled buttons; the raw accent alone does not reach WCAG contrast on the light presets. Strokes and botanicals keep the raw accent.

```css
:root {
  --c-bg:     #F6EDE8;  /* blush paper */
  --c-ink:    #4B3440;  /* deep mulberry, used for all body text */
  --c-accent: #C48E93;  /* dusty rose: headings, primary button, "&" */
  --c-leaf:   #9BAE98;  /* sage: botanicals, dividers */
  --c-soft:   #EAD5CF;  /* petal: field backgrounds, decorative blobs */
  --f-display: "Cormorant Garamond", Georgia, serif;
  --f-body:    "Nunito Sans", system-ui, sans-serif;
}
```

Colour presets to ship (`lib/presets.ts`), each with the same five keys:

| key | label | bg | ink | accent | leaf | soft |
|---|---|---|---|---|---|---|
| `blush` | Merah jambu lembut | #F6EDE8 | #4B3440 | #C48E93 | #9BAE98 | #EAD5CF |
| `sage` | Hijau sage | #EEF0E7 | #2F3A2B | #7A8F6A | #9BAE98 | #D9DFCF |
| `ivory` | Gading | #F9F5EC | #3B342C | #A88B5C | #B7B08E | #EBE3D3 |
| `navy` | Biru gelap | #1E2640 | #F1EDE4 | #C9A96E | #7C8A73 | #2C365A |
| `emerald` | Zamrud | #143D33 | #EFE9DC | #C9B27A | #6F9A85 | #1E5246 |
| `plum` | Ungu | #2B1F2E | #F3EAF2 | #D6A6C7 | #8F9E88 | #3E2D42 |

Font presets, two family names each. The files are self-hosted through `next/font` (`components/card/fonts.ts`), which inlines the `@font-face` rules and adds metric-matched fallbacks; the Google Fonts stylesheet was render-blocking and cost the card its Lighthouse budget:

| key | label | display | body |
|---|---|---|---|
| `classic` | Klasik | Cormorant Garamond | Nunito Sans |
| `script` | Skrip | Great Vibes | EB Garamond |
| `modern` | Moden | Playfair Display | Lora |
| `minimal` | Minimal | Fraunces | Fraunces |
| `jawi` | Jawi/Arab | Amiri | Amiri |

Preload is off, so only the selected preset's font files are downloaded. Always give a fallback stack.

## Type scale (card)

| Use | Font | Size | Notes |
|---|---|---|---|
| Couple names | display italic | 42–52 px (`clamp(2.4rem, 11vw, 3.25rem)`) | line-height 1.1 |
| "&" between names | display italic | 34 px | colour accent |
| Section headings (Tarikh, Tempat…) | display italic | 26 px | colour accent |
| Date "14 Mac 2027" | display medium | 40 px | |
| Countdown number | display italic | 56 px | accent; "hari lagi" 28 px ink |
| Venue name, parents | display medium | 20–28 px | |
| Body | body regular | 14–15 px | line-height 1.55; secondary text at 75–80 % opacity |
| Eyebrow ("Majlis Pertunangan") | body regular | 13 px | letter-spacing 0.1em; accent |
| Buttons | body semibold | 14 px | |

## Layout (card)

- Frame 390 px; content column 326 px (32 px side padding). Centre-aligned.
- Vertical rhythm: sections have 36 px top padding and 44 px bottom padding, separated by a 140 px sprig. Header has 40 px bottom padding.
- Pill buttons: 999 px radius, 12 px vertical padding, 22 px horizontal. Filled = accent background, bg-colour text. Outlined = 1 px accent stroke. Small pills (contacts): 7 × 14 px padding, 12 px text, soft stroke.
- Fields (RSVP selects): 12 px radius, soft background at 55 % opacity, 1 px accent stroke at 60 %, 13 px vertical padding, 16 px left padding.
- Background photo (when set): fixed, cover, `blur(2px) saturate(0.85)`, 30–35 % opacity, with a linear gradient to `--c-bg` finishing at roughly 640 px so the lower page is solid.
- Decorative petal blobs: 2–3 large ellipses in `--c-soft` at 60–80 % opacity, off-canvas corners. Pure CSS, no images.

## Botanical elements

Build as inline SVG components so they take theme colours.

- **Sprig** (`<Sprig width={140} />`): 1 px stem in leaf at 60 %, alternating leaf ellipses 14 × 6 rotated ±35°, one 7 px rose bud at centre. Used as every section divider and in the cover.
- **Arch** (`<Arch />`): a thin arc (leaf at 55 %) spanning roughly 300 px wide, 11 leaves along the arc alternating tilt and opacity, rose buds at every third leaf. Names sit inside the arch. Reduced-motion safe; no animation.

## Screen behaviour

### Cover
Full-viewport, fixed, z-index above the card. Shows eyebrow, names, date, button "Buka jemputan", helper "Ketik untuk membuka". Tap:
1. Sets `open = true`; the cover fades out over 600 ms (no transition under `prefers-reduced-motion`).
2. Calls `audio.play()` if `music_url` is set. This tap is the user gesture browsers require. If play is rejected, the toggle shows the paused state; no error is shown.
3. Body scroll is locked while the cover is visible.

### Card sections (in order)
1. **Header**: eyebrow, host parents (from `host_side`), opening text, `<Arch>` with `first_name` / `bin/binti` line / `&` / `second_name` / `bin/binti` line. Host side's child comes first.
2. **Tarikh**: heading, weekday eyebrow, date in display, time range, countdown, calendar buttons. Hidden when `event_start_at` is null.
3. **Tempat**: heading, venue name, address (pre-line), Waze (filled) + Google Maps (outlined). Map buttons only when both coordinates exist. Hidden when name and address are both empty.
4. **Atur cara**: heading, rows `time · dot · label`, time right-aligned in display 17 px accent, label left-aligned body 14 px. Hidden when `schedule` is empty.
5. **Kehadiran**: see below. Hidden when `is_rsvp_enabled` is false or there are no visible guests.
6. **Hubungi**: rows with name + relation, WhatsApp and Telefon small pills. Hidden when `contacts` is empty.
7. **Closing**: 90 px sprig, closing text in display italic 20 px, hashtag eyebrow if set.

Music toggle: fixed bottom-right, 44 px circle, bg fill, accent stroke, ♪ / ❚❚. Only rendered when `music_url` is set and the cover has been opened.

### Countdown
Single line: **`178`** *hari lagi*, with `14 jam · 32 minit · 07 saat` beneath at 13 px, 60 % opacity. Ticks every second on the client. Before hydration render an invisible placeholder of the same height (no layout shift). On the event day: "Hari ini!". After: "Terima kasih atas kehadiran". Timezone for "day" boundaries is `Asia/Kuala_Lumpur`.

### Kehadiran (RSVP)
1. Select "Nama" with placeholder "Pilih nama anda…", options in `<optgroup>` per `group_name`. Hint under it listing the group names.
2. On select: fetch status. Show "Jemputan untuk N orang." If already answered, show a soft notice ("Sudah disahkan: hadir, 3 orang. Anda boleh mengubahnya di bawah.").
3. Select "Bilangan yang akan hadir": 1…N, default = `confirmed_pax ?? pax`.
4. Buttons: **Hadir** (filled, fills half), **Tidak dapat hadir** (outlined, fills half).
5. After submit: sage-tinted notice ("Terima kasih! Kehadiran 3 orang telah disahkan." / "Terima kasih atas maklum balas anda."), tick replaces the chevron in the name field. Buttons stay enabled so they can change their mind.
6. On network error: rose-tinted notice "Tidak dapat menghantar. Cuba lagi atau hubungi kami."

## Admin

Neutral, warm, quiet. The admin borrows `--c-ink` and `--c-accent` from the blush preset for identity but is otherwise a plain form UI. Tailwind utilities; no card styling.

Tokens: bg `#F7F5F2`, panel `#FFFFFF`, line `#E6DEDB`, muted `#7F737A`, ink `#4B3440`, accent `#C48E93` (active tab underline, swatches, links), danger `#9E403A`, success `#2E5C3E` (Hadir count, coordinates-recognised line). Body 14–15 px Nunito Sans. Panels: 12 px radius, 1 px line, 20–22 px padding. Inputs: 6 px radius, 34 px tall. Primary button: ink fill, white text, 8 px radius.

### Tetamu tab
Header (couple name in display italic + "· admin", buttons Lihat kad ↗ and Log keluar) → tabs (Tetamu | Kad, rose underline on active) → stats panel (four columns: Pax dijemput with "N isi rumah · had 100" hint, Hadir in success colour, Tidak hadir, Belum jawab) → Tambah tetamu panel (Nama 2fr, Kumpulan with datalist 1fr, Pax 80 px, Tambah primary) → Senarai tetamu panel: header with Muat turun CSV; table columns Nama · Kumpulan · Pax · Status · Hadir · actions. Name is click-to-edit. Kumpulan and Pax are inline inputs saving on blur. Status is a pill-styled select (grey pending, sage attending, rose declined). Actions: ↑ ↓ (reorder within group), Sembunyi/Tunjuk, Padam (confirm dialog). Hidden rows at 50 % opacity with "(disembunyi)".

### Kad tab
Two columns: form (fills) and a 300 px "Pratonton langsung" column on the right that renders `<Card>` scaled to 300/390 with rounded corners, updating on every keystroke from unsaved form state. Panels in order: Pasangan (title, host side, names, parents, opening text), Tarikh dan tempat (start, end, venue name, address, coordinates paste box with the recognised lat/lng echoed in success colour or a muted "Butang peta akan disembunyikan" warning), Atur cara majlis (rows: ⋮⋮ handle · time input 150 px · label input fills · ×; "Tambah baris"), Hubungi (same row editor: name, relation, phone), Rupa kad (font select, colour select + swatch row, two upload zones with dashed border showing current file and Tukar · Buang), RSVP (checkbox "Benarkan tetamu sahkan kehadiran melalui kad"). Sticky bottom bar: Simpan perubahan (primary) + "Disimpan N minit lalu" / validation summary.

Reordering in v1 uses ↑ ↓ buttons calling `/reorder`. The drag handle is drawn but inert; wire drag-and-drop only if asked.

## Accessibility and performance

- Every interactive element reachable by keyboard with a visible focus ring (`outline: 2px solid var(--c-ink); outline-offset: 2px`).
- Selects are native `<select>`; no custom dropdowns.
- Colour contrast: ink on bg ≥ 7:1 for every preset; accent is never used for body text.
- No layout shift: countdown placeholder, fixed-size music button, `font-display: swap` with metric-compatible fallbacks.
- Card JS budget: only Cover, Countdown, Rsvp, MusicToggle are client components. Everything else is server-rendered.
