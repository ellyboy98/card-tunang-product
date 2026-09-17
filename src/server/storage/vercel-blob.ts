import { put } from "@vercel/blob";
import type { StorageAdapter } from "./storage";

export class VercelBlobStorage implements StorageAdapter {
  async put(path: string, file: File): Promise<{ url: string }> {
    const blob = await put(path, file, { access: "public", addRandomSuffix: false, contentType: file.type });
    return { url: blob.url };
  }
}
