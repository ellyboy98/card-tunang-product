"use client";

import { Card } from "@/components/card/Card";
import type { GuestOption } from "@/lib/types";
import type { SettingsInput } from "@/lib/validation";

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
  return (
    <div role="region" aria-label="Pratonton kad" className="overflow-hidden rounded-[28px] border border-line bg-panel shadow-sm" style={{ width: FRAME_WIDTH, height: PHONE_HEIGHT * SCALE }}>
      <div style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
        <Card settings={settings} guests={SAMPLE_GUESTS} preview />
      </div>
    </div>
  );
}
