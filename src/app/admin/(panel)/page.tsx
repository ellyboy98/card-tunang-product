import { GuestsTab } from "@/components/admin/GuestsTab";
import { guestsService } from "@/server/services/guests.service";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const { guests, totals } = await guestsService.list();
  return <GuestsTab initial={{ guests: guests.map(guestsService.toRow), totals }} />;
}
