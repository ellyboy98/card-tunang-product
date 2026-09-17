"use client";

import { useEffect, useState } from "react";
import { klDateKey } from "@/lib/format";

const DAY = 86_400_000;
const pad2 = (n: number) => String(n).padStart(2, "0");

export function Countdown({ start }: { start: string }) {
  // `now` is null until mounted so the server and client render the same placeholder.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const startMs = Date.parse(start);
  if (now === null || Number.isNaN(startMs)) {
    return (
      <div className="card__countdown card__countdown--hidden" aria-hidden="true">
        <p className="card__countdown-main">
          <span className="card__countdown-num">000</span> <span className="card__countdown-unit">hari lagi</span>
        </p>
        <p className="card__countdown-sub">00 jam · 00 minit · 00 saat</p>
      </div>
    );
  }

  // Day boundaries follow Kuala Lumpur, whatever the guest's phone is set to.
  const today = klDateKey(new Date(now));
  const eventDay = klDateKey(new Date(startMs));
  if (today === eventDay) {
    return (
      <div className="card__countdown" role="status">
        <p className="card__countdown-state">Hari ini!</p>
      </div>
    );
  }
  if (today > eventDay) {
    return (
      <div className="card__countdown" role="status">
        <p className="card__countdown-state">Terima kasih atas kehadiran</p>
      </div>
    );
  }

  const diff = Math.max(0, startMs - now);
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return (
    <div className="card__countdown">
      <p className="card__countdown-main">
        <span className="card__countdown-num">{days}</span> <span className="card__countdown-unit">hari lagi</span>
      </p>
      <p className="card__countdown-sub">
        {hours} jam · {pad2(minutes)} minit · {pad2(seconds)} saat
      </p>
    </div>
  );
}
