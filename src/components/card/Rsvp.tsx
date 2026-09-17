"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { GuestOption, RsvpState } from "@/lib/types";

type Props = {
  guests: GuestOption[];
  /** Admin preview: no network, a fixed sample state. */
  preview?: boolean;
};

type Result = { kind: "ok"; state: RsvpState } | { kind: "error" } | null;

const PREVIEW_STATE: Omit<RsvpState, "id" | "label"> = { pax: 4, status: "pending", confirmedPax: null };

export function Rsvp({ guests, preview }: Props) {
  const [guestId, setGuestId] = useState("");
  const [state, setState] = useState<RsvpState | null>(null);
  const [loading, setLoading] = useState(false);
  const [pax, setPax] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const groups = new Map<string, GuestOption[]>();
  for (const g of guests) groups.set(g.groupName, [...(groups.get(g.groupName) ?? []), g]);

  async function select(id: string) {
    setGuestId(id);
    setResult(null);
    setState(null);
    if (!id) return;
    const option = guests.find((g) => String(g.id) === id);
    if (preview && option) {
      const s = { id: option.id, label: option.label, ...PREVIEW_STATE };
      setState(s);
      setPax(s.pax);
      return;
    }
    setLoading(true);
    try {
      const s = await api<RsvpState>(`/api/rsvp?guestId=${id}`);
      setState(s);
      setPax(s.confirmedPax || s.pax);
    } catch {
      setResult({ kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function respond(status: "attending" | "declined") {
    if (!state) return;
    setSubmitting(true);
    setResult(null);
    try {
      const next = preview
        ? { ...state, status, confirmedPax: status === "attending" ? pax : 0 }
        : await api<RsvpState>("/api/rsvp", { method: "POST", json: { guestId: state.id, status, pax } });
      setState(next);
      setResult({ kind: "ok", state: next });
    } catch {
      setResult({ kind: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const answered = state && state.status !== "pending";
  const done = result?.kind === "ok";

  return (
    <div className="card__form">
      <label className="card__label" htmlFor="rsvp-guest">
        Nama
      </label>
      <div className="card__select-wrap">
        <select id="rsvp-guest" className="card__field" value={guestId} onChange={(e) => select(e.target.value)} disabled={loading}>
          <option value="">Pilih nama anda…</option>
          {[...groups.entries()].map(([group, list]) => (
            <optgroup key={group} label={group}>
              {list.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg className={`card__select-icon${done ? " card__select-icon--done" : ""}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          {done ? (
            <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M4 6.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </div>
      {!state && (
        <p className="card__hint">
          Senarai disusun mengikut keluarga:
          <br />
          {[...groups.keys()].join(" · ")}
        </p>
      )}

      {result?.kind === "ok" && (
        <p className="card__notice card__notice--sage" role="status">
          <strong>{result.state.status === "attending" ? `Terima kasih! Kehadiran ${result.state.confirmedPax} orang telah disahkan.` : "Terima kasih atas maklum balas anda."}</strong>
          <small>Anda boleh mengubahnya di bawah jika ada perubahan.</small>
        </p>
      )}
      {result?.kind === "error" && (
        <p className="card__notice card__notice--rose" role="alert">
          Tidak dapat menghantar. Cuba lagi atau hubungi kami.
        </p>
      )}
      {state && !done && answered && (
        <p className="card__notice card__notice--soft" role="status">
          <strong>{state.status === "attending" ? `Sudah disahkan: hadir, ${state.confirmedPax} orang.` : "Sudah disahkan: tidak dapat hadir."}</strong>
          <small>Anda boleh mengubahnya di bawah.</small>
        </p>
      )}

      {state && (
        <>
          <p className="card__invite">Jemputan untuk {state.pax} orang</p>
          <label className="card__label" htmlFor="rsvp-pax">
            Bilangan yang akan hadir
          </label>
          <div className="card__select-wrap">
            <select id="rsvp-pax" className="card__field" value={pax} onChange={(e) => setPax(Number(e.target.value))}>
              {Array.from({ length: state.pax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} orang
                </option>
              ))}
            </select>
            <svg className="card__select-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 6.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="card__btn-row">
            <button type="button" className="card__btn card__btn--filled card__btn--half" disabled={submitting} onClick={() => respond("attending")}>
              Hadir
            </button>
            <button type="button" className="card__btn card__btn--outlined card__btn--half" disabled={submitting} onClick={() => respond("declined")}>
              Tidak dapat hadir
            </button>
          </div>
        </>
      )}
    </div>
  );
}
