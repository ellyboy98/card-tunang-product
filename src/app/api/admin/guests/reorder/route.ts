import { NextResponse } from "next/server";
import { reorderInput } from "@/lib/validation";
import { parseJson, route } from "@/server/http";
import { guestsService } from "@/server/services/guests.service";

export const POST = route(async (req) => {
  const { ids } = await parseJson(req, reorderInput);
  await guestsService.reorder(ids);
  return NextResponse.json({ ok: true });
});
