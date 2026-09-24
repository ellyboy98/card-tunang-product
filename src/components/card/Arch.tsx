import type { CSSProperties } from "react";

// Botanical arch framing the couple's names: a thin arc with 11 leaves along
// it, alternating tilt and opacity, and a rose bud at every third leaf. The
// stem draws in and the leaves pop when the root gets `.is-grown` (docs/05
// "Arch grows"); under reduced motion it is simply there.
export function Arch() {
  const cx = 150;
  const cy = 146;
  const r = 138;
  const n = 11;
  const items = Array.from({ length: n }, (_, i) => {
    const a = Math.PI - (i / (n - 1)) * Math.PI; // 180° → 0°, left to right
    const x = cx + r * Math.cos(a);
    const y = cy - r * Math.sin(a);
    const tangent = (Math.atan2(-Math.cos(a), -Math.sin(a)) * 180) / Math.PI;
    const tilt = i % 2 === 0 ? 30 : -30;
    return { x, y, rot: tangent + tilt, opacity: i % 2 === 0 ? 0.9 : 0.6, bud: i % 3 === 2 };
  });
  return (
    <svg className="card__arch" viewBox="0 0 300 150" width={300} height={150} aria-hidden="true" focusable="false">
      <path className="card__arch-stem" d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} pathLength={1} fill="none" stroke="var(--c-floral-leaf)" strokeOpacity={0.55} strokeWidth={1} />
      {items.map((it, i) => (
        <g key={i} transform={`translate(${it.x.toFixed(1)} ${it.y.toFixed(1)})`}>
          <g className="card__arch-leaf" style={{ "--i": i } as CSSProperties}>
            <ellipse rx={8} ry={3.5} fill="var(--c-floral-leaf)" fillOpacity={it.opacity} transform={`rotate(${it.rot.toFixed(1)})`} />
          </g>
          {it.bud && <circle className="card__arch-bud" r={3.5} fill="var(--c-accent)" />}
        </g>
      ))}
    </svg>
  );
}
