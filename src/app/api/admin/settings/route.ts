import { NextResponse } from "next/server";
import { settingsInput } from "@/lib/validation";
import { parseJson, route } from "@/server/http";
import { settingsService } from "@/server/services/settings.service";

export const GET = route(async () => NextResponse.json(settingsService.toDto(await settingsService.get())));

export const PUT = route(async (req) => {
  const input = await parseJson(req, settingsInput);
  return NextResponse.json(settingsService.toDto(await settingsService.update(input)));
});
