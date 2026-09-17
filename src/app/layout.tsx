import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kad Tunang",
  description: "Kad jemputan majlis pertunangan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="antialiased">{children}</body>
    </html>
  );
}
