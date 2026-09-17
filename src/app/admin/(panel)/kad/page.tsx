import { CardTab } from "@/components/admin/CardTab";
import { settingsService } from "@/server/services/settings.service";

export const dynamic = "force-dynamic";

export default async function KadPage() {
  const dto = settingsService.toDto(await settingsService.get());
  return <CardTab initial={dto} />;
}
