// Tables per docs/03-data-model.md. snake_case columns, camelCase properties.
import { sql } from "drizzle-orm";
import { boolean, check, doublePrecision, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { HOST_SIDES, RSVP_STATUSES, type Contact, type ScheduleItem } from "@/lib/validation";

export const rsvpStatus = pgEnum("rsvp_status", RSVP_STATUSES);
export const hostSide = pgEnum("host_side", HOST_SIDES);

export const guests = pgTable(
  "guests",
  {
    id: serial("id").primaryKey(),
    label: text("label").notNull(),
    groupName: text("group_name").notNull().default("Lain-lain"),
    pax: integer("pax").notNull().default(1),
    confirmedPax: integer("confirmed_pax"),
    status: rsvpStatus("status").notNull().default("pending"),
    sortOrder: integer("sort_order").notNull().default(0),
    isHidden: boolean("is_hidden").notNull().default(false),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("guests_pax_positive", sql`${t.pax} >= 1 AND ${t.pax} <= 50`),
    check("guests_confirmed_le_pax", sql`${t.confirmedPax} IS NULL OR (${t.confirmedPax} >= 0 AND ${t.confirmedPax} <= ${t.pax})`),
    index("guests_group_sort_idx").on(t.groupName, t.sortOrder, t.label),
  ],
);

export const settings = pgTable(
  "settings",
  {
    id: integer("id").primaryKey().default(1),
    title: text("title").notNull().default("Majlis Pertunangan"),
    titleEn: text("title_en").notNull().default(""),
    brideName: text("bride_name").notNull().default(""),
    groomName: text("groom_name").notNull().default(""),
    brideParents: text("bride_parents").notNull().default(""),
    groomParents: text("groom_parents").notNull().default(""),
    hostSide: hostSide("host_side").notNull().default("bride"),
    openingText: text("opening_text")
      .notNull()
      .default("Dengan penuh kesyukuran ke hadrat Ilahi, kami mempersilakan tuan/puan ke majlis pertunangan anakanda kami"),
    openingTextEn: text("opening_text_en").notNull().default(""),
    closingText: text("closing_text").notNull().default("Kehadiran dan doa restu tuan/puan amat kami hargai."),
    closingTextEn: text("closing_text_en").notNull().default(""),
    hashtag: text("hashtag"),
    eventStartAt: timestamp("event_start_at", { withTimezone: true }),
    eventEndAt: timestamp("event_end_at", { withTimezone: true }),
    venueName: text("venue_name").notNull().default(""),
    venueAddress: text("venue_address").notNull().default(""),
    venueLat: doublePrecision("venue_lat"),
    venueLng: doublePrecision("venue_lng"),
    schedule: jsonb("schedule").$type<ScheduleItem[]>().notNull().default([]),
    contacts: jsonb("contacts").$type<Contact[]>().notNull().default([]),
    musicUrl: text("music_url"),
    backgroundUrl: text("background_url"),
    fontPreset: text("font_preset").notNull().default("classic"),
    colorPreset: text("color_preset").notNull().default("blush"),
    floralPreset: text("floral_preset").notNull().default("peony_corners"),
    entrancePreset: text("entrance_preset").notNull().default("petal_fall"),
    windPreset: text("wind_preset").notNull().default("gentle"),
    revealPreset: text("reveal_preset").notNull().default("fade_up"),
    isRsvpEnabled: boolean("is_rsvp_enabled").notNull().default(true),
    defaultLanguage: text("default_language").notNull().default("ms"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("settings_singleton", sql`${t.id} = 1`)],
);

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
