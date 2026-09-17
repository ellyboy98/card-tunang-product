// Guest list rules: totals, and keeping confirmed_pax consistent with pax and status.
import type { GuestOption, GuestRow, Totals } from "@/lib/types";
import type { GuestInput, GuestPatch } from "@/lib/validation";
import type { Guest } from "../db/schema";
import { HttpError } from "../errors";
import { guestsRepo, type GuestUpdate } from "../repositories/guests.repo";

export type GuestsDeps = Pick<typeof guestsRepo, "list" | "listVisibleForDropdown" | "getById" | "create" | "update" | "remove" | "reorder">;

const notFound = () => new HttpError(404, "Tetamu tidak dijumpai");

export function totals(rows: Guest[]): Totals {
  const t: Totals = { households: rows.length, invited: 0, attending: 0, declined: 0, pending: 0 };
  for (const g of rows) {
    t.invited += g.pax;
    if (g.status === "attending") t.attending += g.confirmedPax ?? 0;
    else if (g.status === "declined") t.declined += g.pax;
    else t.pending += g.pax;
  }
  return t;
}

export async function list(deps: GuestsDeps = guestsRepo): Promise<{ guests: Guest[]; totals: Totals }> {
  const guests = await deps.list();
  return { guests, totals: totals(guests) };
}

/** The public dropdown: id, label and group only, hidden rows excluded. */
export function listForDropdown(deps: GuestsDeps = guestsRepo): Promise<GuestOption[]> {
  return deps.listVisibleForDropdown();
}

export function create(input: GuestInput, deps: GuestsDeps = guestsRepo): Promise<Guest> {
  return deps.create(input);
}

/**
 * Applies a patch, then reconciles confirmed_pax so the CHECK constraint holds and
 * the admin's status pill does what it looks like it does:
 * - pax lowered below confirmed_pax → confirmed_pax follows it down
 * - status → declined: 0; → pending: null; → attending with nothing confirmed: pax
 */
export function reconcile(current: Guest, patch: GuestPatch): GuestUpdate {
  const pax = patch.pax ?? current.pax;
  const status = patch.status ?? current.status;
  let confirmedPax = patch.confirmedPax !== undefined ? patch.confirmedPax : current.confirmedPax;

  if (patch.status && patch.status !== current.status && patch.confirmedPax === undefined) {
    confirmedPax = status === "declined" ? 0 : status === "pending" ? null : (current.confirmedPax ?? pax);
  }
  if (confirmedPax !== null && confirmedPax > pax) confirmedPax = pax;

  return { ...patch, pax, status, confirmedPax };
}

export async function update(id: number, patch: GuestPatch, deps: GuestsDeps = guestsRepo): Promise<Guest> {
  const current = await deps.getById(id);
  if (!current) throw notFound();
  const row = await deps.update(id, reconcile(current, patch));
  if (!row) throw notFound();
  return row;
}

export async function remove(id: number, deps: GuestsDeps = guestsRepo): Promise<void> {
  if (!(await deps.remove(id))) throw notFound();
}

export function reorder(ids: number[], deps: GuestsDeps = guestsRepo): Promise<void> {
  return deps.reorder(ids);
}

/** Row → JSON shape; the same thing NextResponse.json produces, typed for server-rendered props. */
export function toRow(g: Guest): GuestRow {
  return { ...g, createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString() };
}

export const guestsService = { list, listForDropdown, create, update, remove, reorder, totals, toRow };
