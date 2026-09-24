"use client";

import { t, type Lang } from "@/lib/i18n";

export function MusicToggle({ playing, onToggle, lang }: { playing: boolean; onToggle: () => void; lang: Lang }) {
  return (
    <button type="button" className={`card__music${playing ? " card__music--playing" : ""}`} onClick={onToggle} aria-pressed={playing} aria-label={t(lang, playing ? "music.pause" : "music.play")}>
      <span aria-hidden="true">{playing ? "❚❚" : "♪"}</span>
    </button>
  );
}
