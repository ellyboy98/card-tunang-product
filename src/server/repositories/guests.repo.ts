// Drizzle queries for the guests table. Plain typed rows in, plain typed rows out.
import { asc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { guests, type Guest, type NewGuest } from "../db/schema";

export type GuestUpdate = Partial<Omit<NewGuest, "id" | "createdAt" | "updatedAt">>;

const listOrder = [asc(guests.groupName), asc(guests.sortOrder), asc(guests.label)];

export const guestsRepo = {
  list(): Promise<Guest[]> {
    return getDb().select().from(guests).orderBy(...listOrder);
  },

  listVisibleForDropdown(): Promise<Pick<Guest, "id" | "label" | "groupName">[]> {
    return getDb()
      .select({ id: guests.id, label: guests.label, groupName: guests.groupName })
      .from(guests)
      .where(eq(guests.isHidden, false))
      .orderBy(...listOrder);
  },

  async getById(id: number): Promise<Guest | undefined> {
    const rows = await getDb().select().from(guests).where(eq(guests.id, id)).limit(1);
    return rows[0];
  },

  async create(input: NewGuest): Promise<Guest> {
    const rows = await getDb().insert(guests).values(input).returning();
    return rows[0];
  },

  async update(id: number, patch: GuestUpdate): Promise<Guest | undefined> {
    const rows = await getDb()
      .update(guests)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return rows[0];
  },

  async remove(id: number): Promise<boolean> {
    const rows = await getDb().delete(guests).where(eq(guests.id, id)).returning({ id: guests.id });
    return rows.length > 0;
  },

  /** Writes sort_order = position for each id, in one transaction. */
  reorder(ids: number[]): Promise<void> {
    return getDb().transaction(async (tx) => {
      const now = new Date();
      for (const [sortOrder, id] of ids.entries()) {
        await tx.update(guests).set({ sortOrder, updatedAt: now }).where(eq(guests.id, id));
      }
    });
  },
};

export type GuestsRepo = typeof guestsRepo;
