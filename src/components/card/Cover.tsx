"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MusicToggle } from "./MusicToggle";
import { Petals } from "./Petals";
import { Sprig } from "./Sprig";

type Props = {
  title: string;
  names: ReactNode;
  dateLabel: string | null;
  musicUrl: string | null;
  /** Admin preview: no scroll lock. */
  preview?: boolean;
};

const FADE_MS = 600;

// The cover owns the <audio> element: the tap that opens the card is the user
// gesture browsers require before play() is allowed.
export function Cover({ title, names, dateLabel, musicUrl, preview }: Props) {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (preview || open) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [open, preview]);

  function openCard() {
    if (open) return;
    setOpen(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => setGone(true), reduced ? 0 : FADE_MS);
    // A rejected play() just leaves the toggle in its paused state.
    audio.current?.play().catch(() => undefined);
  }

  function toggleMusic() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => undefined);
    else el.pause();
  }

  return (
    <>
      {musicUrl && <audio ref={audio} src={musicUrl} preload="none" loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      {!gone && (
        <div className={`card__cover${open ? " card__cover--open" : ""}`} onClick={openCard} aria-hidden={open || undefined}>
          <div className="card__decor" aria-hidden="true">
            <span className="card__blob card__blob--a" />
            <span className="card__blob card__blob--b" />
            <span className="card__blob card__blob--c" />
          </div>
          <div className="card__cover-inner">
            <Sprig width={120} />
            <p className="card__eyebrow">{title}</p>
            <p className="card__cover-names">{names}</p>
            {dateLabel && <p className="card__cover-date">{dateLabel}</p>}
            <button type="button" className="card__btn card__btn--filled" onClick={openCard} tabIndex={open ? -1 : 0}>
              Buka jemputan
            </button>
            <p className="card__cover-hint">Ketik untuk membuka</p>
          </div>
        </div>
      )}
      {open && <Petals />}
      {open && musicUrl && <MusicToggle playing={playing} onToggle={toggleMusic} />}
    </>
  );
}
