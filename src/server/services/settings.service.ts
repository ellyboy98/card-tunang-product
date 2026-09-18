// Rules for the settings row: it always exists, and it crosses the wire as ISO strings.
import { colorPresetKey, coverTransitionKey, fontPresetKey, petalDensityKey, petalStyleKey } from "@/lib/presets";
import type { SettingsDto } from "@/lib/types";
import type { SettingsInput } from "@/lib/validation";
import type { Settings } from "../db/schema";
import { settingsRepo } from "../repositories/settings.repo";

/** Returns the row, inserting the defaults first if this is a fresh database. */
export async function get(): Promise<Settings> {
  const existing = await settingsRepo.get();
  if (existing) return existing;
  await settingsRepo.insertDefault();
  const row = await settingsRepo.get();
  if (!row) throw new Error("settings row missing after insert");
  return row;
}

export async function update(input: SettingsInput): Promise<Settings> {
  await get();
  const row = await settingsRepo.update({
    ...input,
    eventStartAt: input.eventStartAt ? new Date(input.eventStartAt) : null,
    eventEndAt: input.eventEndAt ? new Date(input.eventEndAt) : null,
  });
  if (!row) throw new Error("settings row vanished during update");
  return row;
}

/** Row → JSON shape shared by the API, the admin form and the card. */
export function toDto(row: Settings): SettingsDto {
  const { id: _id, eventStartAt, eventEndAt, updatedAt, ...rest } = row;
  void _id;
  return {
    ...rest,
    fontPreset: fontPresetKey(rest.fontPreset),
    colorPreset: colorPresetKey(rest.colorPreset),
    coverTransition: coverTransitionKey(rest.coverTransition),
    petalStyle: petalStyleKey(rest.petalStyle),
    petalDensity: petalDensityKey(rest.petalDensity),
    eventStartAt: eventStartAt?.toISOString() ?? null,
    eventEndAt: eventEndAt?.toISOString() ?? null,
    updatedAt: updatedAt.toISOString(),
  };
}

export const settingsService = { get, update, toDto };
