"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { PETAL_DENSITIES, type PetalDensityKey, type PetalStyleKey } from "@/lib/presets";

// Petals fall once: the shower or storm released by the tap that opens the
// card, or the smaller burst for a confirmed RSVP. Each petal is two elements
// animating transform and opacity only, so the fall stays on the compositor,
// and the layer removes itself once the last petal has left so nothing keeps
// running while the guest reads. Not rendered under prefers-reduced-motion.
export type PetalMode = "shower" | "burst" | "storm";
export type PetalOptions = { style: PetalStyleKey; density: PetalDensityKey };

type Range = readonly [number, number];
type Preset = { count: number; size: Range; fall: Range; delay: Range; wind?: Range };
const PRESETS: Record<PetalMode, Preset> = {
  shower: { count: 24, size: [9, 15], fall: [5, 8], delay: [0, 3] },
  burst: { count: 14, size: [9, 15], fall: [4, 6], delay: [0, 1.2] },
  // A gust from the left: dense, fast, blown across the layer's width (cqw).
  storm: { count: 70, size: [8, 18], fall: [1.3, 2.3], delay: [0, 1.1], wind: [35, 75] },
};

type Shape = "petal" | "leaf" | "blossom";
type Petal = { id: number; shape: Shape; style: CSSProperties };

const between = ([min, max]: Range) => min + Math.random() * (max - min);

function shapeFor(style: PetalStyleKey, i: number): Shape {
  return style === "mix" ? (i % 5 === 4 ? "leaf" : "petal") : style;
}

function makePetals(mode: PetalMode, { style, density }: PetalOptions): Petal[] {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return [];
  const p = PRESETS[mode];
  const count = Math.round(p.count * PETAL_DENSITIES[density].factor);
  return Array.from({ length: count }, (_, i) => {
    const shape = shapeFor(style, i);
    return {
      id: i,
      shape,
      style: {
        // Storm petals also start off the left edge so the gust crosses the whole screen.
        "--x": `${between(p.wind ? [-30, 85] : [2, 96]).toFixed(1)}%`,
        "--size": `${between(p.size).toFixed(0)}px`,
        "--fall": `${between(p.fall).toFixed(2)}s`,
        "--delay": `${between(p.delay).toFixed(2)}s`,
        "--sway": `${between([2.2, 3.4]).toFixed(2)}s`,
        "--drift": `${between([16, 40]).toFixed(0)}px`,
        "--wind": `${p.wind ? between(p.wind).toFixed(0) : 0}cqw`,
        "--turn": `${((Math.random() < 0.5 ? -1 : 1) * between([120, 300])).toFixed(0)}deg`,
        // Two opacities alternate so the fall has depth; leaves sit between them.
        "--o": shape === "leaf" ? 0.75 : i % 2 ? 0.55 : 0.9,
      } as CSSProperties,
    };
  });
}

/** When the slowest, latest petal has left the screen. */
const lifetimeMs = ({ fall, delay }: Preset) => (fall[1] + delay[1]) * 1000 + 250;

// Inline SVG so the shapes take the theme colours through currentColor.
function PetalShape({ shape }: { shape: Shape }) {
  if (shape === "leaf") {
    return (
      <svg className="card__petal-shape card__petal-shape--leaf" viewBox="0 0 26 12" focusable="false">
        <path d="M0 6C6 0 20 0 26 6 20 12 6 12 0 6Z" />
      </svg>
    );
  }
  if (shape === "blossom") {
    return (
      <svg className="card__petal-shape card__petal-shape--blossom" viewBox="0 0 20 20" focusable="false">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="10" cy="4.6" rx="3.3" ry="4.6" transform={`rotate(${a} 10 10)`} />
        ))}
        <circle className="card__petal-eye" cx="10" cy="10" r="2.1" />
      </svg>
    );
  }
  return (
    <svg className="card__petal-shape" viewBox="0 0 20 26" focusable="false">
      <path d="M10 0C15 7 20 12 20 17 20 22 15.5 26 10 26 4.5 26 0 22 0 17 0 12 5 7 10 0Z" />
    </svg>
  );
}

export function Petals({ mode, options }: { mode: PetalMode; options: PetalOptions }) {
  const [petals, setPetals] = useState(() => makePetals(mode, options));

  useEffect(() => {
    const t = window.setTimeout(() => setPetals([]), lifetimeMs(PRESETS[mode]));
    return () => window.clearTimeout(t);
  }, [mode]);

  if (petals.length === 0) return null;
  return (
    <div className={`card__petals card__petals--${mode}`} aria-hidden="true">
      {petals.map((p) => (
        <span key={p.id} className={`card__petal card__petal--${p.shape}`} style={p.style}>
          <PetalShape shape={p.shape} />
        </span>
      ))}
    </div>
  );
}
