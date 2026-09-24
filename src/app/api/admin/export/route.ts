import { requestLang, route } from "@/server/http";
import { exportService } from "@/server/services/export.service";
import { guestsService } from "@/server/services/guests.service";

export const GET = route(async (req) => {
  const lang = requestLang(req);
  const { guests } = await guestsService.list();
  return new Response(exportService.guestsCsv(guests, lang), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportService.csvFilename(new Date(), lang)}"`,
      "Cache-Control": "no-store",
    },
  });
});
