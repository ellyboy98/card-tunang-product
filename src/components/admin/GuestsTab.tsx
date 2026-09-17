"use client";

import { useCallback, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { api, errorMessage } from "@/lib/api";
import type { GuestRow, Totals } from "@/lib/types";
import { RSVP_STATUSES, type RsvpStatus } from "@/lib/validation";
import { Button, buttonClass, cx, Input, inputClass, Notice, Panel } from "./ui";

export type GuestList = { guests: GuestRow[]; totals: Totals };

const STATUS_LABEL: Record<RsvpStatus, string> = { pending: "Belum jawab", attending: "Hadir", declined: "Tidak hadir" };
const STATUS_CLASS: Record<RsvpStatus, string> = {
  pending: "bg-line/70 text-ink",
  attending: "bg-[#DDE7DA] text-success",
  declined: "bg-[#F1DDDF] text-danger",
};

/** Same order the repository uses: group, manual order, then label. */
function sortGuests(rows: GuestRow[]): GuestRow[] {
  return [...rows].sort((a, b) => a.groupName.localeCompare(b.groupName) || a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function GuestsTab({ initial }: { initial: GuestList }) {
  const [guests, setGuests] = useState(initial.guests);
  const [totals, setTotals] = useState(initial.totals);
  const [error, setError] = useState<string | null>(null);
  const groups = Array.from(new Set(guests.map((g) => g.groupName))).sort();

  const refresh = useCallback(async () => {
    const data = await api<GuestList>("/api/admin/guests");
    setGuests(data.guests);
    setTotals(data.totals);
  }, []);

  // Optimistic: apply locally, send, then take the server's list (which carries the totals).
  async function mutate(optimistic: (rows: GuestRow[]) => GuestRow[], request: () => Promise<unknown>) {
    const previous = guests;
    setError(null);
    setGuests(sortGuests(optimistic(previous)));
    try {
      await request();
      await refresh();
    } catch (e) {
      setGuests(previous);
      setError(errorMessage(e, "Tidak dapat menyimpan perubahan."));
    }
  }

  const patch = (g: GuestRow, p: Partial<GuestRow>) =>
    mutate(
      (rows) => rows.map((r) => (r.id === g.id ? { ...r, ...p } : r)),
      () => api(`/api/admin/guests/${g.id}`, { method: "PATCH", json: p }),
    );

  const remove = (g: GuestRow) => {
    if (!window.confirm(`Padam "${g.label}"? Tindakan ini tidak boleh dibatalkan.`)) return;
    void mutate(
      (rows) => rows.filter((r) => r.id !== g.id),
      () => api(`/api/admin/guests/${g.id}`, { method: "DELETE" }),
    );
  };

  const move = (g: GuestRow, dir: -1 | 1) => {
    const ids = guests.filter((r) => r.groupName === g.groupName).map((r) => r.id);
    const i = ids.indexOf(g.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    void mutate(
      (rows) => rows.map((r) => (ids.includes(r.id) ? { ...r, sortOrder: ids.indexOf(r.id) } : r)),
      () => api("/api/admin/guests/reorder", { method: "POST", json: { ids } }),
    );
  };

  // Add form. The group stays filled so consecutive households go in fast.
  const [draft, setDraft] = useState({ label: "", groupName: "", pax: "1" });
  const [adding, setAdding] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAdding(true);
    try {
      await api("/api/admin/guests", {
        method: "POST",
        json: { label: draft.label, groupName: draft.groupName.trim() || undefined, pax: Number(draft.pax) },
      });
      setDraft((d) => ({ ...d, label: "", pax: "1" }));
      await refresh();
      labelRef.current?.focus();
    } catch (err) {
      setError(errorMessage(err, "Tidak dapat menambah tetamu."));
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <Panel>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Pax dijemput" value={totals.invited} hint={`${totals.households} isi rumah`} />
          <Stat label="Hadir" value={totals.attending} tone="success" />
          <Stat label="Tidak hadir" value={totals.declined} />
          <Stat label="Belum jawab" value={totals.pending} />
        </dl>
      </Panel>

      <Panel title="Tambah tetamu">
        <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_80px_auto] sm:items-end">
          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            Nama
            <Input ref={labelRef} required maxLength={120} placeholder="Pak Cik Ahmad (Klang) sekeluarga" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            Kumpulan
            <Input list="guest-groups" maxLength={60} placeholder="Lain-lain" value={draft.groupName} onChange={(e) => setDraft({ ...draft, groupName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            Pax
            <Input type="number" inputMode="numeric" min={1} max={50} required value={draft.pax} onChange={(e) => setDraft({ ...draft, pax: e.target.value })} />
          </label>
          <Button type="submit" variant="primary" disabled={adding}>
            Tambah
          </Button>
        </form>
        <datalist id="guest-groups">
          {groups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </Panel>

      <Panel
        title="Senarai tetamu"
        actions={
          <a href="/api/admin/export" download className={buttonClass("secondary", "sm")}>
            Muat turun CSV
          </a>
        }
      >
        {error && (
          <div className="mb-3">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
        {guests.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted">Belum ada tetamu. Tambah isi rumah pertama di atas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="py-2 pr-3 font-semibold">Nama</th>
                  <th className="py-2 pr-3 font-semibold">Kumpulan</th>
                  <th className="py-2 pr-3 font-semibold">Pax</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Hadir</th>
                  <th className="py-2 font-semibold">
                    <span className="sr-only">Tindakan</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g, i) => {
                  const prev = guests[i - 1];
                  const next = guests[i + 1];
                  return (
                    <GuestTableRow
                      key={g.id}
                      g={g}
                      canUp={!!prev && prev.groupName === g.groupName}
                      canDown={!!next && next.groupName === g.groupName}
                      onPatch={(p) => patch(g, p)}
                      onMove={(dir) => move(g, dir)}
                      onRemove={() => remove(g)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: "success" }) {
  return (
    <div>
      <dt className="text-[12px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className={cx("mt-1 text-[28px] font-semibold leading-none tabular-nums", tone === "success" && "text-success")}>{value}</dd>
      {hint && <dd className="mt-1 text-[12px] text-muted">{hint}</dd>}
    </div>
  );
}

function GuestTableRow({
  g,
  canUp,
  canDown,
  onPatch,
  onMove,
  onRemove,
}: {
  g: GuestRow;
  canUp: boolean;
  canDown: boolean;
  onPatch: (p: Partial<GuestRow>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <tr className={cx("border-b border-line/70 align-middle", g.isHidden && "opacity-50")}>
      <td className="py-2 pr-3">
        <EditableName value={g.label} onCommit={(label) => onPatch({ label })} />
        {g.isHidden && <span className="ml-1 text-[12px] text-muted">(disembunyi)</span>}
      </td>
      <td className="w-[220px] py-2 pr-3">
        <BlurInput list="guest-groups" maxLength={60} value={g.groupName} aria-label={`Kumpulan untuk ${g.label}`} onCommit={(v) => (v.trim() ? onPatch({ groupName: v.trim() }) : false)} />
      </td>
      <td className="w-[80px] py-2 pr-3">
        <BlurInput
          type="number"
          inputMode="numeric"
          min={1}
          max={50}
          value={String(g.pax)}
          aria-label={`Pax untuk ${g.label}`}
          onCommit={(v) => {
            const pax = Number(v);
            if (!Number.isInteger(pax) || pax < 1 || pax > 50) return false;
            onPatch({ pax });
          }}
        />
      </td>
      <td className="w-[150px] py-2 pr-3">
        <select
          value={g.status}
          onChange={(e) => onPatch({ status: e.target.value as RsvpStatus })}
          aria-label={`Status untuk ${g.label}`}
          className={cx("h-[28px] rounded-full border-0 px-3 text-[12px] font-semibold", STATUS_CLASS[g.status])}
        >
          {RSVP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="w-[70px] py-2 pr-3 tabular-nums">{g.confirmedPax ?? "–"}</td>
      <td className="whitespace-nowrap py-2 text-right">
        <Button size="sm" variant="ghost" aria-label="Naik" title="Naik" disabled={!canUp} onClick={() => onMove(-1)}>
          ↑
        </Button>
        <Button size="sm" variant="ghost" aria-label="Turun" title="Turun" disabled={!canDown} onClick={() => onMove(1)}>
          ↓
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onPatch({ isHidden: !g.isHidden })}>
          {g.isHidden ? "Tunjuk" : "Sembunyi"}
        </Button>
        <Button size="sm" variant="ghost" className="text-danger" onClick={onRemove}>
          Padam
        </Button>
      </td>
    </tr>
  );
}

/** Click-to-edit text. Enter or blur saves, Escape cancels. */
function EditableName({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          cancelled.current = false;
          setEditing(true);
        }}
        className="text-left font-medium underline-offset-2 hover:underline hover:decoration-accent"
        title="Klik untuk mengubah nama"
      >
        {value}
      </button>
    );
  }

  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (!cancelled.current && v && v !== value) onCommit(v);
  };

  return (
    <input
      autoFocus
      value={draft}
      maxLength={120}
      aria-label="Nama"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          cancelled.current = true;
          setEditing(false);
        }
      }}
      className={cx(inputClass, "h-[28px]")}
    />
  );
}

/** Input that commits on blur or Enter. `onCommit` may return false to reject and restore the old value. */
function BlurInput({ value, onCommit, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & { value: string; onCommit: (v: string) => boolean | void }) {
  const [local, setLocal] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    // Parent changed it (server refresh); adopt it without an effect.
    setLastValue(value);
    setLocal(value);
  }
  const commit = () => {
    if (local === value) return;
    if (onCommit(local) === false) setLocal(value);
  };
  return (
    <input
      {...props}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setLocal(value);
      }}
      className={cx(inputClass, "h-[28px]", className)}
    />
  );
}
