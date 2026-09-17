import { describe, expect, it } from "vitest";
import {
  formatDateMs,
  formatTimeMs,
  formatTimeRangeMs,
  formatWeekdayMs,
  googleCalendarUrl,
  icsDataUrl,
  klDateKey,
  mapLinks,
  parseLatLng,
  timePeriodMs,
  toIntlMy,
} from "./format";

// 2027-03-14 11:00 in Kuala Lumpur (UTC+8) is 03:00 UTC.
const kl = (iso: string) => new Date(`${iso}+08:00`);

describe("Malay date", () => {
  it("names weekday and month in Malay", () => {
    expect(formatWeekdayMs(kl("2027-03-14T11:00:00"))).toBe("Ahad");
    expect(formatDateMs(kl("2027-03-14T11:00:00"))).toBe("14 Mac 2027");
    expect(formatDateMs(kl("2027-08-01T09:00:00"))).toBe("1 Ogos 2027");
  });

  it("uses the KL day, not the UTC day", () => {
    // 23:30 UTC on the 13th is 07:30 on the 14th in KL.
    const d = new Date("2027-03-13T23:30:00Z");
    expect(formatDateMs(d)).toBe("14 Mac 2027");
    expect(klDateKey(d)).toBe("2027-03-14");
  });
});

describe("Malay time", () => {
  it("switches period on the hour boundaries", () => {
    expect(formatTimeMs(kl("2027-03-14T11:59:00"))).toBe("11:59 pagi");
    expect(formatTimeMs(kl("2027-03-14T12:00:00"))).toBe("12:00 tengah hari");
    expect(formatTimeMs(kl("2027-03-14T15:00:00"))).toBe("3:00 petang");
    expect(formatTimeMs(kl("2027-03-14T19:00:00"))).toBe("7:00 malam");
    expect(formatTimeMs(kl("2027-03-14T00:05:00"))).toBe("12:05 pagi");
  });

  it("maps every hour to a period", () => {
    expect(timePeriodMs(0)).toBe("pagi");
    expect(timePeriodMs(13)).toBe("tengah hari");
    expect(timePeriodMs(14)).toBe("petang");
    expect(timePeriodMs(23)).toBe("malam");
  });

  it("defaults the range end to start + 3 h", () => {
    expect(formatTimeRangeMs(kl("2027-03-14T11:00:00"))).toBe("11:00 pagi hingga 2:00 petang");
    expect(formatTimeRangeMs(kl("2027-03-14T11:00:00"), kl("2027-03-14T16:00:00"))).toBe("11:00 pagi hingga 4:00 petang");
  });
});

describe("phone normalisation", () => {
  it("produces 60XXXXXXXXX from every common way of writing it", () => {
    expect(toIntlMy("0123456789")).toBe("60123456789");
    expect(toIntlMy("+60123456789")).toBe("60123456789");
    expect(toIntlMy("60123456789")).toBe("60123456789");
    expect(toIntlMy("012-345 6789")).toBe("60123456789");
  });
});

describe("links", () => {
  it("builds Google Maps and Waze deep links", () => {
    expect(mapLinks(3.139, 101.6869)).toEqual({
      google: "https://www.google.com/maps/search/?api=1&query=3.139,101.6869",
      waze: "https://waze.com/ul?ll=3.139,101.6869&navigate=yes",
    });
  });

  it("builds calendar links in UTC", () => {
    const url = new URL(googleCalendarUrl({ title: "Majlis", start: kl("2027-03-14T11:00:00") }));
    expect(url.searchParams.get("dates")).toBe("20270314T030000Z/20270314T060000Z");
    const ics = decodeURIComponent(icsDataUrl({ title: "A, B; C", start: kl("2027-03-14T11:00:00") }).split(",").slice(1).join(","));
    expect(ics).toContain("DTSTART:20270314T030000Z");
    expect(ics).toContain("SUMMARY:A\\, B\; C");
  });
});

describe("parseLatLng", () => {
  it("reads a bare pair", () => {
    expect(parseLatLng("3.1390, 101.6869")).toEqual({ lat: 3.139, lng: 101.6869 });
    expect(parseLatLng("-3.1,101.6")).toEqual({ lat: -3.1, lng: 101.6 });
  });

  it("reads Google Maps and Waze URLs", () => {
    expect(parseLatLng("https://www.google.com/maps/place/KLCC/@3.1578,101.7119,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d3.1579!4d101.7123")).toEqual({ lat: 3.1579, lng: 101.7123 });
    expect(parseLatLng("https://www.google.com/maps/@3.1578,101.7119,15z")).toEqual({ lat: 3.1578, lng: 101.7119 });
    expect(parseLatLng("https://www.google.com/maps/search/?api=1&query=3.1578,101.7119")).toEqual({ lat: 3.1578, lng: 101.7119 });
    expect(parseLatLng("https://waze.com/ul?ll=3.1578,101.7119&navigate=yes")).toEqual({ lat: 3.1578, lng: 101.7119 });
  });

  it("returns null for anything else", () => {
    expect(parseLatLng("https://maps.app.goo.gl/AbCdEf")).toBeNull();
    expect(parseLatLng("Dewan Seri Melati")).toBeNull();
    expect(parseLatLng("120.5, 30.1")).toBeNull();
  });
});
