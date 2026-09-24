"use client";

export function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={`card__music${playing ? " card__music--playing" : ""}`} onClick={onToggle} aria-pressed={playing} aria-label={playing ? "Jeda muzik" : "Main muzik"}>
      <span aria-hidden="true">{playing ? "❚❚" : "♪"}</span>
    </button>
  );
}
