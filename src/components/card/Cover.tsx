// The cover's face: florals, names, the button. Server-friendly; CardMotion
// owns the tap, the timers and the audio. Clicks anywhere on the cover open it,
// so the button needs no handler of its own.
import type { CSSProperties, ReactNode } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { FloralPresetKey } from "@/lib/presets";
import { FloralCover } from "./Florals";

type Props = {
  title: string;
  names: ReactNode;
  dateLabel: string | null;
  floral: FloralPresetKey;
  lang: Lang;
};

export function CoverFace({ title, names, dateLabel, floral, lang }: Props) {
  return (
    <div className="card__cover-face">
      <CoverDecor preset={floral} />
      <FloralCover preset={floral} />
      <div className="card__cover-inner">
        <p className="card__eyebrow">{title}</p>
        <p className="card__cover-names">{names}</p>
        {dateLabel && <p className="card__cover-date">{dateLabel}</p>}
        <button type="button" className="card__btn card__btn--filled card__cover-btn">
          {t(lang, "card.open")}
        </button>
        <p className="card__cover-hint">{t(lang, "card.tapHint")}</p>
      </div>
    </div>
  );
}

const PHI = 0.6180339887;
const fract = (v: number) => v - Math.floor(v);

// Watercolour washes: colour, position and size from docs/05.
const WASHES: Array<[string, number, number, number]> = [
  ["#F3C9C7", 8, 14, 220],
  ["#EAD7E3", 78, 30, 200],
  ["#D9E3D4", 20, 62, 210],
  ["#F1D4CB", 84, 78, 190],
  ["#F6DCD8", 50, 96, 230],
];

/** The pure-CSS parts of a background recipe: fireflies for the garden, washes for the watercolour. */
function CoverDecor({ preset }: { preset: FloralPresetKey }) {
  if (preset === "evening_garden") {
    return (
      <div className="card__cover-decor" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="card__firefly" style={{ left: `${(fract(i * PHI) * 90 + 5).toFixed(1)}%`, top: `${(fract((i + 3) * PHI) * 80 + 10).toFixed(1)}%`, opacity: 0.5 + fract(i * 0.37) * 0.4 }} />
        ))}
      </div>
    );
  }
  if (preset === "watercolor") {
    return (
      <div className="card__cover-decor" aria-hidden="true">
        {WASHES.map(([c, x, y, size], i) => (
          <span key={i} className="card__wash" style={{ "--wash": c, left: `${x}%`, top: `${y}%`, width: size, height: size * 0.8 } as CSSProperties} />
        ))}
      </div>
    );
  }
  return null;
}
