import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { Card, coupleNames } from "@/components/card/Card";
import { LANG_COOKIE, langKey, pick } from "@/lib/i18n";
import { effectiveColors } from "@/lib/presets";
import { guestsService } from "@/server/services/guests.service";
import { settingsService } from "@/server/services/settings.service";

export const dynamic = "force-dynamic";

// generateMetadata and the page both need the row; cache() makes it one query.
const loadSettings = cache(async () => settingsService.toDto(await settingsService.get()));
/** The guest's cookie wins; otherwise the admin's default. */
const loadLang = cache(async () => {
  const s = await loadSettings();
  return langKey((await cookies()).get(LANG_COOKIE)?.value ?? s.defaultLanguage);
});

export async function generateMetadata(): Promise<Metadata> {
  const [s, lang] = await Promise.all([loadSettings(), loadLang()]);
  const { first, second } = coupleNames(s);
  const couple = [first, second].filter(Boolean).join(" & ");
  const title = [pick(lang, s.title, s.titleEn), couple].filter(Boolean).join(" · ");
  const description = s.venueName || pick(lang, s.closingText, s.closingTextEn);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title,
    description,
    metadataBase: site ? new URL(site) : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ms_MY",
      images: s.backgroundUrl ? [{ url: s.backgroundUrl }] : undefined,
    },
    twitter: { card: s.backgroundUrl ? "summary_large_image" : "summary" },
  };
}

export default async function CardPage() {
  const [settings, guests, lang] = await Promise.all([loadSettings(), guestsService.listForDropdown(), loadLang()]);
  return (
    <>
      {/* Overscroll and the area outside the column take the preset colour too. */}
      <style>{`html{background:${effectiveColors(settings.colorPreset, settings.floralPreset).bg}}`}</style>
      <Card settings={settings} guests={guests} lang={lang} />
    </>
  );
}
