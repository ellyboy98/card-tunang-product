// The only public write. Confirmation, not registration (docs/01).
import type { RsvpState } from "@/lib/types";
import type { RsvpInput } from "@/lib/validation";
import type { Guest } from "../db/schema";
import { HttpError } from "../errors";
import { guestsRepo } from "../repositories/guests.repo";
import { settingsService } from "./settings.service";

export type RsvpDeps = {
  getGuest: (id: number) => Promise<Guest | undefined>;
  updateGuest: (id: number, patch: Pick<Guest, "status" | "confirmedPax">) => Promise<Guest | undefined>;
  isRsvpEnabled: () => Promise<boolean>;
};

const liveDeps: RsvpDeps = {
  getGuest: (id) => guestsRepo.getById(id),
  updateGuest: (id, patch) => guestsRepo.update(id, patch),
  isRsvpEnabled: async () => (await settingsService.get()).isRsvpEnabled,
};

const notFound = () => new HttpError(404, "Tetamu tidak dijumpai");

export function toRsvpState(g: Guest): RsvpState {
  return { id: g.id, label: g.label, pax: g.pax, status: g.status, confirmedPax: g.confirmedPax };
}

export async function getStatus(guestId: number, deps: RsvpDeps = liveDeps): Promise<RsvpState> {
  const g = await deps.getGuest(guestId);
  if (!g || g.isHidden) throw notFound();
  return toRsvpState(g);
}

export async function respond(input: RsvpInput, deps: RsvpDeps = liveDeps): Promise<RsvpState> {
  if (!(await deps.isRsvpEnabled())) throw new HttpError(403, "RSVP ditutup");
  const g = await deps.getGuest(input.guestId);
  if (!g || g.isHidden) throw notFound();

  // Declining ignores pax. Attending is clamped to the allocation; never above it.
  const confirmedPax = input.status === "declined" ? 0 : Math.min(Math.max(input.pax ?? g.pax, 1), g.pax);

  const updated = await deps.updateGuest(g.id, { status: input.status, confirmedPax });
  if (!updated) throw notFound();
  return toRsvpState(updated);
}

export const rsvpService = { getStatus, respond };
