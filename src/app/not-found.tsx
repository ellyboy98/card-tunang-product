import { cookies } from "next/headers";
import Link from "next/link";
import { presetVars } from "@/components/card/Card";
import { Sprig } from "@/components/card/Sprig";
import { LANG_COOKIE, langKey, t } from "@/lib/i18n";

// Uses the default presets rather than reading the database; only the language cookie is read.
export default async function NotFound() {
  const lang = langKey((await cookies()).get(LANG_COOKIE)?.value);
  return (
    <div className="card" lang={lang} style={presetVars("blush", "classic")}>
      <main className="card__page card__status">
        <Sprig width={90} />
        <p className="card__eyebrow">404</p>
        <h1 className="card__heading">{t(lang, "status.notFound")}</h1>
        <p className="card__body card__muted">{t(lang, "status.notFoundBody")}</p>
        <div className="card__btn-row">
          <Link href="/" className="card__btn card__btn--filled">
            {t(lang, "status.toCard")}
          </Link>
        </div>
      </main>
    </div>
  );
}
