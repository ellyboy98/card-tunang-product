// Single definition of every input shape (docs/04-api.md). Routes and admin
// forms both import from here; never redefine a shape inline.
import { z } from "zod";
import { COLOR_PRESET_KEYS, FONT_PRESET_KEYS } from "./presets";

// Field errors are shown to the admin, who reads Malay.
z.config(z.locales.ms());

export const RSVP_STATUSES = ["pending", "attending", "declined"] as const;
export const HOST_SIDES = ["bride", "groom"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];
export type HostSide = (typeof HOST_SIDES)[number];

// Kept un-defaulted so `guestPatch` can omit a field without Zod injecting the
// default (Zod 4's partial() of a defaulted field still applies the default).
const guestFields = {
  label: z.string().trim().min(1).max(120),
  groupName: z.string().trim().min(1).max(60),
  pax: z.number().int().min(1).max(50),
  note: z.string().max(500).nullable().optional(),
};

export const guestInput = z.object({
  ...guestFields,
  groupName: guestFields.groupName.default("Lain-lain"),
});

export const guestPatch = z.object(guestFields).partial().extend({
  status: z.enum(RSVP_STATUSES).optional(),
  confirmedPax: z.number().int().min(0).max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isHidden: z.boolean().optional(),
});

export const rsvpInput = z.object({
  guestId: z.number().int().positive(),
  status: z.enum(["attending", "declined"]),
  // No upper bound here: the service clamps to the household's allocation.
  pax: z.number().int().min(1).optional(),
});

export const reorderInput = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(500),
});

export const loginInput = z.object({ password: z.string().min(1) });

export const scheduleItem = z.object({
  time: z.string().trim().max(20),
  label: z.string().trim().max(120),
});

export const contact = z.object({
  name: z.string().trim().max(80),
  relation: z.string().trim().max(60).optional(),
  phone: z.string().trim().regex(/^\+?\d{9,13}$/, "Nombor telefon tidak sah"),
});

export const settingsInput = z
  .object({
    title: z.string().trim().max(120),
    brideName: z.string().trim().max(120),
    groomName: z.string().trim().max(120),
    brideParents: z.string().trim().max(240),
    groomParents: z.string().trim().max(240),
    hostSide: z.enum(HOST_SIDES),
    openingText: z.string().trim().max(600),
    closingText: z.string().trim().max(300),
    hashtag: z.string().trim().max(60).nullable(),
    eventStartAt: z.iso.datetime({ offset: true }).nullable(),
    eventEndAt: z.iso.datetime({ offset: true }).nullable(),
    venueName: z.string().trim().max(160),
    venueAddress: z.string().trim().max(400),
    venueLat: z.number().min(-90).max(90).nullable(),
    venueLng: z.number().min(-180).max(180).nullable(),
    schedule: z.array(scheduleItem).max(20),
    contacts: z.array(contact).max(10),
    musicUrl: z.url().nullable(),
    backgroundUrl: z.url().nullable(),
    fontPreset: z.enum(FONT_PRESET_KEYS),
    colorPreset: z.enum(COLOR_PRESET_KEYS),
    isRsvpEnabled: z.boolean(),
  })
  // Compared as instants, not strings: the two ISO values may carry different offsets.
  .refine(
    (s) => !s.eventEndAt || !s.eventStartAt || Date.parse(s.eventEndAt) > Date.parse(s.eventStartAt),
    { message: "Tamat mesti selepas mula", path: ["eventEndAt"] },
  );

export type GuestInput = z.infer<typeof guestInput>;
export type GuestPatch = z.infer<typeof guestPatch>;
export type RsvpInput = z.infer<typeof rsvpInput>;
export type ScheduleItem = z.infer<typeof scheduleItem>;
export type Contact = z.infer<typeof contact>;
export type SettingsInput = z.infer<typeof settingsInput>;

/** Zod issues → { "schedule.0.label": "message" }, first message per field, for inline errors. */
export function issueMap(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
