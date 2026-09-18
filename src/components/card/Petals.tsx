"use client";

import { useEffect, useState, type CSSProperties } from "react";

// A one-time petal shower, released by the tap that opens the card. Each petal
// is two elements animating transform and opacity only, so the shower stays on
// the compositor, and the layer removes itself once the last petal has landed
// so nothing keeps running while the guest reads. Not rendered under
// prefers-reduced-motion.
const COUNT = 24;
const FALL_S = [5, 8] as const;
const DELAY_S = [0, 3] as const;
const SHOWER_MS = (FALL_S[1] + DELAY_S[1]) * 1000 + 250;

type Petal = { id: number; tone: 0 | 1 | 2; style: CSSProperties };

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

function makePetals(): Petal[] {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return [];
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    // Two accent tones, and every fifth petal a sage leaf.
    tone: i % 5 === 4 ? 2 : ((i % 2) as 0 | 1),
    style: {
      "--x": `${between([2, 96]).toFixed(1)}%`,
      "--size": `${between([9, 15]).toFixed(0)}px`,
      "--fall": `${between(FALL_S).toFixed(2)}s`,
      "--delay": `${between(DELAY_S).toFixed(2)}s`,
      "--sway": `${between([2.2, 3.4]).toFixed(2)}s`,
      "--drift": `${between([16, 40]).toFixed(0)}px`,
      "--turn": `${((Math.random() < 0.5 ? -1 : 1) * between([120, 300])).toFixed(0)}deg`,
    } as CSSProperties,
  }));
}

export function Petals() {
  const [petals, setPetals] = useState(makePetals);

  useEffect(() => {
    const t = window.setTimeout(() => setPetals([]), SHOWER_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (petals.length === 0) return null;
  return (
    <div className="card__petals" aria-hidden="true">
      {petals.map((p) => (
        <span key={p.id} className={`card__petal card__petal--${p.tone}`} style={p.style}>
          <i className="card__petal-shape" />
        </span>
      ))}
    </div>
  );
}
