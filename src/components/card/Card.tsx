// The one card. Rendered by the public page and, with `preview`, by the admin
// live preview. Server-friendly: no server imports, so a client tree can mount it.
import type { CSSProperties, ReactNode } from "react";
import "./card.css";
import { formatDate, formatTimeRange, formatWeekday, googleCalendarUrl, icsDataUrl, mapLinks, splitPatronym, telUrl, whatsappUrl } from "@/lib/format";
import { pick, t, type Lang } from "@/lib/i18n";
import { DEFAULT_FLORAL_PRESET, effectiveColors, FLORAL_PRESETS, floralPresetKey, fontPresetKey, textAccent } from "@/lib/presets";
import type { GuestOption } from "@/lib/types";
import type { SettingsInput } from "@/lib/validation";
import { Arch } from "./Arch";
import { CardMotion } from "./CardMotion";
import { Countdown } from "./Countdown";
import { CoverFace } from "./Cover";
import { coverBlooms } from "./florals";
import { FloralClusters } from "./Florals";
import { CARD_FONTS } from "./fonts";
import { Reveal } from "./Reveal";
import { Rsvp } from "./Rsvp";
import { Sprig } from "./Sprig";

export type CardSettings = SettingsInput;

type Props = {
  settings: CardSettings;
  guests: GuestOption[];
  /** The guest's language: cookie, else the admin's default. */
  lang: Lang;
  /** Admin preview switches the language locally instead of through the cookie. */
  onLangChange?: (lang: Lang) => void;
  /** Admin preview: no scroll lock, no network. */
  preview?: boolean;
};

/** The host side's child comes first (docs/05). */
export function coupleNames(s: CardSettings): { first: string; second: string } {
  return s.hostSide === "bride" ? { first: s.brideName, second: s.groomName } : { first: s.groomName, second: s.brideName };
}

/** CSS variables the card theme reads. Unknown keys fall back to the defaults. */
export function presetVars(colorKey: string, fontKey: string, floralKey: string = DEFAULT_FLORAL_PRESET): CSSProperties {
  const c = effectiveColors(colorKey, floralKey);
  const f = CARD_FONTS[fontPresetKey(fontKey)];
  return {
    "--c-bg": c.bg,
    "--c-ink": c.ink,
    "--c-accent": c.accent,
    "--c-accent-text": textAccent(c),
    "--c-leaf": c.leaf,
    "--c-soft": c.soft,
    "--c-floral-leaf": FLORAL_PRESETS[floralPresetKey(floralKey)].leaf,
    "--f-display": f.display,
    "--f-body": f.body,
  } as CSSProperties;
}

export function cardVars(s: CardSettings): CSSProperties {
  return presetVars(s.colorPreset, s.fontPreset, s.floralPreset);
}

function Name({ name, full }: { name: string; full: boolean }) {
  const { given, patronym } = splitPatronym(name);
  return (
    <span className="card__name">
      {given}
      {full && patronym && <span className="card__patronym">{patronym}</span>}
    </span>
  );
}

function Names({ first, second, full }: { first: string; second: string; full: boolean }) {
  return (
    <>
      {first && <Name name={first} full={full} />}
      {first && second && (
        <span className="card__amp" aria-hidden="true">
          &amp;
        </span>
      )}
      {second && <Name name={second} full={full} />}
    </>
  );
}

export function Card({ settings: s, guests, lang, onLangChange, preview }: Props) {
  const { first, second } = coupleNames(s);
  const hostParents = s.hostSide === "bride" ? s.brideParents : s.groomParents;
  const start = s.eventStartAt ? new Date(s.eventStartAt) : null;
  const end = s.eventEndAt ? new Date(s.eventEndAt) : null;
  const hasVenue = Boolean(s.venueName || s.venueAddress);
  const hasMap = s.venueLat != null && s.venueLng != null;
  const showRsvp = s.isRsvpEnabled && (guests.length > 0 || Boolean(preview));
  const coupleLabel = [first, second].filter(Boolean).join(" & ");
  const title = pick(lang, s.title, s.titleEn);
  const openingText = pick(lang, s.openingText, s.openingTextEn);
  const closingText = pick(lang, s.closingText, s.closingTextEn);

  const sections: ReactNode[] = [];

  if (start) {
    const event = {
      title: [title, coupleLabel].filter(Boolean).join(" · "),
      start,
      end,
      location: [s.venueName, s.venueAddress].filter(Boolean).join(", "),
    };
    sections.push(
      <section key="tarikh" className="card__section">
        <h2 className="card__heading">{t(lang, "card.date")}</h2>
        <p className="card__weekday card__body">{formatWeekday(start, lang)}</p>
        <p className="card__display card__date">{formatDate(start, lang)}</p>
        <p className="card__body">{formatTimeRange(start, end, lang)}</p>
        <Countdown start={s.eventStartAt!} lang={lang} />
        <div className="card__btn-row">
          <a className="card__btn card__btn--outlined" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">
            {t(lang, "card.googleCalendar")}
          </a>
          <a className="card__btn card__btn--outlined" href={icsDataUrl(event)} download="majlis-pertunangan.ics">
            {t(lang, "card.ics")}
          </a>
        </div>
      </section>,
    );
  }

  if (hasVenue) {
    const links = hasMap ? mapLinks(s.venueLat!, s.venueLng!) : null;
    sections.push(
      <section key="tempat" className="card__section">
        <h2 className="card__heading">{t(lang, "card.venue")}</h2>
        {s.venueName && <p className="card__display card__venue">{s.venueName}</p>}
        {s.venueAddress && <p className="card__body card__address">{s.venueAddress}</p>}
        {links && (
          <div className="card__btn-row">
            <a className="card__btn card__btn--filled" href={links.waze} target="_blank" rel="noreferrer">
              {t(lang, "card.waze")}
            </a>
            <a className="card__btn card__btn--outlined" href={links.google} target="_blank" rel="noreferrer">
              {t(lang, "card.googleMaps")}
            </a>
          </div>
        )}
      </section>,
    );
  }

  if (s.schedule.length > 0) {
    sections.push(
      <section key="aturcara" className="card__section">
        <h2 className="card__heading">{t(lang, "card.schedule")}</h2>
        <ul className="card__schedule">
          {s.schedule.map((row, i) => (
            <li key={i} className="card__row" style={{ "--i": i } as CSSProperties}>
              <span className="card__schedule-time">{pick(lang, row.time, row.timeEn)}</span>
              <span className="card__schedule-dot" aria-hidden="true" />
              <span className="card__schedule-label">{pick(lang, row.label, row.labelEn)}</span>
            </li>
          ))}
        </ul>
      </section>,
    );
  }

  if (showRsvp) {
    sections.push(
      <section key="kehadiran" className="card__section">
        <h2 className="card__heading">{t(lang, "card.rsvp")}</h2>
        <p className="card__body">{t(lang, "card.rsvpIntro")}</p>
        <Rsvp guests={guests} lang={lang} preview={preview} />
      </section>,
    );
  }

  if (s.contacts.length > 0) {
    sections.push(
      <section key="hubungi" className="card__section">
        <h2 className="card__heading">{t(lang, "card.contact")}</h2>
        <ul className="card__contacts">
          {s.contacts.map((c, i) => (
            <li key={i} className="card__contact card__row" style={{ "--i": i } as CSSProperties}>
              <div>
                <p className="card__contact-name">{c.name}</p>
                {c.relation && <p className="card__contact-rel">{pick(lang, c.relation, c.relationEn)}</p>}
              </div>
              <div className="card__contact-actions">
                <a className="card__pill" href={whatsappUrl(c.phone)} target="_blank" rel="noreferrer" aria-label={t(lang, "card.whatsappAria", { name: c.name })}>
                  {t(lang, "card.whatsapp")}
                </a>
                <a className="card__pill" href={telUrl(c.phone)} aria-label={t(lang, "card.callAria", { name: c.name })}>
                  {t(lang, "card.call")}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>,
    );
  }

  const floral = floralPresetKey(s.floralPreset);
  const cover = <CoverFace title={title} names={<Names first={first} second={second} full={false} />} dateLabel={start ? `${formatWeekday(start, lang)}, ${formatDate(start, lang)}` : null} floral={floral} lang={lang} />;

  return (
    <CardMotion entrance={s.entrancePreset} wind={s.windPreset} floral={floral} reveal={s.revealPreset} musicUrl={s.musicUrl} lang={lang} onLangChange={onLangChange} preview={preview} style={cardVars(s)} cover={cover} blooms={coverBlooms(floral)}>
      {s.backgroundUrl && (
        <>
          <div className="card__bg" style={{ backgroundImage: `url("${s.backgroundUrl.replace(/"/g, "%22")}")` }} aria-hidden="true" />
          <div className="card__bg-fade" aria-hidden="true" />
        </>
      )}
      <div className="card__decor" aria-hidden="true">
        <span className="card__blob card__blob--a" />
        <span className="card__blob card__blob--b" />
        <span className="card__blob card__blob--c" />
      </div>

      <main className="card__page">
        <div className="card__body">
          <header className="card__header">
            <FloralClusters preset={floral} />
            <div className="card__header-inner">
              <p className="card__eyebrow">{title}</p>
              {hostParents && <p className="card__display card__parents">{hostParents}</p>}
              {openingText && <p className="card__body card__opening card__muted">{openingText}</p>}
              {(first || second) && (
                <div className="card__arch-wrap">
                  <Arch />
                  <h1 className="card__names">
                    <Names first={first} second={second} full />
                  </h1>
                </div>
              )}
            </div>
          </header>

          {sections.map((node, i) => (
            <Reveal key={i} side={i % 2 ? -1 : 1}>
              <Sprig />
              {node}
            </Reveal>
          ))}

          <Reveal side={sections.length % 2 ? -1 : 1}>
            <footer className="card__closing card__section">
              <Sprig width={90} />
              {closingText && <p className="card__closing-text">{closingText}</p>}
              {s.hashtag && <p className="card__eyebrow card__hashtag">#{s.hashtag.replace(/^#/, "")}</p>}
            </footer>
          </Reveal>
        </div>
      </main>
    </CardMotion>
  );
}
