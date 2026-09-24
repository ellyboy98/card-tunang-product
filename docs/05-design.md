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

`lib/presets.ts` exports `FONT_PRESETS`, `COLOR_PRESETS`, `FLORAL_PRESETS`, `ENTRANCE_PRESETS`, `WIND_PRESETS`, `REVEAL_PRESETS`, each a record of `{ label, … }` keyed by the snake_case values stored in `settings`. Adding an option anywhere is one entry in that file.

Colour presets to ship, each with the same five keys:

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
Two columns: form (fills) and a 300 px "Pratonton langsung" column on the right that renders `<Card>` scaled to 300/390 with rounded corners, updating on every keystroke from unsaved form state. Panels in order: Pasangan (title, host side, names, parents, opening text), Tarikh dan tempat (start, end, venue name, address, coordinates paste box with the recognised lat/lng echoed in success colour or a muted "Butang peta akan disembunyikan" warning), Atur cara majlis (rows: ⋮⋮ handle · time input 150 px · label input fills · ×; "Tambah baris"), Hubungi (same row editor: name, relation, phone), Rupa kad (font select, colour select + swatch row, **bunga select with a 7-thumbnail strip** using the `assets/florals` SVGs at 60 px, two upload zones with dashed border showing current file and Tukar · Buang), **Animasi (entrance select, wind select, reveal select, and a "Pratonton animasi" button that replays the entrance in the live preview)**, RSVP (checkbox "Benarkan tetamu sahkan kehadiran melalui kad"). Sticky bottom bar: Simpan perubahan (primary) + "Disimpan N minit lalu" / validation summary.

Reordering in v1 uses ↑ ↓ buttons calling `/reorder`. The drag handle is drawn but inert; wire drag-and-drop only if asked.

## Accessibility and performance

- Every interactive element reachable by keyboard with a visible focus ring (`outline: 2px solid var(--c-ink); outline-offset: 2px`).
- Selects are native `<select>`; no custom dropdowns.
- Colour contrast: ink on bg ≥ 7:1 for every preset; accent is never used for body text.
- No layout shift: countdown placeholder, fixed-size music button, `font-display: swap` with metric-compatible fallbacks.
- Card JS budget: only Cover, Countdown, Rsvp, MusicToggle are client components. Everything else is server-rendered.

## Motion

Motion is concentrated in three moments (entrance, arch, scroll reveal) plus a faint ambient layer. Everything is CSS transforms and opacity, driven by classes toggled from React state or a single `useInView` hook (IntersectionObserver). No animation libraries. Every rule below is wrapped in `@media (prefers-reduced-motion: no-preference)`; with reduced motion, elements simply appear and the cover fades in 200 ms.

Timing tokens (`card.css`):
```css
--ease-out:   cubic-bezier(0.22, 1, 0.36, 1);
--ease-soft:  cubic-bezier(0.4, 0, 0.2, 1);
--dur-fast:   300ms;  --dur-med: 700ms;  --dur-slow: 1200ms;
```

### 1. Entrance (cover → card)
Trigger: tap on "Buka jemputan".
1. Cover splits horizontally at 50 %. Top half `translateY(-100%)`, bottom half `translateY(100%)`, `var(--dur-slow)`, `--ease-soft`, 100 ms delay so the button press registers. Both halves also fade to 0 over the last 400 ms. Cover unmounts at 1300 ms.
2. **Petal fall**: at t = 200 ms, mount `<PetalFall count={18} />`. Each petal is one 14 × 20 SVG path (a soft teardrop, filled `--c-soft` or `--c-accent`, 70–90 % opacity), positioned absolutely at a random `left` (5–95 %), starting at `top: -40px`. Keyframes:
   ```css
   @keyframes petal-fall {
     0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
     8%   { opacity: var(--petal-o); }
     100% { transform: translate(var(--petal-dx), 110vh) rotate(var(--petal-rot)); opacity: 0; }
   }
   ```
   Per-petal inline custom properties, randomised once at mount: `--petal-dx` (−60px … 60px), `--petal-rot` (180deg … 540deg), `--petal-o` (0.6 … 0.9), `animation-duration` (3.5 s … 6 s), `animation-delay` (0 … 2.5 s). Add a second, slower keyframe on a wrapper for sway: `translateX` ±14px over 2.2 s, `ease-in-out`, infinite alternate. `will-change: transform`. The component unmounts itself at 9 s. 18 petals × 2 transforms is well within budget on a 2020 Android.
3. Body scroll unlocks at 1300 ms; music starts at t = 0 (the tap).

### 2. Arch grows
Trigger: 600 ms after the cover starts parting (the arch is visible through the gap).
- Stem: `stroke-dasharray` = path length, `stroke-dashoffset` animates to 0 over `var(--dur-slow)`, `--ease-out`.
- Leaves: `transform-origin` at each leaf's stem point (set per leaf in the SVG via `transform-box: fill-box`), `scale(0) → scale(1.08) → scale(1)` over 500 ms, `--ease-out`, delays `300ms + i × 70ms` following the arc left to right.
- Buds: `scale(0) → 1` over 400 ms, delay 1100 ms.
- Names: `opacity 0 → 1`, `translateY(12px) → 0`, `var(--dur-med)`, delay 1000 ms. The "&" follows 150 ms later.
- Parents and opening text above the arch fade in first, delay 300 ms.
Runs once. Uses a `.is-grown` class set by state; not scroll-linked.

### 3. Scroll reveals
`useInView(ref, { threshold: 0.2, once: true })` adds `.is-visible`.
- Section body: `opacity 0 → 1`, `translateY(16px) → 0`, `var(--dur-med)`, `--ease-out`.
- Sprig dividers: same stem-draw and leaf-pop as the arch, at half the durations (stem 600 ms, leaves 300 ms with 50 ms stagger).
- Atur cara rows: stagger 60 ms per row.
- Contact rows: stagger 60 ms per row.

### 4. Ambient petals
After the entrance completes, mount `<PetalDrift />` behind the content (`z-index` below `.card__inner`, `pointer-events: none`). Every 15–20 s (randomised) it releases 3 petals using the same keyframes as the entrance but with duration 9–14 s, opacity 0.25–0.4, and no sway wrapper. Never more than 6 petals alive at once. Pauses when `document.hidden`. This is the only continuous motion on the page.

### 5. Micro-interactions
- Cover button: `box-shadow: 0 0 0 0 color-mix(in srgb, var(--c-accent) 45%, transparent)` → `0 0 0 14px transparent`, 2.5 s, `ease-out`, infinite. Reads as a slow breath.
- Music toggle while playing: the ♪ rocks `rotate(-8deg) ↔ rotate(8deg)`, 1.6 s, `ease-in-out`, infinite alternate. Stops when paused.
- Countdown digits: when a value changes, the old digit fades out 150 ms while the new one fades in; wrap each unit in a fixed-width span so nothing shifts.
- RSVP confirm: the tick in the name field draws with `stroke-dashoffset` over 400 ms; the notice slides up 8 px and fades in over `var(--dur-fast)`.
- Buttons: `transform: translateY(1px)` on `:active`, 80 ms. Nothing on hover (touch device).

### Budget and guardrails
- Only `transform` and `opacity` animate. No `top/left`, no `filter` animations, no `box-shadow` except the button breath (cheap: one element).
- Total petal elements alive: ≤ 18 during entrance, ≤ 6 after.
- All timers cleared on unmount; `PetalDrift` observes `visibilitychange`.
- Lighthouse mobile Performance must stay ≥ 90 with motion enabled; if it drops, reduce petal count before anything else.
- Test on a real Android Chrome at 60 Hz: the entrance must never drop frames long enough to feel like a stutter.

### Not doing
Parallax on the background photo, hearts, continuous heavy petal storms, letter-by-letter text reveals, scroll-jacking, Lottie or GIF assets, any animation library.

## Floral themes (Design options page)

The Figma file has a second page, **Design options**, with seven cover directions. Each is also shipped as a ready SVG in `assets/florals/` so nothing has to be redrawn from a screenshot. Reusable pieces (peony, bud, leaf, petal, eucalyptus spray, fern, wisteria strand, line-art flower and stem, bunga tanjung, sprig divider) are in `assets/elements/`.

| Key (`floral_preset`) | Figma frame | Node | SVG | Background |
|---|---|---|---|---|
| `peony_corners` | A · Peony corners | 15:2 | `cover-A-peony-corners.svg` | linear #F8EDE8 → #F6E7E3 → #EFD9D6 |
| `evening_garden` | B · Malam taman (dark) | 15:762 | `cover-B-evening-garden.svg` | radial #4A3040 → #2B1A22, blurred glow #6B4657 35 %, 14 blurred firefly dots #F3D8B0 |
| `wreath` | C · Wreath | 15:1499 | `cover-C-wreath.svg` | linear #FBF6F1 → #F3E3DD, blurred blush ellipse behind |
| `wisteria` | D · Tirai wisteria | 17:2 | `cover-D-wisteria.svg` | linear #EFE6EE → #F8EFEA |
| `songket` | E · Songket | 17:667 | `cover-E-songket.svg` | solid #F7EFE6; ink #3E2E28; gold #C9A46A / #A8874A for eyebrow |
| `line_art` | F · Lukisan garis | 17:1742 | `cover-F-line-art.svg` | #FAF6F2 with radial white→#EBDDD6 wash |
| `watercolor` | G · Cat air | 17:2309 | `cover-G-watercolor.svg` | #FBF4F1 + 5 large blurred colour washes (#F3C9C7, #EAD7E3, #D9E3D4, #F1D4CB, #F6DCD8, blur 70) + frosted panel behind names (white 28 %, backdrop-blur 12, radius 18) |

Rules:
- The floral preset is admin-selectable and independent of the colour and font presets. `evening_garden` forces light text (ink `#F6EAE4`, accent `#E7B4B6`); every other preset uses the colour preset's ink/accent.
- The cover uses the full composition. The card body reuses the same preset's **corner clusters** (`#corner-tl`, `#corner-br`, or `#top`, `#bottom` groups) at 60 % scale behind the header, and the `sprig-divider` element between sections, recoloured with the preset's leaf colour. The wreath preset uses its top and bottom arcs only on the card body.
- The compositions are rendered by `components/card/florals.ts` and `Florals.tsx`, a TypeScript port of `assets/gen.js` (the generator that produced the SVG files), never `<img>`, because the animations target groups inside them. Same geometry and colours as the files; the port is a fraction of the size and gives every group its wind variables at render time.
- Every group carries `data-wind="bloom|leaf|vine"` and a stable `id`. Do not strip these when optimising.
- File sizes are 50–80 KB uncompressed per cover; gzip brings them to ~12 KB. Fine.
- The background recipes above are the blush renditions. They are written with `--c-bg` and `--c-soft` so a different colour preset keeps its own paper; only `evening_garden` overrides the colours.

## Wind

Everything floral moves as if in a light breeze. It is subtle: if a guest notices it consciously, it is too strong. Two layers:

**1. Idle sway (always, when motion is allowed)**
Each `[data-wind]` group gets a slow, looping rotation around its stem. Amplitude and period by kind:

| kind | rotation | period | transform-origin |
|---|---|---|---|
| `vine` (eucalyptus, fern, wisteria, line-stem) | ±2.5° | 5–7 s | the stem's anchor end (`transform-box: fill-box`; origin `50% 0%` for hanging wisteria, `0% 100%` or `100% 100%` for corner sprays) |
| `leaf` | ±4° | 3–4.5 s | stem point (`50% 100%`) |
| `bloom` (peony, bud, line flower) | ±1.5° plus `translateY` ±1.5 px | 6–8 s | centre |

```css
@media (prefers-reduced-motion: no-preference) {
  [data-wind] { animation: sway var(--sway-dur, 6s) var(--sway-delay, 0s) ease-in-out infinite alternate; transform-box: fill-box; }
  [data-wind="vine"]  { --amp: 2.5deg; transform-origin: 50% 0%; }
  [data-wind="leaf"]  { --amp: 4deg;   transform-origin: 50% 100%; }
  [data-wind="bloom"] { --amp: 1.5deg; transform-origin: 50% 50%; }
  @keyframes sway { from { transform: rotate(calc(var(--amp) * -1)); } to { transform: rotate(var(--amp)); } }
}
```
Set `--sway-dur` and `--sway-delay` per element at mount from a seeded pseudo-random (element index × golden ratio), so neighbouring leaves are never in phase. Corner sprays on the left rotate from a bottom-left origin, on the right from bottom-right, so both lean the same way in a gust.

**2. Gusts (every 9–16 s, randomised)**
A gust is a class `.gust` added to the floral root for 2.2 s. During it a second animation layers on top of the sway: every `[data-wind]` element leans in the wind direction and springs back, with delay proportional to its horizontal position so the gust visibly travels left→right across the screen (about 600 ms to cross).

```css
.gust [data-wind] { animation: sway var(--sway-dur) var(--sway-delay) ease-in-out infinite alternate,
                                gust 2.2s var(--gust-delay) cubic-bezier(.2,.7,.2,1) 1; }
@keyframes gust { 0% { translate: 0 0; rotate: 0deg; } 30% { translate: 6px 0; rotate: var(--gust-amp); } 60% { translate: -2px 0; rotate: calc(var(--gust-amp) * -0.35); } 100% { translate: 0 0; rotate: 0deg; } }
[data-wind="vine"]  { --gust-amp: 6deg; }
[data-wind="leaf"]  { --gust-amp: 9deg; }
[data-wind="bloom"] { --gust-amp: 3deg; }
```
`--gust-delay` = `(element.x / viewportWidth) × 600ms`, set once at mount. During a gust, `PetalDrift` releases 2 extra petals from the right-hand cluster. Gusts pause when `document.hidden` and stop entirely under `prefers-reduced-motion`.

Wind intensity is admin-selectable (`wind_preset`):

| key | label | effect |
|---|---|---|
| `off` | Tiada | no sway, no gusts |
| `gentle` | Lembut (default) | values above |
| `breezy` | Berangin | amplitudes × 1.6, gust every 6–10 s, 3 extra petals per gust |

## Entrance variants (admin-selectable, `entrance_preset`)

All variants share the same skeleton: tap → cover leaves → card arrives → florals settle → arch grows → names fade up. They differ in how the cover leaves and how the card arrives. Every variant runs ≤ 1.6 s before the card is readable, and every one degrades to a 200 ms fade under reduced motion.

| key | label (admin) | Cover exit | Card entry | Florals hand-off |
|---|---|---|---|---|
| `petal_fall` | Hujan bunga (default) | Cover fades over 700 ms while 18–24 petals fall through it (see Motion §1). | Card is already beneath; it settles from `scale(1.03)` and 0 opacity to crisp over 900 ms (no blur: the guardrails forbid `filter` animations). | The cover's corner blooms **scatter**: each `.bloom` in the cover scales to 0 with a 40 ms stagger, releasing 3 petals at its position; the card's corner clusters then **regrow** (blooms scale 0 → 1, leaves unfurl, 60 ms stagger, 1.1 s total). The flowers appear to leave with the wind and come back on the next page. |
| `curtain` | Tirai | Splits at 50 %, halves slide up/down 1.2 s. | Static beneath. | Card florals fade in with the arch grow. |
| `slide_up` | Luncur ke atas | Cover slides up `translateY(-100%)` 900 ms, `--ease-soft`, with a 24 px soft shadow at its bottom edge. | Card rises 40 px → 0 and fades in, starting at 200 ms. | Same as curtain, plus 8 petals fall from the cover's bottom edge as it lifts. |
| `slide_left` | Luncur ke kiri | Cover slides left `translateX(-100%)` 800 ms. | Card enters from the right `translateX(30%)` → 0, 800 ms, both with `--ease-soft`. Feels like turning a page. | Card corner clusters slide in with the card (they are part of it), then a single gust runs left→right on arrival. |
| `envelope` | Sampul | Cover is drawn as an envelope: flap (top triangle) rotates open on the X axis over 700 ms; the wax seal (couple's initials, `--c-accent`) cracks: two halves rotate ±12° and fade. | Card slides up out of the envelope body 1.2 s, then the envelope body fades. | 12 petals spill out with the card. Corner clusters grow as in `petal_fall`. |
| `bloom` | Kembang | The cover's central bloom (a large peony behind the names, added for this variant) opens: petal rings scale from 0.6 → 1 outward ring by ring, 900 ms, then the whole cover fades. | Card settles as in `petal_fall`. | Petals detach from the opening bloom and fall. Card florals regrow. |
| `fade` | Pudar | Cover fades 600 ms. | None. | Arch grow only. Safest for very old devices. |

Implementation notes:
- One component `<Entrance preset=… onDone>` owns the cover, timers, and petal emitters. Variants are keyframe sets and a small timeline table, not separate components. If it can't be expressed as CSS classes toggled at times from one `setTimeout` chain, it's too complex for v1.
- The card's floral root gets `.is-settling` for the regrow, then `.is-live` which turns wind on. Wind never runs during the entrance.
- The admin Kad tab shows a **"Pratonton animasi"** button under the entrance select that replays the chosen entrance in the live preview.
- `envelope` and `bloom` need one extra SVG each (envelope shape; large single peony). Build them last; ship `petal_fall`, `curtain`, `slide_up`, `slide_left`, `fade` first.

## Section transitions on scroll (admin-selectable, `reveal_preset`)

| key | label | effect |
|---|---|---|
| `fade_up` | Naik lembut (default) | opacity 0→1, translateY 16px→0, 700 ms |
| `slide_in` | Luncur masuk | alternating sections slide in from left/right 32 px, 700 ms |
| `bloom_in` | Kembang | section scales 0.96→1 and fades; its sprig divider draws in first |
| `none` | Tiada | sections are visible immediately |

Sprig dividers always draw in (stem then leaves) unless `none`.
