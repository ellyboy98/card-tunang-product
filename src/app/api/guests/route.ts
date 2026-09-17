import { NextResponse } from "next/server";
import { route } from "@/server/http";
import { guestsService } from "@/server/services/guests.service";

// Dropdown data for the card. Only id, label and groupName; never pax, status or note.
export const GET = route(async () =>
  NextResponse.json(await guestsService.listForDropdown(), { headers: { "Cache-Control": "no-store" } }),
);
