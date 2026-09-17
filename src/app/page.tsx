import type { Metadata } from "next";
import { cache } from "react";
import { Card, coupleNames } from "@/components/card/Card";
import { colorPreset } from "@/lib/presets";
import { guestsService } from "@/server/services/guests.service";
import { settingsService } from "@/server/services/settings.service";

export const dynamic = "force-dynamic";

// generateMetadata and the page both need the row; cache() makes it one query.
const loadSettings = cache(async () => settingsService.toDto(await settingsService.get()));

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const { first, second } = coupleNames(s);
  const couple = [first, second].filter(Boolean).join(" & ");
  const title = [s.title, couple].filter(Boolean).join(" · ");
  const description = s.venueName || s.closingText;
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
  const [settings, guests] = await Promise.all([loadSettings(), guestsService.listForDropdown()]);
  return (
    <>
      {/* Overscroll and the area outside the column take the preset colour too. */}
      <style>{`html{background:${colorPreset(settings.colorPreset).bg}}`}</style>
      <Card settings={settings} guests={guests} />
    </>
  );
}
