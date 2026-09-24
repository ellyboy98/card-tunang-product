"use client";

import { useEffect, useState } from "react";
import { klDateKey } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";

const DAY = 86_400_000;
const pad2 = (n: number) => String(n).padStart(2, "0");

export function Countdown({ start, lang }: { start: string; lang: Lang }) {
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
          <span className="card__countdown-num">000</span> <span className="card__countdown-unit">{t(lang, "countdown.daysLeft")}</span>
        </p>
        <p className="card__countdown-sub">
          00 {t(lang, "countdown.hours")} · 00 {t(lang, "countdown.minutes")} · 00 {t(lang, "countdown.seconds")}
        </p>
      </div>
    );
  }

  // Day boundaries follow Kuala Lumpur, whatever the guest's phone is set to.
  const today = klDateKey(new Date(now));
  const eventDay = klDateKey(new Date(startMs));
  if (today === eventDay) {
    return (
      <div className="card__countdown" role="status">
        <p className="card__countdown-state">{t(lang, "countdown.today")}</p>
      </div>
    );
  }
  if (today > eventDay) {
    return (
      <div className="card__countdown" role="status">
        <p className="card__countdown-state">{t(lang, "countdown.after")}</p>
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
        <span className="card__countdown-num">
          <Tick value={String(days)} />
        </span>{" "}
        <span className="card__countdown-unit">{t(lang, "countdown.daysLeft")}</span>
      </p>
      <p className="card__countdown-sub">
        <Tick value={String(hours)} /> {t(lang, "countdown.hours")} · <Tick value={pad2(minutes)} /> {t(lang, "countdown.minutes")} · <Tick value={pad2(seconds)} /> {t(lang, "countdown.seconds")}
      </p>
    </div>
  );
}

// A new key remounts the span, so the digit fades in; the width is fixed by CSS so nothing shifts.
function Tick({ value }: { value: string }) {
  return (
    <span key={value} className="card__tick" style={{ minWidth: `${value.length}ch` }}>
      {value}
    </span>
  );
}
