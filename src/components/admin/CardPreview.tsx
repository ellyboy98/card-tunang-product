"use client";

import { useState } from "react";
import { Card } from "@/components/card/Card";
import type { Lang } from "@/lib/i18n";
import type { GuestOption } from "@/lib/types";
import type { SettingsInput } from "@/lib/validation";
import { useT } from "./i18n";

const FRAME_WIDTH = 300;
const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 780;
const SCALE = FRAME_WIDTH / PHONE_WIDTH;

// The RSVP dropdown needs options to look real; these never touch the network.
const SAMPLE_GUESTS: GuestOption[] = [
  { id: 1, label: "Pak Cik Ahmad (Klang) sekeluarga", groupName: "Keluarga pengantin perempuan" },
  { id: 2, label: "Keluarga Hj. Rosli (Ipoh)", groupName: "Keluarga pengantin lelaki" },
  { id: 3, label: "Rakan pejabat", groupName: "Rakan-rakan" },
];

/** The real card at 390 px, scaled to a 300 px phone frame. Re-renders from unsaved form state. */
export function CardPreview({ settings }: { settings: SettingsInput }) {
  const { t } = useT();
  // The card's toggle overrides the form's default language until the default changes again.
  const [override, setOverride] = useState<{ base: Lang; lang: Lang } | null>(null);
  const lang = override && override.base === settings.defaultLanguage ? override.lang : settings.defaultLanguage;
  return (
    <div role="region" aria-label={t("a.previewCard")} className="overflow-hidden rounded-[28px] border border-line bg-panel shadow-sm" style={{ width: FRAME_WIDTH, height: PHONE_HEIGHT * SCALE }}>
      <div style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
        <Card settings={settings} guests={SAMPLE_GUESTS} lang={lang} onLangChange={(l) => setOverride({ base: settings.defaultLanguage, lang: l })} preview />
      </div>
    </div>
  );
}
