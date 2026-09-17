// CSV of the guest list for Excel: UTF-8 BOM, CRLF, quoted where needed.
import { klDateKey, klParts } from "@/lib/format";
import type { RsvpStatus } from "@/lib/validation";
import type { Guest } from "../db/schema";

const STATUS_MS: Record<RsvpStatus, string> = { pending: "Belum jawab", attending: "Hadir", declined: "Tidak hadir" };
const HEADER = ["Kumpulan", "Nama", "Pax dijemput", "Status", "Pax hadir", "Nota", "Dikemaskini"];

export function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function klDateTime(d: Date): string {
  const p = klParts(d);
  return `${klDateKey(d)} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function guestsCsv(rows: Guest[]): string {
  const lines = [HEADER, ...rows.map((g) => [g.groupName, g.label, g.pax, STATUS_MS[g.status], g.confirmedPax, g.note, klDateTime(g.updatedAt)])];
  return "﻿" + lines.map((cells) => cells.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function csvFilename(now = new Date()): string {
  return `tetamu-${klDateKey(now)}.csv`;
}

export const exportService = { guestsCsv, csvFilename };
