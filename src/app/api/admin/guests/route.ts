import { NextResponse } from "next/server";
import { guestInput } from "@/lib/validation";
import { parseJson, route } from "@/server/http";
import { guestsService } from "@/server/services/guests.service";

export const GET = route(async () => NextResponse.json(await guestsService.list()));

export const POST = route(async (req) => {
  const input = await parseJson(req, guestInput);
  return NextResponse.json(await guestsService.create(input), { status: 201 });
});
