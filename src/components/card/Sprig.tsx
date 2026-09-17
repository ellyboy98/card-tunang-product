// Section divider: a thin stem, alternating leaves, one rose bud at the centre.
// Inline SVG so it takes the theme colours.
export function Sprig({ width = 140 }: { width?: number }) {
  const h = 24;
  const mid = width / 2;
  const step = 20;
  const perSide = Math.max(1, Math.floor((mid - 14) / step));
  const leaves: { x: number; above: boolean }[] = [];
  for (let i = 1; i <= perSide; i++) {
    const above = i % 2 === 1;
    leaves.push({ x: mid - i * step, above }, { x: mid + i * step, above: !above });
  }
  return (
    <svg className="card__sprig" viewBox={`0 0 ${width} ${h}`} width={width} height={h} aria-hidden="true" focusable="false">
      <line x1={0} y1={12} x2={width} y2={12} stroke="var(--c-leaf)" strokeOpacity={0.6} strokeWidth={1} />
      {leaves.map(({ x, above }) => {
        const cy = above ? 8.5 : 15.5;
        return <ellipse key={x} cx={x} cy={cy} rx={7} ry={3} fill="var(--c-leaf)" fillOpacity={above ? 0.85 : 0.65} transform={`rotate(${above ? -35 : 35} ${x} ${cy})`} />;
      })}
      <circle cx={mid} cy={12} r={3.5} fill="var(--c-accent)" />
    </svg>
  );
}
