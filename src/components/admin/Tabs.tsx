"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StringKey } from "@/lib/i18n";
import { useT } from "./i18n";
import { cx } from "./ui";

const TABS: Array<{ href: string; label: StringKey }> = [
  { href: "/admin", label: "a.tabGuests" },
  { href: "/admin/kad", label: "a.tabCard" },
];

export function Tabs() {
  const pathname = usePathname();
  const { t } = useT();
  return (
    <nav className="mt-5 flex gap-6 border-b border-line" aria-label={t("a.tabs")}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cx("-mb-px border-b-2 pb-2.5 text-[14px] font-semibold", active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            {t(tab.label)}
          </Link>
        );
      })}
    </nav>
  );
}
