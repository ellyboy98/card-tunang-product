"use client";

import Link from "next/link";
import { useEffect } from "react";
import { presetVars } from "@/components/card/Card";
import { Sprig } from "@/components/card/Sprig";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card" style={presetVars("blush", "classic")}>
      <main className="card__page card__status">
        <Sprig width={90} />
        <p className="card__eyebrow">Maaf</p>
        <h1 className="card__heading">Sesuatu tidak kena</h1>
        <p className="card__body card__muted">Cuba muat semula halaman ini. Jika masih gagal, hubungi tuan rumah.</p>
        <div className="card__btn-row">
          <button type="button" className="card__btn card__btn--filled" onClick={reset}>
            Cuba lagi
          </button>
          <Link href="/" className="card__btn card__btn--outlined">
            Ke kad jemputan
          </Link>
        </div>
      </main>
    </div>
  );
}
