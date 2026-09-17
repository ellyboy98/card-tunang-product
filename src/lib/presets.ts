// Font and colour presets for the card (docs/05-design.md). The card reads
// everything through CSS variables, so a preset swap needs no rebuild.

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
  /** CSS font-family stack for names and headings. */
  display: string;
  /** CSS font-family stack for body text. */
  body: string;
  /** Google Fonts stylesheet for this preset only. */
  href: string;
};

const GF = "https://fonts.googleapis.com/css2?";

export const FONT_PRESETS: Record<FontPresetKey, FontPreset> = {
  classic: {
    label: "Klasik",
    display: '"Cormorant Garamond", Georgia, serif',
    body: '"Nunito Sans", system-ui, sans-serif',
    href: `${GF}family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Nunito+Sans:wght@400;600;700&display=swap`,
  },
  script: {
    label: "Skrip",
    display: '"Great Vibes", "Brush Script MT", cursive',
    body: '"EB Garamond", Georgia, serif',
    href: `${GF}family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap`,
  },
  modern: {
    label: "Moden",
    display: '"Playfair Display", Georgia, serif',
    body: "Lora, Georgia, serif",
    href: `${GF}family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap`,
  },
  minimal: {
    label: "Minimal",
    display: "Fraunces, Georgia, serif",
    body: "Fraunces, Georgia, serif",
    href: `${GF}family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap`,
  },
  jawi: {
    label: "Jawi/Arab",
    display: 'Amiri, "Times New Roman", serif',
    body: 'Amiri, "Times New Roman", serif',
    href: `${GF}family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
  },
};

export const DEFAULT_COLOR_PRESET: ColorPresetKey = "blush";
export const DEFAULT_FONT_PRESET: FontPresetKey = "classic";

function isColorKey(key: string): key is ColorPresetKey {
  return (COLOR_PRESET_KEYS as readonly string[]).includes(key);
}
function isFontKey(key: string): key is FontPresetKey {
  return (FONT_PRESET_KEYS as readonly string[]).includes(key);
}

/** Unknown keys fall back to the default so a stale row never breaks the card. */
export function colorPresetKey(key: string): ColorPresetKey {
  return isColorKey(key) ? key : DEFAULT_COLOR_PRESET;
}
export function fontPresetKey(key: string): FontPresetKey {
  return isFontKey(key) ? key : DEFAULT_FONT_PRESET;
}
export function colorPreset(key: string): ColorPreset {
  return COLOR_PRESETS[colorPresetKey(key)];
}
export function fontPreset(key: string): FontPreset {
  return FONT_PRESETS[fontPresetKey(key)];
}
