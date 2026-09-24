// Font, colour, floral and motion presets for the card (docs/05-design.md). The
// card reads fonts and colours through CSS variables, so a preset swap needs no
// rebuild. Adding an option anywhere is one entry in this file.

export const COLOR_PRESET_KEYS = ["blush", "sage", "ivory", "navy", "emerald", "plum"] as const;
export type ColorPresetKey = (typeof COLOR_PRESET_KEYS)[number];

export type ColorPreset = {
  label: string;
  labelEn: string;
  bg: string;
  ink: string;
  accent: string;
  leaf: string;
  soft: string;
};

export const COLOR_PRESETS: Record<ColorPresetKey, ColorPreset> = {
  blush: { label: "Merah jambu lembut", labelEn: "Soft blush", bg: "#F6EDE8", ink: "#4B3440", accent: "#C48E93", leaf: "#9BAE98", soft: "#EAD5CF" },
  sage: { label: "Hijau sage", labelEn: "Sage green", bg: "#EEF0E7", ink: "#2F3A2B", accent: "#7A8F6A", leaf: "#9BAE98", soft: "#D9DFCF" },
  ivory: { label: "Gading", labelEn: "Ivory", bg: "#F9F5EC", ink: "#3B342C", accent: "#A88B5C", leaf: "#B7B08E", soft: "#EBE3D3" },
  navy: { label: "Biru gelap", labelEn: "Navy", bg: "#1E2640", ink: "#F1EDE4", accent: "#C9A96E", leaf: "#7C8A73", soft: "#2C365A" },
  emerald: { label: "Zamrud", labelEn: "Emerald", bg: "#143D33", ink: "#EFE9DC", accent: "#C9B27A", leaf: "#6F9A85", soft: "#1E5246" },
  plum: { label: "Ungu", labelEn: "Plum", bg: "#2B1F2E", ink: "#F3EAF2", accent: "#D6A6C7", leaf: "#8F9E88", soft: "#3E2D42" },
};

export const FONT_PRESET_KEYS = ["classic", "script", "modern", "minimal", "jawi"] as const;
export type FontPresetKey = (typeof FONT_PRESET_KEYS)[number];

export type FontPreset = {
  label: string;
  labelEn: string;
  /** Family for names and headings. Loaded by components/card/fonts.ts via next/font. */
  display: string;
  /** Family for body text. */
  body: string;
};

export const FONT_PRESETS: Record<FontPresetKey, FontPreset> = {
  classic: { label: "Klasik", labelEn: "Classic", display: "Cormorant Garamond", body: "Nunito Sans" },
  script: { label: "Skrip", labelEn: "Script", display: "Great Vibes", body: "EB Garamond" },
  modern: { label: "Moden", labelEn: "Modern", display: "Playfair Display", body: "Lora" },
  minimal: { label: "Minimal", labelEn: "Minimal", display: "Fraunces", body: "Fraunces" },
  jawi: { label: "Jawi/Arab", labelEn: "Jawi/Arabic", display: "Amiri", body: "Amiri" },
};

/**
 * The accent mixed halfway to ink. Accent-coloured text and filled buttons use
 * this: the raw accent alone does not reach WCAG contrast on the light presets,
 * while ink always contrasts with bg, so the mix lifts every preset over the bar.
 */
export function textAccent(c: Pick<ColorPreset, "accent" | "ink">): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round((ch(c.accent, i) + ch(c.ink, i)) / 2).toString(16).padStart(2, "0")).join("");
}

// Floral themes (docs/05 "Floral themes"): the cover composition, the card's
// corner clusters and the divider colour. Independent of colour and font.
export const FLORAL_PRESET_KEYS = ["peony_corners", "evening_garden", "wreath", "wisteria", "songket", "line_art", "watercolor"] as const;
export type FloralPresetKey = (typeof FLORAL_PRESET_KEYS)[number];

export type FloralPreset = {
  label: string;
  labelEn: string;
  /** Colour of the sprig dividers and the arch, so they match the composition. */
  leaf: string;
  /** Text colours the theme forces, regardless of the colour preset. Only the dark garden. */
  forces?: Pick<ColorPreset, "bg" | "ink" | "accent" | "soft">;
};

export const FLORAL_PRESETS: Record<FloralPresetKey, FloralPreset> = {
  peony_corners: { label: "Peony di penjuru", labelEn: "Peony corners", leaf: "#9DB19A" },
  evening_garden: { label: "Malam taman", labelEn: "Evening garden", leaf: "#8FA48B", forces: { bg: "#2B1A22", ink: "#F6EAE4", accent: "#E7B4B6", soft: "#6B4657" } },
  wreath: { label: "Kalungan bunga", labelEn: "Wreath", leaf: "#9DB19A" },
  wisteria: { label: "Tirai wisteria", labelEn: "Wisteria curtain", leaf: "#8C9B84" },
  songket: { label: "Songket", labelEn: "Songket", leaf: "#C9A46A" },
  line_art: { label: "Lukisan garis", labelEn: "Line art", leaf: "#7C9279" },
  watercolor: { label: "Cat air", labelEn: "Watercolour", leaf: "#9DB19A" },
};

// Entrance variants (docs/05 "Entrance variants"). `envelope` and `bloom` are
// Phase 6 and not listed until they ship, so the admin cannot pick them.
export const ENTRANCE_PRESET_KEYS = ["petal_fall", "curtain", "slide_up", "slide_left", "fade"] as const;
export type EntrancePresetKey = (typeof ENTRANCE_PRESET_KEYS)[number];
export const ENTRANCE_PRESETS: Record<EntrancePresetKey, { label: string; labelEn: string; hint: string; hintEn: string }> = {
  petal_fall: { label: "Hujan bunga", labelEn: "Petal fall", hint: "Kulit kad pudar sambil kelopak berguguran; bunga di penjuru bertaburan dan tumbuh semula pada kad.", hintEn: "The cover fades as petals fall; the corner blooms scatter and regrow on the card." },
  curtain: { label: "Tirai", labelEn: "Curtain", hint: "Kulit kad terbelah dua dan terbuka ke atas dan ke bawah.", hintEn: "The cover splits in two and parts upwards and downwards." },
  slide_up: { label: "Luncur ke atas", labelEn: "Slide up", hint: "Kulit kad terangkat ke atas; kad naik dari bawah.", hintEn: "The cover lifts away; the card rises from below." },
  slide_left: { label: "Luncur ke kiri", labelEn: "Slide left", hint: "Kulit kad meluncur ke kiri seperti membuka halaman.", hintEn: "The cover slides left, like turning a page." },
  fade: { label: "Pudar", labelEn: "Fade", hint: "Kulit kad pudar sahaja. Paling ringan untuk telefon lama.", hintEn: "The cover simply fades. Lightest on old phones." },
};

export const WIND_PRESET_KEYS = ["off", "gentle", "breezy"] as const;
export type WindPresetKey = (typeof WIND_PRESET_KEYS)[number];
/** `k` multiplies the sway and gust amplitudes; `gust` is the seconds between gusts; `extra` petals per gust. */
export const WIND_PRESETS: Record<WindPresetKey, { label: string; labelEn: string; k: number; gust: readonly [number, number] | null; extra: number }> = {
  off: { label: "Tiada", labelEn: "Off", k: 0, gust: null, extra: 0 },
  gentle: { label: "Lembut", labelEn: "Gentle", k: 1, gust: [9, 16], extra: 2 },
  breezy: { label: "Berangin", labelEn: "Breezy", k: 1.6, gust: [6, 10], extra: 3 },
};

export const REVEAL_PRESET_KEYS = ["fade_up", "slide_in", "bloom_in", "none"] as const;
export type RevealPresetKey = (typeof REVEAL_PRESET_KEYS)[number];
export const REVEAL_PRESETS: Record<RevealPresetKey, { label: string; labelEn: string }> = {
  fade_up: { label: "Naik lembut", labelEn: "Soft rise" },
  slide_in: { label: "Luncur masuk", labelEn: "Slide in" },
  bloom_in: { label: "Kembang", labelEn: "Bloom" },
  none: { label: "Tiada", labelEn: "None" },
};

export const DEFAULT_COLOR_PRESET: ColorPresetKey = "blush";
export const DEFAULT_FONT_PRESET: FontPresetKey = "classic";
export const DEFAULT_FLORAL_PRESET: FloralPresetKey = "peony_corners";
export const DEFAULT_ENTRANCE_PRESET: EntrancePresetKey = "petal_fall";
export const DEFAULT_WIND_PRESET: WindPresetKey = "gentle";
export const DEFAULT_REVEAL_PRESET: RevealPresetKey = "fade_up";

/** Unknown keys fall back to the default so a stale row never breaks the card. */
function known<K extends string>(keys: readonly K[], key: string, fallback: K): K {
  return (keys as readonly string[]).includes(key) ? (key as K) : fallback;
}
export const colorPresetKey = (key: string): ColorPresetKey => known(COLOR_PRESET_KEYS, key, DEFAULT_COLOR_PRESET);
export const fontPresetKey = (key: string): FontPresetKey => known(FONT_PRESET_KEYS, key, DEFAULT_FONT_PRESET);
export const floralPresetKey = (key: string): FloralPresetKey => known(FLORAL_PRESET_KEYS, key, DEFAULT_FLORAL_PRESET);
export const entrancePresetKey = (key: string): EntrancePresetKey => known(ENTRANCE_PRESET_KEYS, key, DEFAULT_ENTRANCE_PRESET);
export const windPresetKey = (key: string): WindPresetKey => known(WIND_PRESET_KEYS, key, DEFAULT_WIND_PRESET);
export const revealPresetKey = (key: string): RevealPresetKey => known(REVEAL_PRESET_KEYS, key, DEFAULT_REVEAL_PRESET);

export const colorPreset = (key: string): ColorPreset => COLOR_PRESETS[colorPresetKey(key)];

/** The colours the card actually paints with: the colour preset, unless the floral theme forces its own. */
export function effectiveColors(colorKey: string, floralKey: string): ColorPreset {
  const c = colorPreset(colorKey);
  const f = FLORAL_PRESETS[floralPresetKey(floralKey)].forces;
  return f ? { ...c, ...f } : c;
}
