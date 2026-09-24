"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { WIND_PRESETS, type EntrancePresetKey, type FloralPresetKey, type RevealPresetKey, type WindPresetKey } from "@/lib/presets";
import { LangToggle } from "./LangToggle";
import { MusicToggle } from "./MusicToggle";

// The card's motion controller (docs/05 "Motion", "Wind", "Entrance variants").
// It renders the card root and owns the cover, the entrance timeline, the gust
// and ambient-petal timers and the audio element. Everything visual is CSS
// keyed on the root's data attributes; this file only toggles state on a timer.

type Phase = "cover" | "opening" | "settling" | "live";

type Props = {
  entrance: EntrancePresetKey;
  wind: WindPresetKey;
  floral: FloralPresetKey;
  reveal: RevealPresetKey;
  musicUrl: string | null;
  lang: Lang;
  /** Admin preview switches the language locally; the public page uses the cookie. */
  onLangChange?: (lang: Lang) => void;
  /** Admin preview: no scroll lock. */
  preview?: boolean;
  style: CSSProperties;
  /** The cover's face. Rendered twice for the curtain. */
  cover: ReactNode;
  /** Bloom centres in the cover as fractions of its size, for the petal_fall scatter. */
  blooms: Array<{ x: number; y: number }>;
  children: ReactNode;
};

// Milliseconds from the tap: when the cover unmounts, when the card florals
// start settling, when the arch grows, and when wind and ambient petals begin.
type Timeline = { coverGone: number; settle: number; arch: number; live: number };
const TIMELINES: Record<EntrancePresetKey, Timeline> = {
  petal_fall: { coverGone: 800, settle: 400, arch: 600, live: 1600 },
  curtain: { coverGone: 1300, settle: 600, arch: 600, live: 1400 },
  slide_up: { coverGone: 1000, settle: 600, arch: 600, live: 1300 },
  slide_left: { coverGone: 900, settle: 300, arch: 500, live: 1000 },
  fade: { coverGone: 700, settle: 300, arch: 300, live: 800 },
};
// Under prefers-reduced-motion every entrance is a 200 ms fade.
const REDUCED: Timeline = { coverGone: 250, settle: 0, arch: 0, live: 250 };

const GUST_MS = 2200;
const MAX_AMBIENT = 6;

type Range = readonly [number, number];
const between = ([lo, hi]: Range) => lo + Math.random() * (hi - lo);

type PetalSpec = {
  /** Start position as a percentage of the layer. */
  x: Range;
  y?: Range;
  dur: Range;
  delay?: Range;
  opacity: Range;
  sway?: boolean;
};
type Petal = { id: number; layer: "front" | "back"; sway: boolean; accent: boolean; style: CSSProperties };

let nextId = 1;
function makePetal(spec: PetalSpec, layer: Petal["layer"]): Petal & { life: number } {
  const dur = between(spec.dur);
  const delay = spec.delay ? between(spec.delay) : 0;
  return {
    id: nextId++,
    layer,
    sway: spec.sway ?? false,
    accent: Math.random() < 0.4,
    life: (dur + delay) * 1000 + 100,
    style: {
      "--x": `${between(spec.x).toFixed(1)}%`,
      "--y": `${(spec.y ? between(spec.y) : -5).toFixed(1)}%`,
      "--petal-dx": `${between([-60, 60]).toFixed(0)}px`,
      "--petal-rot": `${between([180, 540]).toFixed(0)}deg`,
      "--petal-o": between(spec.opacity).toFixed(2),
      "--dur": `${dur.toFixed(2)}s`,
      "--delay": `${delay.toFixed(2)}s`,
    } as CSSProperties,
  };
}

export function CardMotion({ entrance, wind, floral, reveal, musicUrl, lang, onLangChange, preview, style, cover, blooms, children }: Props) {
  const [phase, setPhase] = useState<Phase>("cover");
  const [coverGone, setCoverGone] = useState(false);
  const [grown, setGrown] = useState(false);
  const [gust, setGust] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const audio = useRef<HTMLAudioElement>(null);
  const timers = useRef(new Set<number>());
  const ambientAlive = useRef(0);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const t = timers.current;
    return () => {
      for (const id of t) window.clearTimeout(id);
      t.clear();
    };
  }, []);

  // Body scroll stays locked while the cover is up.
  useEffect(() => {
    if (preview || coverGone) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [coverGone, preview]);

  const emit = useCallback(
    (specs: PetalSpec[], layer: Petal["layer"]) => {
      const made = specs.map((s) => makePetal(s, layer));
      if (layer === "back") ambientAlive.current += made.length;
      setPetals((p) => [...p, ...made]);
      for (const petal of made) {
        after(petal.life, () => {
          if (layer === "back") ambientAlive.current -= 1;
          setPetals((p) => p.filter((x) => x.id !== petal.id));
        });
      }
    },
    [after],
  );

  const windOn = !reduced && wind !== "off" && (phase === "cover" || phase === "live");

  const blow = useCallback(() => {
    setGust(true);
    after(GUST_MS, () => setGust(false));
    const extra = WIND_PRESETS[wind].extra;
    if (phase === "live" && extra > 0 && ambientAlive.current + extra <= MAX_AMBIENT) {
      // From the right-hand cluster, carried by the same gust.
      emit(Array.from({ length: extra }, () => ({ x: [70, 95] as const, dur: [6, 9] as const, opacity: [0.25, 0.4] as const })), "back");
    }
  }, [after, emit, phase, wind]);

  // Gusts, on a randomised interval that depends on the wind preset.
  useEffect(() => {
    const range = WIND_PRESETS[wind].gust;
    if (!windOn || !range) return;
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        if (!document.hidden) blow();
        schedule();
      }, between(range) * 1000);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, [windOn, wind, blow]);

  // Ambient petals: the only continuous motion once the card is open.
  useEffect(() => {
    if (reduced || phase !== "live") return;
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        if (!document.hidden && ambientAlive.current + 3 <= MAX_AMBIENT) {
          emit(Array.from({ length: 3 }, () => ({ x: [5, 95] as const, dur: [9, 14] as const, opacity: [0.25, 0.4] as const })), "back");
        }
        schedule();
      }, between([15, 20]) * 1000);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, [reduced, phase, emit]);

  function open() {
    if (phase !== "cover") return;
    // This tap is the user gesture browsers require before play() is allowed.
    audio.current?.play().catch(() => undefined);
    const t = reduced ? REDUCED : TIMELINES[entrance];
    setPhase("opening");
    if (!reduced && entrance === "petal_fall") {
      after(200, () => emit(Array.from({ length: 10 }, () => ({ x: [5, 95] as const, dur: [3.5, 6] as const, delay: [0, 2.5] as const, opacity: [0.6, 0.9] as const, sway: true })), "front"));
      // Each cover bloom scatters as it scales away, two petals from where it stood.
      blooms.slice(0, 8).forEach((b, i) => {
        const x: Range = [b.x * 100 - 3, b.x * 100 + 3];
        const y: Range = [b.y * 100 - 2, b.y * 100 + 2];
        after(i * 40, () => emit([{ x, y, dur: [3, 5], opacity: [0.6, 0.9], sway: true }, { x, y, dur: [3, 5], opacity: [0.6, 0.9], sway: true }], "front"));
      });
    }
    if (!reduced && entrance === "slide_up") {
      after(250, () => emit(Array.from({ length: 8 }, () => ({ x: [5, 95] as const, dur: [3, 5] as const, delay: [0, 0.6] as const, opacity: [0.6, 0.9] as const, sway: true })), "front"));
    }
    after(t.settle, () => setPhase((p) => (p === "opening" ? "settling" : p)));
    after(t.arch, () => setGrown(true));
    after(t.coverGone, () => setCoverGone(true));
    after(t.live, () => {
      setPhase("live");
      if (!reduced && entrance === "slide_left" && wind !== "off") after(50, blow);
    });
  }

  function toggleMusic() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => undefined);
    else el.pause();
  }

  const rootStyle = { ...style, "--wind-k": WIND_PRESETS[wind].k } as CSSProperties;
  const classes = ["card", preview && "card--preview", gust && "is-gust", grown && "is-grown", reduced && "is-reduced"].filter(Boolean).join(" ");
  const front = petals.filter((p) => p.layer === "front");
  const back = petals.filter((p) => p.layer === "back");

  return (
    <div className={classes} style={rootStyle} lang={lang} data-phase={phase} data-entrance={entrance} data-floral={floral} data-wind-preset={wind} data-reveal={reveal}>
      {musicUrl && <audio ref={audio} src={musicUrl} preload="none" loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      {children}
      {back.length > 0 && <PetalLayer petals={back} layer="back" />}
      {!coverGone && (
        <div className="card__cover" onClick={open} aria-hidden={phase !== "cover" || undefined}>
          {entrance === "curtain" ? (
            <>
              <div className="card__cover-half card__cover-half--top">{cover}</div>
              <div className="card__cover-half card__cover-half--bottom" aria-hidden="true" inert>
                {cover}
              </div>
            </>
          ) : (
            cover
          )}
        </div>
      )}
      {front.length > 0 && <PetalLayer petals={front} layer="front" />}
      <LangToggle lang={lang} onChange={onLangChange} />
      {phase !== "cover" && musicUrl && <MusicToggle playing={playing} onToggle={toggleMusic} lang={lang} />}
    </div>
  );
}

// One 14 × 20 teardrop per petal, transform and opacity only. The strip is as
// tall as the layer so translateY(100%) means "past the bottom" in the viewport
// and in the scaled admin frame alike.
function PetalLayer({ petals, layer }: { petals: Petal[]; layer: Petal["layer"] }) {
  return (
    <div className={`card__petals card__petals--${layer}`} aria-hidden="true">
      {petals.map((p) => (
        <span key={p.id} className={`card__petal${p.accent ? " card__petal--accent" : ""}`} style={p.style}>
          <i className={p.sway ? "card__petal-sway" : undefined}>
            <svg viewBox="0 0 14 20" width={14} height={20} focusable="false">
              <path d="M7 0C10.5 5 14 9.5 14 13.5A7 7 0 0 1 0 13.5C0 9.5 3.5 5 7 0Z" />
            </svg>
          </i>
        </span>
      ))}
    </div>
  );
}
