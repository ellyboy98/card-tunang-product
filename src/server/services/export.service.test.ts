import { describe, expect, it } from "vitest";
import type { Guest } from "../db/schema";
import { csvCell, guestsCsv } from "./export.service";

describe("csv", () => {
  it("quotes only what Excel would misread", () => {
    expect(csvCell("Pak Cik Ahmad")).toBe("Pak Cik Ahmad");
    expect(csvCell('Ahmad "Mat" Ali, Klang')).toBe('"Ahmad ""Mat"" Ali, Klang"');
    expect(csvCell("baris 1\nbaris 2")).toBe('"baris 1\nbaris 2"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(0)).toBe("0");
  });

  it("starts with a BOM and keeps Malay characters", () => {
    const row: Guest = {
      id: 1,
      label: "Pak Cik Ahmad sekeluarga",
      groupName: "Keluarga pengantin perempuan",
      pax: 4,
      confirmedPax: 3,
      status: "attending",
      sortOrder: 0,
      isHidden: false,
      note: "Alergi kacang",
      createdAt: new Date("2026-09-17T10:00:00Z"),
      updatedAt: new Date("2026-09-17T10:30:00Z"),
    };
    const csv = guestsCsv([row]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toBe(
      "﻿Kumpulan,Nama,Pax dijemput,Status,Pax hadir,Nota,Dikemaskini\r\n" +
        "Keluarga pengantin perempuan,Pak Cik Ahmad sekeluarga,4,Hadir,3,Alergi kacang,2026-09-17 18:30\r\n",
    );
  });
});
