"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

const TABS = [
  { href: "/admin", label: "Tetamu" },
  { href: "/admin/kad", label: "Kad" },
];

export function Tabs() {
  const pathname = usePathname();
  return (
    <nav className="mt-5 flex gap-6 border-b border-line" aria-label="Bahagian admin">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cx("-mb-px border-b-2 pb-2.5 text-[14px] font-semibold", active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
