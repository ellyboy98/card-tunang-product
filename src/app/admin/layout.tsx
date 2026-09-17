import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · Kad Tunang", robots: { index: false } };

const ADMIN_FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Nunito+Sans:wght@400;600;700&display=swap";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={ADMIN_FONTS} precedence="default" />
      <div className="min-h-screen bg-paper font-sans text-[14px] text-ink">{children}</div>
    </>
  );
}
