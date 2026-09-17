// Drizzle queries for the single settings row (id = 1).
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { settings, type NewSettings, type Settings } from "../db/schema";

export type SettingsUpdate = Partial<Omit<NewSettings, "id" | "updatedAt">>;

export const settingsRepo = {
  async get(): Promise<Settings | undefined> {
    const rows = await getDb().select().from(settings).where(eq(settings.id, 1)).limit(1);
    return rows[0];
  },

  /** Inserts the default row. A no-op if two first requests race. */
  async insertDefault(): Promise<void> {
    await getDb().insert(settings).values({ id: 1 }).onConflictDoNothing();
  },

  async update(patch: SettingsUpdate): Promise<Settings | undefined> {
    const rows = await getDb()
      .update(settings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(settings.id, 1))
      .returning();
    return rows[0];
  },
};

export type SettingsRepo = typeof settingsRepo;
