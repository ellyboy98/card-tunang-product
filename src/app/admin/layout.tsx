import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminLang } from "@/components/admin/i18n";
import { cormorant, nunitoSans } from "@/components/card/fonts";
import { ADMIN_LANG_COOKIE, langKey } from "@/lib/i18n";

export const metadata: Metadata = { title: "Admin · Kad Tunang", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const lang = langKey((await cookies()).get(ADMIN_LANG_COOKIE)?.value);
  return (
    <AdminLang lang={lang}>
      <div lang={lang} className={`${nunitoSans.variable} ${cormorant.variable} min-h-screen bg-paper font-sans text-[14px] text-ink`}>
        {children}
      </div>
    </AdminLang>
  );
}
