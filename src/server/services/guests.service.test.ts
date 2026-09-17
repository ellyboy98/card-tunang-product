import { describe, expect, it } from "vitest";
import type { Guest } from "../db/schema";
import { reconcile, totals } from "./guests.service";

function guest(over: Partial<Guest> = {}): Guest {
  return {
    id: 1,
    label: "x",
    groupName: "g",
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

describe("guests.reconcile", () => {
  it("lowers confirmed_pax when pax drops below it", () => {
    expect(reconcile(guest({ pax: 4, confirmedPax: 4, status: "attending" }), { pax: 2 })).toMatchObject({ pax: 2, confirmedPax: 2 });
  });

  it("leaves confirmed_pax alone when pax rises", () => {
    expect(reconcile(guest({ pax: 4, confirmedPax: 3, status: "attending" }), { pax: 6 })).toMatchObject({ pax: 6, confirmedPax: 3 });
  });

  it("derives confirmed_pax from a status change", () => {
    expect(reconcile(guest(), { status: "attending" })).toMatchObject({ confirmedPax: 4 });
    expect(reconcile(guest({ status: "attending", confirmedPax: 4 }), { status: "declined" })).toMatchObject({ confirmedPax: 0 });
    expect(reconcile(guest({ status: "declined", confirmedPax: 0 }), { status: "pending" })).toMatchObject({ confirmedPax: null });
  });

  it("respects an explicit confirmed_pax but caps it at pax", () => {
    expect(reconcile(guest(), { status: "attending", confirmedPax: 2 })).toMatchObject({ confirmedPax: 2 });
    expect(reconcile(guest(), { confirmedPax: 9 })).toMatchObject({ confirmedPax: 4 });
  });
});

describe("guests.totals", () => {
  it("sums per docs/03", () => {
    const rows = [
      guest({ pax: 4, status: "attending", confirmedPax: 3 }),
      guest({ pax: 2, status: "declined", confirmedPax: 0 }),
      guest({ pax: 5, status: "pending" }),
      guest({ pax: 1, status: "attending", confirmedPax: null, isHidden: true }),
    ];
    expect(totals(rows)).toEqual({ households: 4, invited: 12, attending: 3, declined: 2, pending: 5 });
  });
});
