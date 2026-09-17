import { NextResponse } from "next/server";
import { rsvpInput } from "@/lib/validation";
import { parseId, parseJson, route } from "@/server/http";
import { rsvpService } from "@/server/services/rsvp.service";

const noStore = { headers: { "Cache-Control": "no-store" } };

export const GET = route(async (req) => {
  const guestId = parseId(req.nextUrl.searchParams.get("guestId"));
  return NextResponse.json(await rsvpService.getStatus(guestId), noStore);
});

// The only public write. The service clamps pax and rejects hidden guests or a closed RSVP.
export const POST = route(async (req) => {
  const input = await parseJson(req, rsvpInput);
  return NextResponse.json(await rsvpService.respond(input), noStore);
});
