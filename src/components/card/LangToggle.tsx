"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_SHORT, LANGS, t, type Lang } from "@/lib/i18n";

// BM | EN pill in the card's corner. On the public page it stores the choice
// in a cookie and refreshes, so the server re-renders the card in that language.
// The admin preview passes onChange and switches locally instead.
export function LangToggle({ lang, onChange }: { lang: Lang; onChange?: (lang: Lang) => void }) {
  const router = useRouter();
  function choose(next: Lang) {
    if (next === lang) return;
    if (onChange) return onChange(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
    router.refresh();
  }
  return (
    <div className="card__lang" role="group" aria-label={t(lang, "lang.switch")}>
      {LANGS.map((l) => (
        <button key={l} type="button" className={`card__lang-btn${l === lang ? " card__lang-btn--active" : ""}`} aria-pressed={l === lang} lang={l} onClick={() => choose(l)}>
          {LANG_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
