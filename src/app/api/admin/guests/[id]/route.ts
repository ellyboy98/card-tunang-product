import { NextResponse } from "next/server";
import { guestPatch } from "@/lib/validation";
import { parseId, parseJson, route, type IdContext } from "@/server/http";
import { guestsService } from "@/server/services/guests.service";

export const PATCH = route<IdContext>(async (req, { params }) => {
  const id = parseId((await params).id);
  const patch = await parseJson(req, guestPatch);
  return NextResponse.json(await guestsService.update(id, patch));
});

export const DELETE = route<IdContext>(async (_req, { params }) => {
  await guestsService.remove(parseId((await params).id));
  return NextResponse.json({ ok: true });
});
