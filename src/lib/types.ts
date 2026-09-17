// JSON shapes exchanged between route handlers and the browser (docs/04-api.md).
// Timestamps are ISO 8601 strings here; the database rows behind them use Date.
import type { RsvpStatus, SettingsInput } from "./validation";

export type GuestRow = {
  id: number;
  label: string;
  groupName: string;
  pax: number;
  confirmedPax: number | null;
  status: RsvpStatus;
  sortOrder: number;
  isHidden: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What the public dropdown sees. Never pax, status or note. */
export type GuestOption = Pick<GuestRow, "id" | "label" | "groupName">;

/** One household's RSVP state, shown on the card after selection. */
export type RsvpState = Pick<GuestRow, "id" | "label" | "pax" | "status" | "confirmedPax">;

export type Totals = {
  households: number;
  invited: number;
  attending: number;
  declined: number;
  pending: number;
};

export type SettingsDto = SettingsInput & { updatedAt: string };
