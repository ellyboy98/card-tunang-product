// CSV of the guest list for Excel: UTF-8 BOM, CRLF, quoted where needed.
import { klDateKey, klParts } from "@/lib/format";
import { DEFAULT_LANG, t, type Lang, type StringKey } from "@/lib/i18n";
import type { RsvpStatus } from "@/lib/validation";
import type { Guest } from "../db/schema";

const STATUS_KEY: Record<RsvpStatus, StringKey> = { pending: "a.pending", attending: "a.attending", declined: "a.declined" };
const HEADER_KEYS: StringKey[] = ["csv.group", "csv.name", "csv.invitedPax", "csv.status", "csv.attendingPax", "csv.note", "csv.updated"];

export function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function klDateTime(d: Date): string {
  const p = klParts(d);
  return `${klDateKey(d)} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function guestsCsv(rows: Guest[], lang: Lang = DEFAULT_LANG): string {
  const header = HEADER_KEYS.map((k) => t(lang, k));
  const lines = [header, ...rows.map((g) => [g.groupName, g.label, g.pax, t(lang, STATUS_KEY[g.status]), g.confirmedPax, g.note, klDateTime(g.updatedAt)])];
  return "﻿" + lines.map((cells) => cells.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function csvFilename(now = new Date(), lang: Lang = DEFAULT_LANG): string {
  return `${t(lang, "csv.filename")}-${klDateKey(now)}.csv`;
}

export const exportService = { guestsCsv, csvFilename };
