"use client";

import { useRouter } from "next/navigation";
import { ADMIN_LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_SHORT, LANGS, t, type Lang } from "@/lib/i18n";
import { useLang } from "./i18n";
import { cx } from "./ui";

/** BM | EN for the admin UI. Stores a cookie and refreshes so the server re-renders in that language. */
export function AdminLangSwitch() {
  const lang = useLang();
  const router = useRouter();
  function choose(next: Lang) {
    if (next === lang) return;
    document.cookie = `${ADMIN_LANG_COOKIE}=${next}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
    router.refresh();
  }
  return (
    <div role="group" aria-label={t(lang, "lang.switch")} className="inline-flex h-[34px] items-center rounded-lg border border-line bg-white p-0.5 text-[12px] font-semibold">
      {LANGS.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === lang} onClick={() => choose(l)} className={cx("h-full rounded-md px-2.5", l === lang ? "bg-ink text-white" : "text-muted hover:text-ink")}>
          {LANG_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
