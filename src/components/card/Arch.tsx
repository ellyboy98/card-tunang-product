// Botanical arch framing the couple's names: a thin arc with 11 leaves along
// it, alternating tilt and opacity, and a rose bud at every third leaf.
// No animation, so it is reduced-motion safe by construction.
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
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--c-leaf)" strokeOpacity={0.55} strokeWidth={1} />
      {items.map((it, i) => (
        <g key={i}>
          <ellipse cx={it.x} cy={it.y} rx={8} ry={3.5} fill="var(--c-leaf)" fillOpacity={it.opacity} transform={`rotate(${it.rot.toFixed(1)} ${it.x.toFixed(1)} ${it.y.toFixed(1)})`} />
          {it.bud && <circle cx={it.x} cy={it.y} r={3.5} fill="var(--c-accent)" />}
        </g>
      ))}
    </svg>
  );
}
