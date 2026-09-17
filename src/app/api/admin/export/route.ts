import { route } from "@/server/http";
import { exportService } from "@/server/services/export.service";
import { guestsService } from "@/server/services/guests.service";

export const GET = route(async () => {
  const { guests } = await guestsService.list();
  return new Response(exportService.guestsCsv(guests), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportService.csvFilename()}"`,
      "Cache-Control": "no-store",
    },
  });
});
