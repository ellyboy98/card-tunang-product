import { cookies } from "next/headers";
import { AdminLangSwitch } from "@/components/admin/AdminLangSwitch";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Tabs } from "@/components/admin/Tabs";
import { buttonClass } from "@/components/admin/ui";
import { ADMIN_LANG_COOKIE, langKey, t } from "@/lib/i18n";
import { settingsService } from "@/server/services/settings.service";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [s, cookieStore] = await Promise.all([settingsService.get(), cookies()]);
  const lang = langKey(cookieStore.get(ADMIN_LANG_COOKIE)?.value);
  const couple = [s.brideName, s.groomName].filter(Boolean).join(" & ") || s.title;
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[26px] italic leading-tight">
          {couple} <span className="font-sans text-[14px] not-italic text-muted">· {t(lang, "a.admin")}</span>
        </h1>
        <div className="flex items-center gap-3">
          <AdminLangSwitch />
          <a href="/" target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
            {t(lang, "a.viewCard")}
          </a>
          <LogoutButton />
        </div>
      </header>
      <Tabs />
      <main className="mt-6 space-y-6">{children}</main>
    </div>
  );
}
