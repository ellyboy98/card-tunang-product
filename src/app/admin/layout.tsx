import type { Metadata } from "next";
import { cormorant, nunitoSans } from "@/components/card/fonts";

export const metadata: Metadata = { title: "Admin · Kad Tunang", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${nunitoSans.variable} ${cormorant.variable} min-h-screen bg-paper font-sans text-[14px] text-ink`}>{children}</div>;
}
