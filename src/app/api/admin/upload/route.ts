import { NextResponse } from "next/server";
import { HttpError } from "@/server/errors";
import { route } from "@/server/http";
import { uploadService } from "@/server/services/upload.service";

export const POST = route(async (req) => {
  const form = await req.formData().catch(() => null);
  const kind = form?.get("kind");
  const file = form?.get("file");
  if (typeof kind !== "string" || !uploadService.isUploadKind(kind) || !(file instanceof File)) {
    throw new HttpError(400, "Medan kind (music|background) dan file diperlukan");
  }
  return NextResponse.json(await uploadService.upload(kind, file));
});
