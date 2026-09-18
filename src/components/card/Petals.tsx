"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Petals fall once: the shower released by the tap that opens the card, or the
// smaller burst for a confirmed RSVP. Each petal is two elements animating
// transform and opacity only, so the fall stays on the compositor, and the
// layer removes itself once the last petal has landed so nothing keeps running
// while the guest reads. Not rendered under prefers-reduced-motion.
type Preset = { count: number; fall: readonly [number, number]; delay: readonly [number, number] };
const SHOWER: Preset = { count: 24, fall: [5, 8], delay: [0, 3] };
const BURST: Preset = { count: 14, fall: [4, 6], delay: [0, 1.2] };

type Petal = { id: number; tone: 0 | 1 | 2; style: CSSProperties };

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

function makePetals({ count, fall, delay }: Preset): Petal[] {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    // Two accent tones, and every fifth petal a sage leaf.
    tone: i % 5 === 4 ? 2 : ((i % 2) as 0 | 1),
    style: {
      "--x": `${between([2, 96]).toFixed(1)}%`,
      "--size": `${between([9, 15]).toFixed(0)}px`,
      "--fall": `${between(fall).toFixed(2)}s`,
      "--delay": `${between(delay).toFixed(2)}s`,
      "--sway": `${between([2.2, 3.4]).toFixed(2)}s`,
      "--drift": `${between([16, 40]).toFixed(0)}px`,
      "--turn": `${((Math.random() < 0.5 ? -1 : 1) * between([120, 300])).toFixed(0)}deg`,
    } as CSSProperties,
  }));
}

/** When the slowest, latest petal has left the screen. */
const lifetimeMs = ({ fall, delay }: Preset) => (fall[1] + delay[1]) * 1000 + 250;

export function Petals({ burst }: { burst?: boolean }) {
  const preset = burst ? BURST : SHOWER;
  const [petals, setPetals] = useState(() => makePetals(preset));

  useEffect(() => {
    const t = window.setTimeout(() => setPetals([]), lifetimeMs(preset));
    return () => window.clearTimeout(t);
  }, [preset]);

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
