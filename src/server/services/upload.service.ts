// MIME and size rules from docs/04. File names are generated; the client's is never used.
import { HttpError } from "../errors";
import { getStorage, type StorageAdapter } from "../storage";

export const UPLOAD_KINDS = ["music", "background"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

const MB = 1024 * 1024;

const RULES: Record<UploadKind, { maxBytes: number; ext: Record<string, string> }> = {
  // Some browsers label .mp3 as audio/mp3; both are the same format.
  music: { maxBytes: 3 * MB, ext: { "audio/mpeg": "mp3", "audio/mp3": "mp3" } },
  background: { maxBytes: 2 * MB, ext: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } },
};

export function isUploadKind(kind: string): kind is UploadKind {
  return (UPLOAD_KINDS as readonly string[]).includes(kind);
}

export async function upload(kind: UploadKind, file: File, storage: StorageAdapter = getStorage()): Promise<{ url: string }> {
  const rule = RULES[kind];
  const ext = rule.ext[file.type];
  if (!ext) throw new HttpError(415, "Format fail tidak disokong");
  if (file.size === 0) throw new HttpError(400, "Fail kosong");
  if (file.size > rule.maxBytes) throw new HttpError(413, `Fail terlalu besar (had ${rule.maxBytes / MB} MB)`);
  return storage.put(`${kind}/${Date.now()}.${ext}`, file);
}

export const uploadService = { upload, isUploadKind };
