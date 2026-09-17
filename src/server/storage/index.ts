import { LocalDiskStorage } from "./local-disk";
import type { StorageAdapter } from "./storage";
import { VercelBlobStorage } from "./vercel-blob";

export type { StorageAdapter } from "./storage";

/** STORAGE_DRIVER wins; otherwise Blob when its token is present, else local disk. */
export function getStorage(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER ?? (process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "local");
  return driver === "vercel-blob" ? new VercelBlobStorage() : new LocalDiskStorage();
}
