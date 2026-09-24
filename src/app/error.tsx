"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { presetVars } from "@/components/card/Card";
import { Sprig } from "@/components/card/Sprig";
import { DEFAULT_LANG, LANG_COOKIE, langKey, t, type Lang } from "@/lib/i18n";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // A client component cannot read cookies on the server, so the language arrives after mount.
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  useEffect(() => {
    console.error(error);
    const m = new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`).exec(document.cookie);
    setLang(langKey(m?.[1]));
  }, [error]);

  return (
    <div className="card" lang={lang} style={presetVars("blush", "classic")}>
      <main className="card__page card__status">
        <Sprig width={90} />
        <p className="card__eyebrow">{t(lang, "status.sorry")}</p>
        <h1 className="card__heading">{t(lang, "status.errorTitle")}</h1>
        <p className="card__body card__muted">{t(lang, "status.errorBody")}</p>
        <div className="card__btn-row">
          <button type="button" className="card__btn card__btn--filled" onClick={reset}>
            {t(lang, "status.retry")}
          </button>
          <Link href="/" className="card__btn card__btn--outlined">
            {t(lang, "status.toCard")}
          </Link>
        </div>
      </main>
    </div>
  );
}
