// The seven floral compositions (docs/05 "Floral themes") as data: a TypeScript
// port of assets/gen.js, the generator that produced assets/florals/*.svg. Same
// geometry and colours as the files. Florals.tsx renders these; CardMotion reads
// the bloom positions for the petal_fall scatter.
import type { FloralPresetKey } from "@/lib/presets";

export const COVER_W = 390;
export const COVER_H = 844;

export type Pal4 = readonly [string, string, string, string];
export type Pal3 = readonly [string, string, string];

export type Piece =
  | { kind: "peony"; x: number; y: number; size: number; pal: Pal4; opacity?: number }
  | { kind: "bud"; x: number; y: number; size: number; pal: Pal3 }
  | { kind: "leaf"; x: number; y: number; l: number; w: number; angle: number; c: string; vein: string }
  | { kind: "eucalyptus"; x1: number; y1: number; x2: number; y2: number; cx: number; cy: number; n: number; c1: string; c2: string }
  | { kind: "fern"; x: number; y: number; len: number; angle: number; c: string }
  | { kind: "wisteria"; x: number; y: number; len: number; c1: string; c2: string; c3: string; sway: number }
  | { kind: "lineFlower"; x: number; y: number; size: number; c: string; n: number }
  | { kind: "lineStem"; x: number; y: number; len: number; angle: number; c: string }
  | { kind: "lattice"; x: number; y: number; w: number; h: number; cell: number; c: string }
  | { kind: "tanjung"; x: number; y: number; r: number; c1: string; c2: string }
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx: number; c: string; sw: number; opacity?: number }
  | { kind: "path"; d: string; c: string; sw: number; opacity?: number; box: Box }
  | { kind: "faded"; opacity: number; pieces: Piece[] };

export type Anchor = "tl" | "br" | "top" | "bottom";
export type Cluster = {
  id: string;
  pieces: Piece[];
  opacity?: number;
  /** Where the cluster sits behind the card header. Omitted: the cover only. */
  anchor?: Anchor;
  /** Washes, lattice, frame: background art whose blooms never scatter. */
  decor?: boolean;
};
export type Composition = { cover: Cluster[]; card: Cluster[] };
export type Box = { x: number; y: number; w: number; h: number };

const P = {
  blush: ["#F1C9C6", "#E4A9AB", "#D48E93", "#B9727A"] as const,
  cream: ["#F7E7DC", "#EFD3C4", "#E6B9A8", "#C99785"] as const,
  sage: "#9DB19A",
  sageDeep: "#7C9279",
  sageLight: "#C2D0BD",
};

const peony = (x: number, y: number, size: number, pal: Pal4, opacity?: number): Piece => ({ kind: "peony", x, y, size, pal, opacity });
const bud = (x: number, y: number, size: number, pal: Pal3): Piece => ({ kind: "bud", x, y, size, pal });
const leaf = (x: number, y: number, l: number, w: number, angle: number, c: string, vein: string): Piece => ({ kind: "leaf", x, y, l, w, angle, c, vein });
const eucalyptus = (x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, n: number, c1: string, c2: string): Piece => ({ kind: "eucalyptus", x1, y1, x2, y2, cx, cy, n, c1, c2 });
const fern = (x: number, y: number, len: number, angle: number, c: string): Piece => ({ kind: "fern", x, y, len, angle, c });
const wisteria = (x: number, y: number, len: number, c1: string, c2: string, c3: string, sway: number): Piece => ({ kind: "wisteria", x, y, len, c1, c2, c3, sway });
const lineFlower = (x: number, y: number, size: number, c: string, n = 7): Piece => ({ kind: "lineFlower", x, y, size, c, n });
const lineStem = (x: number, y: number, len: number, angle: number, c: string): Piece => ({ kind: "lineStem", x, y, len, angle, c });
const lattice = (x: number, y: number, w: number, h: number, cell: number, c: string): Piece => ({ kind: "lattice", x, y, w, h, cell, c });
const tanjung = (x: number, y: number, r: number, c1: string, c2: string): Piece => ({ kind: "tanjung", x, y, r, c1, c2 });

function peonyCorners(): Composition {
  const tl: Cluster = {
    id: "corner-tl",
    anchor: "tl",
    pieces: [
      fern(20, 180, 120, -35, P.sageDeep),
      fern(70, 30, 110, 160, P.sage),
      eucalyptus(0, 140, 150, 20, 60, 60, 9, P.sageLight, P.sage),
      leaf(30, 120, 70, 22, -60, P.sage, P.sageDeep),
      leaf(110, 40, 60, 20, 200, P.sageDeep, P.sageLight),
      leaf(150, 90, 50, 16, 120, P.sageLight, P.sage),
      peony(40, 70, 62, P.blush),
      peony(120, 25, 44, P.cream),
      peony(10, 150, 38, P.blush),
      bud(160, 60, 18, [P.blush[1], P.blush[2], P.sage]),
      bud(85, 145, 16, [P.cream[1], P.cream[2], P.sageDeep]),
    ],
  };
  const br: Cluster = {
    id: "corner-br",
    anchor: "br",
    pieces: [
      fern(370, 660, 120, 145, P.sageDeep),
      fern(330, 830, 110, -20, P.sage),
      eucalyptus(390, 700, 240, 830, 330, 790, 9, P.sageLight, P.sage),
      leaf(360, 730, 70, 22, 120, P.sage, P.sageDeep),
      leaf(280, 810, 60, 20, 20, P.sageDeep, P.sageLight),
      leaf(250, 760, 50, 16, -60, P.sageLight, P.sage),
      peony(350, 780, 62, P.blush),
      peony(270, 825, 44, P.cream),
      peony(385, 700, 38, P.blush),
      bud(230, 790, 18, [P.blush[1], P.blush[2], P.sage]),
      bud(310, 705, 16, [P.cream[1], P.cream[2], P.sageDeep]),
    ],
  };
  return { cover: [tl, br], card: [tl, br] };
}

function eveningGarden(): Composition {
  const rose: Pal4 = ["#F3D2CF", "#E7B4B6", "#D9979C", "#B47C86"];
  const budPal: Pal3 = ["#E7B4B6", "#D9979C", "#8FA48B"];
  const top: Cluster = {
    id: "top",
    anchor: "top",
    pieces: [
      eucalyptus(-10, 60, 200, -10, 80, 90, 12, "#8FA48B", "#6F8A72"),
      eucalyptus(400, 60, 190, -10, 300, 100, 12, "#8FA48B", "#6F8A72"),
      fern(40, 240, 150, -30, "#7E9479"),
      fern(350, 240, 150, 30, "#7E9479"),
      leaf(60, 90, 80, 26, -50, "#6F8A72", "#B9C9B4"),
      leaf(330, 90, 80, 26, 50, "#6F8A72", "#B9C9B4"),
      leaf(20, 190, 60, 18, -80, "#8FA48B", "#B9C9B4"),
      leaf(370, 190, 60, 18, 80, "#8FA48B", "#B9C9B4"),
      peony(28, 110, 58, rose),
      peony(362, 110, 58, rose),
      peony(95, 35, 42, P.cream),
      peony(295, 35, 42, P.cream),
      bud(140, 80, 17, budPal),
      bud(250, 80, 17, budPal),
    ],
  };
  const bottom: Cluster = {
    id: "bottom",
    anchor: "bottom",
    pieces: [
      eucalyptus(-10, 800, 160, 844, 60, 760, 8, "#8FA48B", "#6F8A72"),
      eucalyptus(400, 800, 230, 844, 330, 760, 8, "#8FA48B", "#6F8A72"),
      peony(20, 810, 48, rose),
      peony(370, 810, 48, rose),
      leaf(80, 830, 70, 22, -10, "#6F8A72", "#B9C9B4"),
      leaf(310, 830, 70, 22, 10, "#6F8A72", "#B9C9B4"),
    ],
  };
  return { cover: [top, bottom], card: [top, bottom] };
}

function wreath(): Composition {
  const cx = 195;
  const cy = 390;
  const rx = 150;
  const ry = 190;
  const pieces: Piece[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const deg = (a * 180) / Math.PI;
    pieces.push(leaf(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 26 + (i % 3) * 8, 8 + (i % 2) * 3, deg + 90 + (i % 2 ? 25 : -25), i % 2 ? P.sage : P.sageLight, P.sageDeep));
  }
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + 0.1;
    const deg = (a * 180) / Math.PI;
    pieces.push(leaf(cx + Math.cos(a) * (rx + 6), cy + Math.sin(a) * (ry + 6), 22, 7, deg + 90 + (i % 2 ? -40 : 40), P.sageDeep, P.sageLight));
  }
  const ring: Piece = {
    kind: "path",
    d: `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`,
    c: P.sageDeep,
    sw: 1.2,
    opacity: 0.6,
    box: { x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2 },
  };
  const blooms: Array<[number, number, number, Pal4]> = [
    [cx - 110, cy - 150, 44, P.blush],
    [cx + 120, cy - 140, 36, P.cream],
    [cx + 150, cy + 40, 46, P.blush],
    [cx - 150, cy + 60, 34, P.cream],
    [cx - 40, cy + 190, 42, P.blush],
    [cx + 80, cy + 185, 30, P.cream],
    [cx + 30, cy - 192, 28, P.blush],
  ];
  for (const [x, y, s, pal] of blooms) pieces.push(peony(x, y, s, pal));
  for (const [x, y] of [[cx - 155, cy - 40], [cx + 155, cy - 60], [cx - 100, cy + 160], [cx + 130, cy + 130], [cx + 90, cy - 185], [cx - 60, cy - 190]]) {
    pieces.push(bud(x, y, 15, [P.blush[1], P.blush[2], P.sage]));
  }
  // The card body reuses only the top and bottom arcs.
  const yOf = (p: Piece) => ("y" in p ? p.y : cy);
  return {
    cover: [{ id: "wreath", pieces: [...pieces, ring] }],
    card: [
      { id: "wreath-top", anchor: "top", pieces: pieces.filter((p) => yOf(p) < cy - 110) },
      { id: "wreath-bottom", anchor: "bottom", pieces: pieces.filter((p) => yOf(p) > cy + 110) },
    ],
  };
}

function wisteriaCurtain(): Composition {
  const xs = [8, 45, 85, 125, 165, 205, 245, 285, 325, 365, 395];
  const lens = [300, 180, 240, 140, 210, 120, 230, 150, 260, 190, 300];
  const top: Cluster = {
    id: "vine-top",
    anchor: "top",
    pieces: [
      { kind: "path", d: "M-20,-10 Q195,60 410,-10", c: "#7C9279", sw: 2, box: { x: -20, y: -10, w: 430, h: 40 } },
      ...xs.map((x, i) => wisteria(x, 10 + (i % 2) * 10, lens[i], i % 2 ? "#D9B3D1" : "#E7C6DA", i % 3 ? "#C9A0C4" : "#DEB9D6", "#8C9B84", i % 2 ? 12 : -12)),
      ...Array.from({ length: 10 }, (_, i) => leaf(20 + i * 40, 20 + (i % 2) * 14, 34, 10, 150 + (i % 2) * 60, i % 2 ? "#9DB19A" : "#7C9279", "#C2D0BD")),
    ],
  };
  const lilac: Pal4 = ["#E7C6DA", "#D9B3D1", "#C9A0C4", "#8F6F8C"];
  const bottom: Cluster = {
    id: "bottom",
    anchor: "bottom",
    opacity: 0.9,
    pieces: [eucalyptus(-10, 780, 140, 844, 60, 760, 7, "#C2D0BD", "#9DB19A"), eucalyptus(400, 780, 250, 844, 330, 760, 7, "#C2D0BD", "#9DB19A"), peony(30, 815, 40, lilac), peony(360, 815, 40, lilac)],
  };
  return { cover: [top, bottom], card: [top, bottom] };
}

function songket(): Composition {
  const gold = "#C9A46A";
  const top: Cluster = {
    id: "top",
    anchor: "top",
    pieces: [peony(60, 165, 40, P.blush), peony(330, 165, 40, P.blush), peony(195, 140, 30, P.cream), leaf(95, 150, 40, 12, 240, P.sage, P.sageDeep), leaf(295, 150, 40, 12, 120, P.sage, P.sageDeep), leaf(160, 150, 30, 9, 200, P.sageDeep, P.sageLight), leaf(230, 150, 30, 9, 160, P.sageDeep, P.sageLight)],
  };
  const bottom: Cluster = {
    id: "bottom",
    anchor: "bottom",
    pieces: [peony(60, 680, 40, P.blush), peony(330, 680, 40, P.blush), peony(195, 706, 30, P.cream), leaf(95, 690, 40, 12, 60, P.sage, P.sageDeep), leaf(295, 690, 40, 12, -60, P.sage, P.sageDeep)],
  };
  return {
    cover: [
      { id: "lattice-top", decor: true, pieces: [lattice(0, 0, 390, 110, 26, gold)] },
      { id: "lattice-bottom", decor: true, pieces: [lattice(0, 734, 390, 110, 26, gold)] },
      {
        id: "frame",
        decor: true,
        pieces: [
          { kind: "rect", x: 24, y: 130, w: 342, h: 584, rx: 6, c: gold, sw: 1 },
          { kind: "rect", x: 30, y: 136, w: 330, h: 572, rx: 4, c: gold, sw: 0.6, opacity: 0.7 },
          tanjung(24, 130, 14, gold, "#B9727A"),
          tanjung(366, 130, 14, gold, "#B9727A"),
          tanjung(24, 714, 14, gold, "#B9727A"),
          tanjung(366, 714, 14, gold, "#B9727A"),
        ],
      },
      top,
      bottom,
    ],
    card: [top, bottom],
  };
}

function lineArt(): Composition {
  const top: Cluster = {
    id: "top",
    anchor: "top",
    pieces: [
      lineStem(60, 300, 260, -12, "#7C9279"),
      lineStem(330, 300, 260, 12, "#7C9279"),
      lineStem(20, 220, 160, -40, "#9DB19A"),
      lineStem(370, 220, 160, 40, "#9DB19A"),
      lineFlower(70, 70, 42, "#B9727A"),
      lineFlower(140, 40, 26, "#C48E93", 6),
      lineFlower(320, 80, 46, "#B9727A"),
      lineFlower(255, 40, 22, "#C48E93", 6),
      { kind: "faded", opacity: 0.55, pieces: [peony(70, 70, 34, P.blush, 0.5), peony(320, 80, 38, P.blush, 0.5)] },
    ],
  };
  const bottom: Cluster = {
    id: "bottom",
    anchor: "bottom",
    pieces: [lineStem(80, 790, 180, 150, "#7C9279"), lineStem(310, 790, 180, -150, "#7C9279"), lineFlower(60, 790, 40, "#B9727A"), lineFlower(330, 790, 40, "#B9727A"), lineFlower(195, 815, 26, "#C48E93", 6)],
  };
  return { cover: [top, bottom], card: [top, bottom] };
}

function watercolor(): Composition {
  const wash: Pal4 = ["#F3C9C7", "#EAAFB2", "#DD949B", "#C07C86"];
  const top: Cluster = { id: "top", anchor: "tl", pieces: [eucalyptus(-10, 260, 220, 40, 120, 120, 12, "#C2D0BD", "#9DB19A"), leaf(40, 230, 90, 28, -45, "#9DB19A", "#C2D0BD"), peony(40, 170, 52, P.blush)] };
  const bottom: Cluster = { id: "bottom", anchor: "br", pieces: [eucalyptus(400, 600, 170, 820, 300, 700, 12, "#C2D0BD", "#9DB19A"), leaf(350, 620, 90, 28, 135, "#9DB19A", "#C2D0BD"), peony(350, 680, 52, P.blush)] };
  return {
    cover: [
      { id: "washes", decor: true, opacity: 0.55, pieces: [peony(-10, 120, 150, wash), peony(400, 720, 160, wash)] },
      { id: "washes-cream", decor: true, opacity: 0.7, pieces: [peony(120, 40, 70, P.cream), peony(300, 800, 74, P.cream)] },
      top,
      bottom,
    ],
    card: [top, bottom],
  };
}

const BUILDERS: Record<FloralPresetKey, () => Composition> = {
  peony_corners: peonyCorners,
  evening_garden: eveningGarden,
  wreath,
  wisteria: wisteriaCurtain,
  songket,
  line_art: lineArt,
  watercolor,
};

const cache = new Map<FloralPresetKey, Composition>();
export function composition(preset: FloralPresetKey): Composition {
  let c = cache.get(preset);
  if (!c) {
    c = BUILDERS[preset]();
    cache.set(preset, c);
  }
  return c;
}

/** Centres of the blooms in the cover, as fractions of the cover, for the petal_fall scatter. */
export function coverBlooms(preset: FloralPresetKey): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  const walk = (pieces: Piece[]) => {
    for (const p of pieces) {
      if (p.kind === "faded") walk(p.pieces);
      else if (p.kind === "peony" || p.kind === "bud") out.push({ x: p.x / COVER_W, y: p.y / COVER_H });
    }
  };
  for (const c of composition(preset).cover) if (!c.decor) walk(c.pieces);
  return out;
}

/** Rough bounding box of a cluster, for the card body's viewBox. Generous rather than exact. */
export function clusterBox(cluster: Cluster): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x: number, y: number, r: number) => {
    minX = Math.min(minX, x - r);
    minY = Math.min(minY, y - r);
    maxX = Math.max(maxX, x + r);
    maxY = Math.max(maxY, y + r);
  };
  const tip = (x: number, y: number, len: number, angle: number, pad: number) => {
    const a = (angle * Math.PI) / 180;
    add(x, y, pad);
    add(x + len * Math.sin(a), y - len * Math.cos(a), pad);
  };
  const walk = (pieces: Piece[]) => {
    for (const p of pieces) {
      switch (p.kind) {
        case "peony":
          add(p.x, p.y, p.size * 1.05);
          break;
        case "bud":
          add(p.x, p.y, p.size * 1.3);
          break;
        case "leaf":
          tip(p.x, p.y, p.l, p.angle, p.w);
          break;
        case "eucalyptus":
          add(p.x1, p.y1, 8);
          add(p.x2, p.y2, 8);
          add(p.cx, p.cy, 8);
          break;
        case "fern":
          tip(p.x, p.y, p.len, p.angle, 16);
          break;
        case "wisteria":
          add(p.x, p.y, 20);
          add(p.x, p.y + p.len, 20);
          break;
        case "lineFlower":
          add(p.x, p.y, p.size * 1.1);
          break;
        case "lineStem":
          tip(p.x, p.y, p.len, p.angle, 14);
          break;
        case "lattice":
        case "rect":
          add(p.x, p.y, 0);
          add(p.x + p.w, p.y + p.h, 0);
          break;
        case "tanjung":
          add(p.x, p.y, p.r);
          break;
        case "path":
          add(p.box.x, p.box.y, 0);
          add(p.box.x + p.box.w, p.box.y + p.box.h, 0);
          break;
        case "faded":
          walk(p.pieces);
          break;
      }
    }
  };
  walk(cluster.pieces);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Bounding box of a quadratic curve plus a margin, in the curve's own coordinates. */
export function quadBox(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, pad: number): Box {
  const axis = (p0: number, p1: number, p2: number) => {
    const vals = [p0, p2];
    const d = p0 - 2 * p1 + p2;
    if (d !== 0) {
      const t = (p0 - p1) / d;
      if (t > 0 && t < 1) vals.push((1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2);
    }
    return [Math.min(...vals) - pad, Math.max(...vals) + pad];
  };
  const [xa, xb] = axis(x1, cx, x2);
  const [ya, yb] = axis(y1, cy, y2);
  return { x: xa, y: ya, w: xb - xa, h: yb - ya };
}
