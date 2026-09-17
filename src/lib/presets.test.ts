import { describe, expect, it } from "vitest";
import { COLOR_PRESET_KEYS, COLOR_PRESETS, textAccent } from "./presets";

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [0, 1, 2].map((i) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Guards the docs/05 promise ("ink on bg ≥ 7:1 for every preset") and the derived
// accent used for headings, eyebrows and filled buttons (AA body text: 4.5:1).
describe("colour presets", () => {
  for (const key of COLOR_PRESET_KEYS) {
    const c = COLOR_PRESETS[key];
    it(`${key}: ink on bg ≥ 7:1, accent text on bg ≥ 4.5:1, bg on accent fill ≥ 4.5:1`, () => {
      expect(contrast(c.ink, c.bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(textAccent(c), c.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.bg, textAccent(c))).toBeGreaterThanOrEqual(4.5);
    });
  }
});
