import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

// One client per process. Cached on globalThis so Next's dev-mode module reloads
// don't open a new pool each time; created lazily so importing a service in a unit
// test never needs DATABASE_URL.
const globalForDb = globalThis as unknown as { __kadDb?: Db };

export function getDb(): Db {
  if (globalForDb.__kadDb) return globalForDb.__kadDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, {
    // Serverless functions each hold their own pool; keep it to one connection.
    max: process.env.VERCEL ? 1 : 10,
    // Neon's pooled endpoint sits behind PgBouncer in transaction mode.
    prepare: false,
  });
  globalForDb.__kadDb = drizzle(client, { schema });
  return globalForDb.__kadDb;
}
