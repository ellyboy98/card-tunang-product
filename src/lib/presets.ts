// Font, colour and motion presets for the card (docs/05-design.md). The card
// reads fonts and colours through CSS variables, so a preset swap needs no rebuild.

export const COLOR_PRESET_KEYS = ["blush", "sage", "ivory", "navy", "emerald", "plum"] as const;
export type ColorPresetKey = (typeof COLOR_PRESET_KEYS)[number];

export type ColorPreset = {
  label: string;
  bg: string;
  ink: string;
  accent: string;
  leaf: string;
  soft: string;
};

export const COLOR_PRESETS: Record<ColorPresetKey, ColorPreset> = {
  blush: { label: "Merah jambu lembut", bg: "#F6EDE8", ink: "#4B3440", accent: "#C48E93", leaf: "#9BAE98", soft: "#EAD5CF" },
  sage: { label: "Hijau sage", bg: "#EEF0E7", ink: "#2F3A2B", accent: "#7A8F6A", leaf: "#9BAE98", soft: "#D9DFCF" },
  ivory: { label: "Gading", bg: "#F9F5EC", ink: "#3B342C", accent: "#A88B5C", leaf: "#B7B08E", soft: "#EBE3D3" },
  navy: { label: "Biru gelap", bg: "#1E2640", ink: "#F1EDE4", accent: "#C9A96E", leaf: "#7C8A73", soft: "#2C365A" },
  emerald: { label: "Zamrud", bg: "#143D33", ink: "#EFE9DC", accent: "#C9B27A", leaf: "#6F9A85", soft: "#1E5246" },
  plum: { label: "Ungu", bg: "#2B1F2E", ink: "#F3EAF2", accent: "#D6A6C7", leaf: "#8F9E88", soft: "#3E2D42" },
};

export const FONT_PRESET_KEYS = ["classic", "script", "modern", "minimal", "jawi"] as const;
export type FontPresetKey = (typeof FONT_PRESET_KEYS)[number];

export type FontPreset = {
  label: string;
  /** Family for names and headings. Loaded by components/card/fonts.ts via next/font. */
  display: string;
  /** Family for body text. */
  body: string;
};

export const FONT_PRESETS: Record<FontPresetKey, FontPreset> = {
  classic: { label: "Klasik", display: "Cormorant Garamond", body: "Nunito Sans" },
  script: { label: "Skrip", display: "Great Vibes", body: "EB Garamond" },
  modern: { label: "Moden", display: "Playfair Display", body: "Lora" },
  minimal: { label: "Minimal", display: "Fraunces", body: "Fraunces" },
  jawi: { label: "Jawi/Arab", display: "Amiri", body: "Amiri" },
};

/**
 * The accent mixed halfway to ink. Accent-coloured text and filled buttons use
 * this: the raw accent alone does not reach WCAG contrast on the light presets,
 * while ink always contrasts with bg, so the mix lifts every preset over the bar.
 */
export function textAccent(c: ColorPreset): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round((ch(c.accent, i) + ch(c.ink, i)) / 2).toString(16).padStart(2, "0")).join("");
}

export const DEFAULT_COLOR_PRESET: ColorPresetKey = "blush";
export const DEFAULT_FONT_PRESET: FontPresetKey = "classic";

// Motion (docs/05 "Motion options"): how the cover gives way, and what falls.
export const COVER_TRANSITION_KEYS = ["storm", "soft", "plain"] as const;
export type CoverTransitionKey = (typeof COVER_TRANSITION_KEYS)[number];
export const COVER_TRANSITIONS: Record<CoverTransitionKey, { label: string; hint: string }> = {
  storm: { label: "Ribut kelopak", hint: "Kelopak menyerbu skrin dan kulit kad pudar di sebaliknya." },
  soft: { label: "Pudar dengan taburan lembut", hint: "Kulit kad pudar sambil kelopak berguguran perlahan." },
  plain: { label: "Pudar sahaja", hint: "Tanpa kelopak." },
};

export const PETAL_STYLE_KEYS = ["mix", "petal", "blossom", "leaf"] as const;
export type PetalStyleKey = (typeof PETAL_STYLE_KEYS)[number];
export const PETAL_STYLES: Record<PetalStyleKey, { label: string }> = {
  mix: { label: "Kelopak dan daun" },
  petal: { label: "Kelopak mawar" },
  blossom: { label: "Bunga kecil" },
  leaf: { label: "Daun sage" },
};

export const PETAL_DENSITY_KEYS = ["sparse", "normal", "dense"] as const;
export type PetalDensityKey = (typeof PETAL_DENSITY_KEYS)[number];
/** `factor` multiplies every petal count. */
export const PETAL_DENSITIES: Record<PetalDensityKey, { label: string; factor: number }> = {
  sparse: { label: "Sedikit", factor: 0.6 },
  normal: { label: "Sederhana", factor: 1 },
  dense: { label: "Lebat", factor: 1.6 },
};

export const DEFAULT_COVER_TRANSITION: CoverTransitionKey = "storm";
export const DEFAULT_PETAL_STYLE: PetalStyleKey = "mix";
export const DEFAULT_PETAL_DENSITY: PetalDensityKey = "normal";

/** Unknown keys fall back to the default so a stale row never breaks the card. */
function known<K extends string>(keys: readonly K[], key: string, fallback: K): K {
  return (keys as readonly string[]).includes(key) ? (key as K) : fallback;
}
export const colorPresetKey = (key: string): ColorPresetKey => known(COLOR_PRESET_KEYS, key, DEFAULT_COLOR_PRESET);
export const fontPresetKey = (key: string): FontPresetKey => known(FONT_PRESET_KEYS, key, DEFAULT_FONT_PRESET);
export const coverTransitionKey = (key: string): CoverTransitionKey => known(COVER_TRANSITION_KEYS, key, DEFAULT_COVER_TRANSITION);
export const petalStyleKey = (key: string): PetalStyleKey => known(PETAL_STYLE_KEYS, key, DEFAULT_PETAL_STYLE);
export const petalDensityKey = (key: string): PetalDensityKey => known(PETAL_DENSITY_KEYS, key, DEFAULT_PETAL_DENSITY);
export function colorPreset(key: string): ColorPreset {
  return COLOR_PRESETS[colorPresetKey(key)];
}
export function fontPreset(key: string): FontPreset {
  return FONT_PRESETS[fontPresetKey(key)];
}
