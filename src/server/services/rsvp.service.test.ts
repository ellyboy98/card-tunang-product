import { describe, expect, it } from "vitest";
import type { Guest } from "../db/schema";
import { HttpError } from "../errors";
import { getStatus, respond, type RsvpDeps } from "./rsvp.service";

function guest(over: Partial<Guest> = {}): Guest {
  return {
    id: 1,
    label: "Pak Cik Ahmad sekeluarga",
    groupName: "Keluarga pengantin perempuan",
    pax: 4,
    confirmedPax: null,
    status: "pending",
    sortOrder: 0,
    isHidden: false,
    note: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...over,
  };
}

/** In-memory stand-in for the repository: one row, updates applied in place. */
function fakeDeps(row: Guest | undefined, enabled = true): RsvpDeps & { row: Guest | undefined } {
  const state = { row };
  return {
    row: state.row,
    getGuest: async (id) => (state.row?.id === id ? state.row : undefined),
    updateGuest: async (id, patch) => {
      if (state.row?.id !== id) return undefined;
      state.row = { ...state.row, ...patch };
      return state.row;
    },
    isRsvpEnabled: async () => enabled,
  };
}

const status = (p: Promise<unknown>) => p.then(() => null, (e: HttpError) => e.status);

describe("rsvp.respond", () => {
  it("clamps attending pax to the allocation", async () => {
    const out = await respond({ guestId: 1, status: "attending", pax: 99 }, fakeDeps(guest({ pax: 4 })));
    expect(out).toMatchObject({ status: "attending", confirmedPax: 4 });
  });

  it("never stores fewer than one attending", async () => {
    const out = await respond({ guestId: 1, status: "attending", pax: 0 }, fakeDeps(guest({ pax: 4 })));
    expect(out.confirmedPax).toBe(1);
  });

  it("defaults attending pax to the allocation when omitted", async () => {
    const out = await respond({ guestId: 1, status: "attending" }, fakeDeps(guest({ pax: 3 })));
    expect(out.confirmedPax).toBe(3);
  });

  it("stores 0 when declining, whatever pax says", async () => {
    const out = await respond({ guestId: 1, status: "declined", pax: 3 }, fakeDeps(guest()));
    expect(out).toMatchObject({ status: "declined", confirmedPax: 0 });
  });

  it("treats a hidden guest as not found", async () => {
    await expect(status(respond({ guestId: 1, status: "attending" }, fakeDeps(guest({ isHidden: true }))))).resolves.toBe(404);
    await expect(status(getStatus(1, fakeDeps(guest({ isHidden: true }))))).resolves.toBe(404);
  });

  it("treats an unknown guest as not found", async () => {
    await expect(status(respond({ guestId: 7, status: "attending" }, fakeDeps(guest())))).resolves.toBe(404);
  });

  it("is forbidden when RSVP is disabled", async () => {
    await expect(status(respond({ guestId: 1, status: "attending" }, fakeDeps(guest(), false)))).resolves.toBe(403);
  });

  it("never exposes note or sort order", async () => {
    const out = await getStatus(1, fakeDeps(guest({ note: "VIP" })));
    expect(Object.keys(out).sort()).toEqual(["confirmedPax", "id", "label", "pax", "status"]);
  });
});
