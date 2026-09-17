import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { StorageAdapter } from "./storage";

// Dev only. Writes under public/uploads (a Compose volume) so Next serves the
// file at /uploads/... with no extra route.
export class LocalDiskStorage implements StorageAdapter {
  async put(path: string, file: File): Promise<{ url: string }> {
    const abs = join(process.cwd(), "public", "uploads", path);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, Buffer.from(await file.arrayBuffer()));
    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    return { url: `${base}/uploads/${path}` };
  }
}
