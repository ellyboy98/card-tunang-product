// Renders the floral compositions from florals.ts as inline SVG so the wind and
// entrance animations can target the groups. Every swaying group is wrapped in a
// positioning <g> that carries the SVG transform attribute, so the CSS transform
// the animations set never overwrites the placement. The wind variables are
// seeded from the element index (golden ratio), so neighbours are never in phase
// and the server and client render the same markup.
import type { CSSProperties, ReactNode } from "react";
import type { FloralPresetKey } from "@/lib/presets";
import { clusterBox, composition, COVER_H, COVER_W, quadBox, type Cluster, type Pal4, type Piece } from "./florals";

type WindKind = "bloom" | "leaf" | "vine";
type Ctx = { i: number };

const PHI = 0.6180339887;
const fract = (v: number) => v - Math.floor(v);
const f = (v: number) => String(Math.round(v * 100) / 100);
const SWAY_PERIOD: Record<WindKind, [number, number]> = { vine: [5, 7], leaf: [3, 4.5], bloom: [6, 8] };

function wind(ctx: Ctx, kind: WindKind, x: number, origin: string) {
  const i = ctx.i++;
  const [lo, hi] = SWAY_PERIOD[kind];
  const dur = lo + fract(i * PHI) * (hi - lo);
  // The gust travels left to right: delay follows the element's horizontal position.
  const gust = Math.round(Math.min(1, Math.max(0, x / COVER_W)) * 600);
  const style = {
    "--i": i,
    "--sway-dur": `${dur.toFixed(2)}s`,
    "--sway-delay": `-${(fract((i + 7) * PHI) * dur).toFixed(2)}s`,
    "--gust-delay": `${gust}ms`,
    transformOrigin: origin,
  } as CSSProperties;
  return { "data-wind": kind, style };
}

const petalPath = (r: number, w = 0.5) => `M0,0 C${f(-w * r)},${f(-0.35 * r)} ${f(-w * r)},${f(-0.85 * r)} 0,${f(-r)} C${f(w * r)},${f(-0.85 * r)} ${f(w * r)},${f(-0.35 * r)} 0,0 Z`;
const leafPath = (l: number, w: number) => `M0,0 C${f(-w)},${f(-l * 0.3)} ${f(-w)},${f(-l * 0.75)} 0,${f(-l)} C${f(w)},${f(-l * 0.75)} ${f(w)},${f(-l * 0.3)} 0,0 Z`;

const RINGS = [
  { n: 9, r: 1, w: 0.62, ci: 0, o: 0.92, off: 0 },
  { n: 8, r: 0.74, w: 0.66, ci: 1, o: 0.95, off: 20 },
  { n: 6, r: 0.5, w: 0.7, ci: 2, o: 1, off: 8 },
  { n: 5, r: 0.3, w: 0.75, ci: 1, o: 1, off: 35 },
] as const;

function peonyInner(size: number, pal: Pal4): ReactNode[] {
  const out: ReactNode[] = [];
  RINGS.forEach((ring, ri) => {
    const r = size * ring.r;
    for (let i = 0; i < ring.n; i++) {
      const a = ring.off + i * (360 / ring.n) + (i % 2) * 4;
      out.push(
        <g key={`${ri}-${i}`} className="petal" transform={`rotate(${f(a)})`}>
          <path d={petalPath(r, ring.w)} fill={pal[ring.ci]} opacity={ring.o} />
          <path d={`M0,0 L0,${f(-r * 0.78)}`} stroke="#ffffff" strokeOpacity={0.22} strokeWidth={f(size * 0.02)} />
        </g>,
      );
    }
  });
  out.push(<circle key="c" r={f(size * 0.09)} fill={pal[3]} />);
  for (let i = 0; i < 7; i++) {
    const a = (i * 51 * Math.PI) / 180;
    out.push(<circle key={`d${i}`} cx={f(Math.cos(a) * size * 0.13)} cy={f(Math.sin(a) * size * 0.13)} r={f(size * 0.035)} fill={pal[3]} opacity={0.8} />);
  }
  return out;
}

function renderPiece(p: Piece, ctx: Ctx, key: number): ReactNode {
  switch (p.kind) {
    case "peony":
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)})`}>
          <g className="bloom" {...wind(ctx, "bloom", p.x, "50% 50%")} opacity={p.opacity}>
            {peonyInner(p.size, p.pal)}
          </g>
        </g>
      );
    case "bud":
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)})`}>
          <g className="bud" {...wind(ctx, "bloom", p.x, "50% 50%")}>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`rotate(${-30 + i * 15})`}>
                <path d={petalPath(p.size, 0.45)} fill={p.pal[i % 2]} opacity={0.95} />
              </g>
            ))}
            <path d={leafPath(p.size * 0.9, p.size * 0.28)} transform="rotate(150)" fill={p.pal[2]} />
            <path d={leafPath(p.size * 0.9, p.size * 0.28)} transform="rotate(210)" fill={p.pal[2]} />
          </g>
        </g>
      );
    case "leaf":
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)}) rotate(${f(p.angle)})`}>
          <g className="leaf" {...wind(ctx, "leaf", p.x, "50% 100%")}>
            <path d={leafPath(p.l, p.w)} fill={p.c} />
            <path d={`M0,0 L0,${f(-p.l * 0.9)}`} stroke={p.vein} strokeWidth={1} strokeOpacity={0.5} />
          </g>
        </g>
      );
    case "eucalyptus": {
      const box = quadBox(p.x1, p.y1, p.cx, p.cy, p.x2, p.y2, 8);
      const origin = `${(((p.x1 - box.x) / box.w) * 100).toFixed(1)}% ${(((p.y1 - box.y) / box.h) * 100).toFixed(1)}%`;
      const vine = wind(ctx, "vine", p.x1, origin);
      const leaves: ReactNode[] = [];
      for (let i = 1; i <= p.n; i++) {
        const t = i / (p.n + 1);
        const x = (1 - t) * (1 - t) * p.x1 + 2 * (1 - t) * t * p.cx + t * t * p.x2;
        const y = (1 - t) * (1 - t) * p.y1 + 2 * (1 - t) * t * p.cy + t * t * p.y2;
        const side = i % 2 ? 1 : -1;
        const r = 7 - t * 2.5;
        leaves.push(<ellipse key={i} className="leaf" {...wind(ctx, "leaf", x, "50% 100%")} cx={f(x + side * r * 0.9)} cy={f(y)} rx={f(r)} ry={f(r * 0.85)} fill={i % 3 ? p.c1 : p.c2} opacity={0.9} />);
      }
      return (
        <g key={key} className="vine" {...vine}>
          <path d={`M${f(p.x1)},${f(p.y1)} Q${f(p.cx)},${f(p.cy)} ${f(p.x2)},${f(p.y2)}`} stroke={p.c2} strokeWidth={1.4} fill="none" />
          {leaves}
        </g>
      );
    }
    case "fern": {
      const n = Math.floor(p.len / 9);
      const fronds: ReactNode[] = [];
      for (let i = 1; i < n; i++) {
        const yy = -i * 9;
        const l = Math.max(4, (1 - i / n) * 16);
        fronds.push(<path key={`l${i}`} d={`M0,${yy} q${f(-l * 0.6)},${f(-l * 0.35)} ${f(-l)},${f(-l * 0.1)}`} stroke={p.c} strokeWidth={1.1} fill="none" />);
        fronds.push(<path key={`r${i}`} d={`M0,${yy} q${f(l * 0.6)},${f(-l * 0.35)} ${f(l)},${f(-l * 0.1)}`} stroke={p.c} strokeWidth={1.1} fill="none" />);
      }
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)}) rotate(${f(p.angle)})`}>
          <g className="fern" {...wind(ctx, "vine", p.x, "50% 100%")}>
            <path d={`M0,0 L0,${f(-p.len)}`} stroke={p.c} strokeWidth={1.2} />
            {fronds}
          </g>
        </g>
      );
    }
    case "wisteria": {
      const n = Math.floor(p.len / 7);
      const petals: ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const yy = t * p.len;
        const xx = p.sway * 2 * t * (1 - t);
        const w = (1 - t) * 14 + 3;
        const side = i % 2 ? 1 : -1;
        const px = xx + side * w * 0.6;
        petals.push(<ellipse key={i} className="petal" cx={f(px)} cy={f(yy)} rx={f(w * 0.55)} ry={f(w * 0.38)} transform={`rotate(${side * 35} ${f(px)} ${f(yy)})`} fill={i % 3 === 0 ? p.c1 : p.c2} opacity={(0.95 - t * 0.25).toFixed(2)} />);
        if (i % 5 === 0) {
          const qx = xx - side * w * 0.5;
          petals.push(<ellipse key={`q${i}`} className="petal" cx={f(qx)} cy={f(yy + 3)} rx={f(w * 0.5)} ry={f(w * 0.33)} transform={`rotate(${-side * 30} ${f(qx)} ${f(yy + 3)})`} fill={p.c1} opacity={0.85} />);
        }
      }
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)})`}>
          <g className="wisteria" {...wind(ctx, "vine", p.x, "50% 0%")}>
            <path d={`M0,0 q${f(p.sway)},${f(p.len * 0.5)} 0,${f(p.len)}`} stroke={p.c3} strokeWidth={1.2} fill="none" opacity={0.8} />
            {petals}
          </g>
        </g>
      );
    }
    case "lineFlower": {
      const step = 360 / p.n;
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)})`}>
          <g className="line-bloom" {...wind(ctx, "bloom", p.x, "50% 50%")} fill="none" stroke={p.c} strokeWidth={1.1}>
            {Array.from({ length: p.n }, (_, i) => (
              <g key={`o${i}`} transform={`rotate(${f(i * step)})`}>
                <path d={petalPath(p.size, 0.55)} />
              </g>
            ))}
            {Array.from({ length: p.n }, (_, i) => (
              <g key={`i${i}`} transform={`rotate(${f(i * step + step / 2)})`}>
                <path d={petalPath(p.size * 0.55, 0.6)} />
              </g>
            ))}
            <circle r={f(p.size * 0.12)} />
            <circle r={f(p.size * 0.04)} fill={p.c} />
          </g>
        </g>
      );
    }
    case "lineStem": {
      const n = Math.floor(p.len / 16);
      const leaves: ReactNode[] = [];
      for (let i = 1; i <= n; i++) {
        const yy = -i * 16 + 6;
        const l = 12 - (i / n) * 4;
        leaves.push(<path key={`l${i}`} d={`M0,${yy} c-8,-3 ${f(-l)},${f(-l * 0.8)} ${f(-l * 0.6)},${f(-l * 1.3)} c${f(l * 0.5)},${f(l * 0.2)} ${f(l * 0.6)},${f(l * 0.9)} ${f(l * 0.6)},${f(l * 1.3)}`} />);
        leaves.push(<path key={`r${i}`} d={`M0,${yy - 8} c8,-3 ${f(l)},${f(-l * 0.8)} ${f(l * 0.6)},${f(-l * 1.3)} c${f(-l * 0.5)},${f(l * 0.2)} ${f(-l * 0.6)},${f(l * 0.9)} ${f(-l * 0.6)},${f(l * 1.3)}`} />);
      }
      return (
        <g key={key} transform={`translate(${f(p.x)},${f(p.y)}) rotate(${f(p.angle)})`}>
          <g className="line-stem" {...wind(ctx, "vine", p.x, "50% 100%")} fill="none" stroke={p.c} strokeWidth={1.1}>
            <path d={`M0,0 q6,${f(-p.len * 0.5)} 0,${f(-p.len)}`} />
            {leaves}
          </g>
        </g>
      );
    }
    case "lattice": {
      const cells: ReactNode[] = [];
      const half = p.cell / 2;
      for (let x = 0; x <= p.w + p.cell; x += p.cell) {
        for (let y = 0; y <= p.h + p.cell; y += p.cell) {
          cells.push(<path key={`p${x}-${y}`} d={`M${x},${y - half} L${x + half},${y} L${x},${y + half} L${x - half},${y} Z`} />);
          cells.push(<circle key={`c${x}-${y}`} cx={x} cy={y} r={1.4} fill={p.c} />);
        }
      }
      return (
        <g key={key} className="lattice" transform={`translate(${f(p.x)},${f(p.y)})`} stroke={p.c} strokeWidth={0.8} fill="none" opacity={0.55}>
          {cells}
        </g>
      );
    }
    case "tanjung":
      return (
        <g key={key} className="motif" transform={`translate(${f(p.x)},${f(p.y)})`}>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 45})`}>
              <path d={`M0,0 L${f(-p.r * 0.22)},${f(-p.r * 0.55)} L0,${f(-p.r)} L${f(p.r * 0.22)},${f(-p.r * 0.55)} Z`} fill={i % 2 ? p.c1 : p.c2} />
            </g>
          ))}
          <circle r={f(p.r * 0.16)} fill={p.c2} />
        </g>
      );
    case "rect":
      return <rect key={key} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} stroke={p.c} strokeWidth={p.sw} opacity={p.opacity} fill="none" />;
    case "path":
      return <path key={key} d={p.d} stroke={p.c} strokeWidth={p.sw} opacity={p.opacity} fill="none" />;
    case "faded":
      return (
        <g key={key} opacity={p.opacity}>
          {p.pieces.map((q, i) => renderPiece(q, ctx, i))}
        </g>
      );
  }
}

function renderCluster(c: Cluster, ctx: Ctx, idPrefix: string): ReactNode {
  return (
    <g key={c.id} id={`${idPrefix}-${c.id}`} className="cluster" data-cluster={c.id} opacity={c.opacity}>
      {c.pieces.map((p, i) => renderPiece(p, ctx, i))}
    </g>
  );
}

/** The full composition behind the cover. Sized to the cover's height, centred. */
export function FloralCover({ preset }: { preset: FloralPresetKey }) {
  const ctx: Ctx = { i: 0 };
  return (
    <svg className="card__floral-cover" viewBox={`0 0 ${COVER_W} ${COVER_H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {composition(preset).cover.map((c) => renderCluster(c, ctx, "cover"))}
    </svg>
  );
}

/** The preset's corner clusters at 60 % behind the card header. One SVG per cluster, anchored by CSS. */
export function FloralClusters({ preset }: { preset: FloralPresetKey }) {
  return (
    <>
      {composition(preset).card.map((c) => {
        const b = clusterBox(c);
        return (
          <svg key={c.id} className={`card__cluster card__cluster--${c.anchor}`} viewBox={`${f(b.x)} ${f(b.y)} ${f(b.w)} ${f(b.h)}`} style={{ width: b.w * 0.6, height: b.h * 0.6 }} aria-hidden="true" focusable="false">
            {renderCluster(c, { i: 0 }, "card")}
          </svg>
        );
      })}
    </>
  );
}

// The blush rendition of each background, for the admin's thumbnail strip only.
const THUMB_BG: Record<FloralPresetKey, string> = {
  peony_corners: "#F6E7E3",
  evening_garden: "#3A2532",
  wreath: "#F7EDE7",
  wisteria: "#F3EAEE",
  songket: "#F7EFE6",
  line_art: "#FAF6F2",
  watercolor: "#FBF4F1",
};

/** Small still of the cover composition for the admin's floral picker. */
export function FloralThumb({ preset, width = 60 }: { preset: FloralPresetKey; width?: number }) {
  return (
    <svg viewBox={`0 0 ${COVER_W} ${COVER_H}`} width={width} height={Math.round((width * COVER_H) / COVER_W)} aria-hidden="true" focusable="false">
      <rect width={COVER_W} height={COVER_H} fill={THUMB_BG[preset]} />
      {composition(preset).cover.map((c) => renderCluster(c, { i: 0 }, `thumb-${preset}`))}
    </svg>
  );
}
