"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LANG, t, type Lang, type StringKey, type Vars } from "@/lib/i18n";

// The admin's language, read from its cookie by the admin layout and handed to
// every client component through this context.
const LangContext = createContext<Lang>(DEFAULT_LANG);

export function AdminLang({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT() {
  const lang = useLang();
  return { lang, t: (key: StringKey, vars?: Vars) => t(lang, key, vars) };
}
