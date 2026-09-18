// The one card. Rendered by the public page and, with `preview`, by the admin
// live preview. Server-friendly: no server imports, so a client tree can mount it.
import type { CSSProperties, ReactNode } from "react";
import "./card.css";
import { formatDateMs, formatTimeRangeMs, formatWeekdayMs, googleCalendarUrl, icsDataUrl, mapLinks, splitPatronym, telUrl, whatsappUrl } from "@/lib/format";
import { colorPreset, fontPresetKey, textAccent } from "@/lib/presets";
import type { GuestOption } from "@/lib/types";
import type { SettingsInput } from "@/lib/validation";
import { Arch } from "./Arch";
import { Countdown } from "./Countdown";
import { Cover } from "./Cover";
import { CARD_FONTS } from "./fonts";
import type { PetalOptions } from "./Petals";
import { Rsvp } from "./Rsvp";
import { Sprig } from "./Sprig";

export type CardSettings = SettingsInput;

type Props = {
  settings: CardSettings;
  guests: GuestOption[];
  /** Admin preview: no scroll lock, no network. */
  preview?: boolean;
};

/** The host side's child comes first (docs/05). */
export function coupleNames(s: CardSettings): { first: string; second: string } {
  return s.hostSide === "bride" ? { first: s.brideName, second: s.groomName } : { first: s.groomName, second: s.brideName };
}

/** CSS variables the card theme reads. Unknown keys fall back to the defaults. */
export function presetVars(colorKey: string, fontKey: string): CSSProperties {
  const c = colorPreset(colorKey);
  const f = CARD_FONTS[fontPresetKey(fontKey)];
  return {
    "--c-bg": c.bg,
    "--c-ink": c.ink,
    "--c-accent": c.accent,
    "--c-accent-text": textAccent(c),
    "--c-leaf": c.leaf,
    "--c-soft": c.soft,
    "--f-display": f.display,
    "--f-body": f.body,
  } as CSSProperties;
}

export function cardVars(s: CardSettings): CSSProperties {
  return presetVars(s.colorPreset, s.fontPreset);
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

export function Card({ settings: s, guests, preview }: Props) {
  const { first, second } = coupleNames(s);
  const hostParents = s.hostSide === "bride" ? s.brideParents : s.groomParents;
  const start = s.eventStartAt ? new Date(s.eventStartAt) : null;
  const end = s.eventEndAt ? new Date(s.eventEndAt) : null;
  const hasVenue = Boolean(s.venueName || s.venueAddress);
  const hasMap = s.venueLat != null && s.venueLng != null;
  const showRsvp = s.isRsvpEnabled && (guests.length > 0 || Boolean(preview));
  const coupleLabel = [first, second].filter(Boolean).join(" & ");
  const petals: PetalOptions = { style: s.petalStyle, density: s.petalDensity };

  const sections: ReactNode[] = [];

  if (start) {
    const event = {
      title: [s.title, coupleLabel].filter(Boolean).join(" · "),
      start,
      end,
      location: [s.venueName, s.venueAddress].filter(Boolean).join(", "),
    };
    sections.push(
      <section key="tarikh" className="card__section">
        <h2 className="card__heading">Tarikh</h2>
        <p className="card__weekday card__body">{formatWeekdayMs(start)}</p>
        <p className="card__display card__date">{formatDateMs(start)}</p>
        <p className="card__body">{formatTimeRangeMs(start, end)}</p>
        <Countdown start={s.eventStartAt!} />
        <div className="card__btn-row">
          <a className="card__btn card__btn--outlined" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">
            Google Calendar
          </a>
          <a className="card__btn card__btn--outlined" href={icsDataUrl(event)} download="majlis-pertunangan.ics">
            Apple / .ics
          </a>
        </div>
      </section>,
    );
  }

  if (hasVenue) {
    const links = hasMap ? mapLinks(s.venueLat!, s.venueLng!) : null;
    sections.push(
      <section key="tempat" className="card__section">
        <h2 className="card__heading">Tempat</h2>
        {s.venueName && <p className="card__display card__venue">{s.venueName}</p>}
        {s.venueAddress && <p className="card__body card__address">{s.venueAddress}</p>}
        {links && (
          <div className="card__btn-row">
            <a className="card__btn card__btn--filled" href={links.waze} target="_blank" rel="noreferrer">
              Buka Waze
            </a>
            <a className="card__btn card__btn--outlined" href={links.google} target="_blank" rel="noreferrer">
              Google Maps
            </a>
          </div>
        )}
      </section>,
    );
  }

  if (s.schedule.length > 0) {
    sections.push(
      <section key="aturcara" className="card__section">
        <h2 className="card__heading">Atur cara majlis</h2>
        <ul className="card__schedule">
          {s.schedule.map((row, i) => (
            <li key={i}>
              <span className="card__schedule-time">{row.time}</span>
              <span className="card__schedule-dot" aria-hidden="true" />
              <span className="card__schedule-label">{row.label}</span>
            </li>
          ))}
        </ul>
      </section>,
    );
  }

  if (showRsvp) {
    sections.push(
      <section key="kehadiran" className="card__section">
        <h2 className="card__heading">Kehadiran</h2>
        <p className="card__body">Pilih nama anda dan sahkan kehadiran.</p>
        <Rsvp guests={guests} petals={petals} preview={preview} />
      </section>,
    );
  }

  if (s.contacts.length > 0) {
    sections.push(
      <section key="hubungi" className="card__section">
        <h2 className="card__heading">Hubungi</h2>
        <ul className="card__contacts">
          {s.contacts.map((c, i) => (
            <li key={i} className="card__contact">
              <div>
                <p className="card__contact-name">{c.name}</p>
                {c.relation && <p className="card__contact-rel">{c.relation}</p>}
              </div>
              <div className="card__contact-actions">
                <a className="card__pill" href={whatsappUrl(c.phone)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${c.name}`}>
                  WhatsApp
                </a>
                <a className="card__pill" href={telUrl(c.phone)} aria-label={`Telefon ${c.name}`}>
                  Telefon
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>,
    );
  }

  return (
    <div className={`card${preview ? " card--preview" : ""}`} style={cardVars(s)}>
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

      <Cover title={s.title} names={<Names first={first} second={second} full={false} />} dateLabel={start ? `${formatWeekdayMs(start)}, ${formatDateMs(start)}` : null} musicUrl={s.musicUrl} transition={s.coverTransition} petals={petals} preview={preview} />

      <main className="card__page">
        <header className="card__header">
          <p className="card__eyebrow">{s.title}</p>
          {hostParents && <p className="card__display card__parents">{hostParents}</p>}
          {s.openingText && <p className="card__body card__opening card__muted">{s.openingText}</p>}
          {(first || second) && (
            <div className="card__arch-wrap">
              <Arch />
              <h1 className="card__names">
                <Names first={first} second={second} full />
              </h1>
            </div>
          )}
        </header>

        {sections.flatMap((node, i) => [<Sprig key={`sprig-${i}`} />, node])}

        <footer className="card__closing">
          <Sprig width={90} />
          {s.closingText && <p className="card__closing-text">{s.closingText}</p>}
          {s.hashtag && <p className="card__eyebrow card__hashtag">#{s.hashtag.replace(/^#/, "")}</p>}
        </footer>
      </main>
    </div>
  );
}
