"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Toggles `.is-visible` as the wrapper scrolls in and out, so the section's
// transition replays every time it comes back (docs/05 "Section transitions").
// Hysteresis keeps the edges calm: it shows at 20 % visible and hides only
// once nothing of it is on screen, so a section never fades while still in view.
const SHOW_AT = 0.2;

export function Reveal({ children, side }: { children: ReactNode; side: 1 | -1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= SHOW_AT) setVisible(true);
          else if (!e.isIntersecting) setVisible(false);
        }
      },
      { threshold: [0, SHOW_AT] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`card__reveal${visible ? " is-visible" : ""}`} style={{ "--side": side } as CSSProperties}>
      {children}
    </div>
  );
}
