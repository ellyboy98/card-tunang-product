// Section divider: a thin stem, alternating leaves, one rose bud at the centre.
// Inline SVG so it takes the floral theme's leaf colour. Each leaf sits in its
// own positioning <g>, so the draw-in animation can scale it from the stem
// without disturbing the placement.
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
  // Nearest the centre first, so the pop follows the stem outwards.
  leaves.sort((a, b) => Math.abs(a.x - mid) - Math.abs(b.x - mid));
  return (
    <svg className="card__sprig" viewBox={`0 0 ${width} ${h}`} width={width} height={h} aria-hidden="true" focusable="false">
      <line className="card__sprig-stem" x1={0} y1={12} x2={width} y2={12} pathLength={1} stroke="var(--c-floral-leaf)" strokeOpacity={0.6} strokeWidth={1} />
      {leaves.map(({ x, above }, i) => {
        const cy = above ? 8.5 : 15.5;
        return (
          <g key={x} transform={`translate(${x} ${cy}) rotate(${above ? -35 : 35})`}>
            <ellipse className="card__sprig-leaf" style={{ "--i": i } as React.CSSProperties} rx={7} ry={3} fill="var(--c-floral-leaf)" fillOpacity={above ? 0.85 : 0.65} />
          </g>
        );
      })}
      <circle className="card__sprig-bud" cx={mid} cy={12} r={3.5} fill="var(--c-accent)" />
    </svg>
  );
}
