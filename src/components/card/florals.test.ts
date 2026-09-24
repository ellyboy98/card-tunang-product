import { describe, expect, it } from "vitest";
import { FLORAL_PRESET_KEYS } from "@/lib/presets";
import { clusterBox, composition, coverBlooms, quadBox } from "./florals";

// The compositions are a port of assets/gen.js; these guard the shape the
// renderer and CardMotion rely on, which TypeScript cannot.
describe("floral compositions", () => {
  for (const key of FLORAL_PRESET_KEYS) {
    it(`${key}: has a cover, card clusters with finite boxes, and blooms to scatter`, () => {
      const c = composition(key);
      expect(c.cover.length).toBeGreaterThan(0);
      expect(c.card.length).toBeGreaterThan(0);
      for (const cluster of c.card) {
        expect(cluster.anchor).toBeDefined();
        const b = clusterBox(cluster);
        for (const v of [b.x, b.y, b.w, b.h]) expect(Number.isFinite(v)).toBe(true);
        expect(b.w).toBeGreaterThan(0);
        expect(b.h).toBeGreaterThan(0);
      }
      const blooms = coverBlooms(key);
      expect(blooms.length).toBeGreaterThan(0);
      for (const b of blooms) {
        expect(b.x).toBeGreaterThanOrEqual(-0.1);
        expect(b.x).toBeLessThanOrEqual(1.1);
        expect(b.y).toBeGreaterThanOrEqual(-0.1);
        expect(b.y).toBeLessThanOrEqual(1.1);
      }
    });
  }

  it("wreath keeps the ring for the cover only and splits the arcs for the card", () => {
    const c = composition("wreath");
    expect(c.cover[0].pieces.some((p) => p.kind === "path")).toBe(true);
    expect(c.card.map((k) => k.anchor)).toEqual(["top", "bottom"]);
    expect(c.card.every((k) => k.pieces.every((p) => p.kind !== "path"))).toBe(true);
  });

  it("quadBox brackets the curve's extremum", () => {
    // Symmetric arc from (0,0) to (100,0) bulging to y = 50 at t = 0.5 (control at 100).
    const b = quadBox(0, 0, 50, 100, 100, 0, 0);
    expect(b.x).toBe(0);
    expect(b.w).toBe(100);
    expect(b.y).toBe(0);
    expect(b.h).toBeCloseTo(50);
  });
});
