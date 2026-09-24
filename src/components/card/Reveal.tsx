"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Adds `.is-visible` once 20 % of the wrapper has scrolled into view, once.
// The reveal preset's CSS does the rest (docs/05 "Section transitions").
export function Reveal({ children, side }: { children: ReactNode; side: 1 | -1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={`card__reveal${visible ? " is-visible" : ""}`} style={{ "--side": side } as CSSProperties}>
      {children}
    </div>
  );
}
