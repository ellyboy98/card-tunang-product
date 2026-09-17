// Malay date/time, phone, map and calendar helpers (docs/03 "Derived values").
// Browser-safe: no imports from server/. Month and weekday names are fixed here
// rather than taken from Intl's `ms` locale so output is identical on every runtime.

export const KL_TZ = "Asia/Kuala_Lumpur";

const MONTHS_MS = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const WEEKDAYS_MS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: KL_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
});

export type KlParts = { year: number; month: number; day: number; weekday: number; hour: number; minute: number };

/** Wall-clock components of an instant in Kuala Lumpur time. */
export function klParts(d: Date): KlParts {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(d)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    weekday: WEEKDAY_INDEX[p.weekday] ?? 0,
    hour: Number(p.hour) % 24,
    minute: Number(p.minute),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "Ahad" */
export function formatWeekdayMs(d: Date): string {
  return WEEKDAYS_MS[klParts(d).weekday];
}

/** "14 Mac 2027" */
export function formatDateMs(d: Date): string {
  const p = klParts(d);
  return `${p.day} ${MONTHS_MS[p.month - 1]} ${p.year}`;
}

/** Malay time-of-day word for a 0-23 hour. */
export function timePeriodMs(hour: number): string {
  if (hour < 12) return "pagi";
  if (hour < 14) return "tengah hari";
  if (hour < 19) return "petang";
  return "malam";
}

/** "11:00 pagi" */
export function formatTimeMs(d: Date): string {
  const p = klParts(d);
  const h12 = p.hour % 12 || 12;
  return `${h12}:${pad2(p.minute)} ${timePeriodMs(p.hour)}`;
}

export const DEFAULT_EVENT_HOURS = 3;

/** The event end, or start + 3 h when the admin left it blank. */
export function eventEnd(start: Date, end?: Date | null): Date {
  return end ?? new Date(start.getTime() + DEFAULT_EVENT_HOURS * 3600_000);
}

/** "11:00 pagi hingga 2:00 petang" */
export function formatTimeRangeMs(start: Date, end?: Date | null): string {
  return `${formatTimeMs(start)} hingga ${formatTimeMs(eventEnd(start, end))}`;
}

/** "2027-03-14" in KL time; two instants share a key when they fall on the same KL day. */
export function klDateKey(d: Date): string {
  const p = klParts(d);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

/** ISO instant → "YYYY-MM-DDTHH:mm" in KL time, the value an <input type="datetime-local"> wants. */
export function toKlLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = klParts(d);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
}

/** "YYYY-MM-DDTHH:mm" typed as KL wall-clock → ISO with +08:00 (Malaysia has no DST); null when empty. */
export function fromKlLocalInput(local: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(local);
  return m ? `${m[1]}T${m[2]}:00+08:00` : null;
}

/** Malaysian number to international digits without "+": 0123456789 → 60123456789. */
export function toIntlMy(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `6${digits}`;
  return `60${digits}`;
}

export function whatsappUrl(phone: string): string {
  return `https://wa.me/${toIntlMy(phone)}`;
}

export function telUrl(phone: string): string {
  return `tel:+${toIntlMy(phone)}`;
}

export function mapLinks(lat: number, lng: number): { google: string; waze: string } {
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}

export type CalendarEvent = {
  title: string;
  start: Date;
  end?: Date | null;
  location?: string;
  description?: string;
};

/** 2027-03-14T03:00:00.000Z → 20270314T030000Z */
function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", e.title);
  u.searchParams.set("dates", `${utcStamp(e.start)}/${utcStamp(eventEnd(e.start, e.end))}`);
  if (e.location) u.searchParams.set("location", e.location);
  if (e.description) u.searchParams.set("details", e.description);
  return u.toString();
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** A data: URL that opens as a calendar event on iOS and desktop. */
export function icsDataUrl(e: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kad-tunang//MS",
    "BEGIN:VEVENT",
    `UID:${utcStamp(e.start)}@kad-tunang`,
    `DTSTAMP:${utcStamp(e.start)}`,
    `DTSTART:${utcStamp(e.start)}`,
    `DTEND:${utcStamp(eventEnd(e.start, e.end))}`,
    `SUMMARY:${icsEscape(e.title)}`,
  ];
  if (e.location) lines.push(`LOCATION:${icsEscape(e.location)}`);
  if (e.description) lines.push(`DESCRIPTION:${icsEscape(e.description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)";
const LAT_LNG_PATTERNS = [
  new RegExp(`!3d${NUM}!4d${NUM}`), // Google Maps place pin, more precise than the viewport
  new RegExp(`@${NUM},${NUM}`), // Google Maps viewport
  new RegExp(`(?<![\\d.])${NUM}\\s*,\\s*${NUM}`), // bare pair, ?q=, query=, ll=
];

/** Coordinates from a pasted "lat, lng" or a Google Maps / Waze URL; null when none found. */
export function parseLatLng(text: string): { lat: number; lng: number } | null {
  for (const re of LAT_LNG_PATTERNS) {
    const m = re.exec(text);
    if (!m) continue;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }
  return null;
}
