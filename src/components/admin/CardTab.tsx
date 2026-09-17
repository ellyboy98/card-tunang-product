"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { formatDateMs, fromKlLocalInput, parseLatLng, toKlLocalInput } from "@/lib/format";
import { COLOR_PRESET_KEYS, COLOR_PRESETS, FONT_PRESET_KEYS, FONT_PRESETS } from "@/lib/presets";
import type { SettingsDto } from "@/lib/types";
import { issueMap, settingsInput, type Contact, type ScheduleItem, type SettingsInput } from "@/lib/validation";
import { CardPreview } from "./CardPreview";
import { ListEditor } from "./ListEditor";
import { Button, cx, Field, Input, Notice, Panel, Select, Textarea } from "./ui";
import { UploadZone } from "./UploadZone";

function stripMeta({ updatedAt: _updatedAt, ...form }: SettingsDto): SettingsInput {
  void _updatedAt;
  return form;
}

export function CardTab({ initial }: { initial: SettingsDto }) {
  const router = useRouter();
  const [form, setForm] = useState<SettingsInput>(() => stripMeta(initial));
  const [savedAt, setSavedAt] = useState(initial.updatedAt);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [coordText, setCoordText] = useState(initial.venueLat != null && initial.venueLng != null ? `${initial.venueLat}, ${initial.venueLng}` : "");

  const setMany = (patch: Partial<SettingsInput>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };
  const set = <K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) => setMany({ [key]: value });

  // Once a save has surfaced errors, keep re-validating so they clear as the admin types.
  useEffect(() => {
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const r = settingsInput.safeParse(form);
      return r.success ? {} : issueMap(r.error);
    });
  }, [form]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaveError(null);
    const parsed = settingsInput.safeParse(form);
    if (!parsed.success) {
      setErrors(issueMap(parsed.error));
      return;
    }
    setSaving(true);
    try {
      const dto = await api<SettingsDto>("/api/admin/settings", { method: "PUT", json: parsed.data });
      setForm(stripMeta(dto));
      setSavedAt(dto.updatedAt);
      setDirty(false);
      setErrors({});
      router.refresh(); // the header shows the couple's names
    } catch (e) {
      setSaveError(errorMessage(e, "Tidak dapat menyimpan."));
    } finally {
      setSaving(false);
    }
  }

  function onCoords(text: string) {
    setCoordText(text);
    const found = text.trim() ? parseLatLng(text) : null;
    setMany({ venueLat: found?.lat ?? null, venueLng: found?.lng ?? null });
  }

  const hasCoords = form.venueLat != null && form.venueLng != null;
  const errorCount = Object.keys(errors).length;

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <Panel title="Pasangan">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tajuk" htmlFor="title" error={errors.title}>
              <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} invalid={!!errors.title} maxLength={120} />
            </Field>
            <Field label="Pihak penjemput" htmlFor="hostSide" hint="Nama dan ibu bapa pihak ini didahulukan pada kad.">
              <Select id="hostSide" value={form.hostSide} onChange={(e) => set("hostSide", e.target.value as SettingsInput["hostSide"])}>
                <option value="bride">Pihak perempuan</option>
                <option value="groom">Pihak lelaki</option>
              </Select>
            </Field>
            <Field label="Nama pengantin perempuan" htmlFor="brideName" error={errors.brideName} hint="Nama penuh termasuk binti.">
              <Input id="brideName" value={form.brideName} onChange={(e) => set("brideName", e.target.value)} invalid={!!errors.brideName} maxLength={120} />
            </Field>
            <Field label="Nama pengantin lelaki" htmlFor="groomName" error={errors.groomName} hint="Nama penuh termasuk bin.">
              <Input id="groomName" value={form.groomName} onChange={(e) => set("groomName", e.target.value)} invalid={!!errors.groomName} maxLength={120} />
            </Field>
            <Field label="Ibu bapa pengantin perempuan" htmlFor="brideParents" error={errors.brideParents}>
              <Input id="brideParents" value={form.brideParents} onChange={(e) => set("brideParents", e.target.value)} invalid={!!errors.brideParents} maxLength={240} placeholder="Hj. Kamaruddin bin Ismail & Hjh. Rosnah binti Ahmad" />
            </Field>
            <Field label="Ibu bapa pengantin lelaki" htmlFor="groomParents" error={errors.groomParents}>
              <Input id="groomParents" value={form.groomParents} onChange={(e) => set("groomParents", e.target.value)} invalid={!!errors.groomParents} maxLength={240} />
            </Field>
            <Field label="Teks pembukaan" htmlFor="openingText" error={errors.openingText} className="sm:col-span-2">
              <Textarea id="openingText" value={form.openingText} onChange={(e) => set("openingText", e.target.value)} invalid={!!errors.openingText} maxLength={600} />
            </Field>
            <Field label="Teks penutup" htmlFor="closingText" error={errors.closingText} className="sm:col-span-2">
              <Textarea id="closingText" rows={2} value={form.closingText} onChange={(e) => set("closingText", e.target.value)} invalid={!!errors.closingText} maxLength={300} />
            </Field>
            <Field label="Hashtag" htmlFor="hashtag" error={errors.hashtag} hint="Tanpa #. Kosongkan jika tiada.">
              <Input id="hashtag" value={form.hashtag ?? ""} onChange={(e) => set("hashtag", e.target.value || null)} invalid={!!errors.hashtag} maxLength={60} />
            </Field>
          </div>
        </Panel>

        <Panel title="Tarikh dan tempat">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mula" htmlFor="eventStartAt" error={errors.eventStartAt} hint="Waktu Malaysia.">
              <Input id="eventStartAt" type="datetime-local" value={toKlLocalInput(form.eventStartAt)} onChange={(e) => set("eventStartAt", fromKlLocalInput(e.target.value))} invalid={!!errors.eventStartAt} />
            </Field>
            <Field label="Tamat" htmlFor="eventEndAt" error={errors.eventEndAt} hint="Pilihan. Jika kosong, kad memaparkan 3 jam selepas mula.">
              <Input id="eventEndAt" type="datetime-local" value={toKlLocalInput(form.eventEndAt)} onChange={(e) => set("eventEndAt", fromKlLocalInput(e.target.value))} invalid={!!errors.eventEndAt} />
            </Field>
            <Field label="Nama tempat" htmlFor="venueName" error={errors.venueName} className="sm:col-span-2">
              <Input id="venueName" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} invalid={!!errors.venueName} maxLength={160} />
            </Field>
            <Field label="Alamat" htmlFor="venueAddress" error={errors.venueAddress} className="sm:col-span-2">
              <Textarea id="venueAddress" value={form.venueAddress} onChange={(e) => set("venueAddress", e.target.value)} invalid={!!errors.venueAddress} maxLength={400} />
            </Field>
            <Field
              label="Koordinat"
              htmlFor="coords"
              className="sm:col-span-2"
              hint="Tampal pautan Google Maps atau Waze, atau taip “3.1390, 101.6869”. Pautan pendek (maps.app.goo.gl) perlu dibuka dulu dan disalin dari bar alamat."
            >
              <Input id="coords" value={coordText} onChange={(e) => onCoords(e.target.value)} placeholder="https://www.google.com/maps/place/…" />
              {hasCoords ? (
                <p className="text-[12px] text-success">
                  Koordinat dikenal pasti: {form.venueLat}, {form.venueLng}
                </p>
              ) : (
                <p className="text-[12px] text-muted">Tiada koordinat. Butang peta akan disembunyikan.</p>
              )}
            </Field>
          </div>
        </Panel>

        <Panel title="Atur cara majlis">
          <ListEditor<ScheduleItem>
            items={form.schedule}
            onChange={(schedule) => set("schedule", schedule)}
            blank={() => ({ time: "", label: "" })}
            max={20}
            addLabel="Tambah baris"
            emptyText="Tiada atur cara lagi. Bahagian ini disembunyikan pada kad jika kosong."
            renderRow={(row, update, i) => (
              <>
                <Input className="sm:w-[150px]" aria-label={`Masa baris ${i + 1}`} placeholder="11:00 pagi" maxLength={20} value={row.time} onChange={(e) => update({ time: e.target.value })} invalid={!!errors[`schedule.${i}.time`]} />
                <Input aria-label={`Aktiviti baris ${i + 1}`} placeholder="Ketibaan tetamu" maxLength={120} value={row.label} onChange={(e) => update({ label: e.target.value })} invalid={!!errors[`schedule.${i}.label`]} />
              </>
            )}
          />
        </Panel>

        <Panel title="Hubungi">
          <ListEditor<Contact>
            items={form.contacts}
            onChange={(contacts) => set("contacts", contacts)}
            blank={() => ({ name: "", relation: "", phone: "" })}
            max={10}
            addLabel="Tambah baris"
            emptyText="Tiada nombor untuk dihubungi. Bahagian ini disembunyikan pada kad jika kosong."
            renderRow={(c, update, i) => (
              <>
                <Input aria-label={`Nama hubungan ${i + 1}`} placeholder="Kamaruddin" maxLength={80} value={c.name} onChange={(e) => update({ name: e.target.value })} invalid={!!errors[`contacts.${i}.name`]} />
                <Input className="sm:w-[150px]" aria-label={`Hubungan ${i + 1}`} placeholder="Bapa" maxLength={60} value={c.relation ?? ""} onChange={(e) => update({ relation: e.target.value || undefined })} />
                <div className="flex flex-col gap-1 sm:w-[170px]">
                  <Input
                    aria-label={`Telefon ${i + 1}`}
                    inputMode="tel"
                    placeholder="0123456789"
                    value={c.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    onBlur={(e) => update({ phone: e.target.value.replace(/[\s()-]/g, "") })}
                    invalid={!!errors[`contacts.${i}.phone`]}
                  />
                  {errors[`contacts.${i}.phone`] && (
                    <p className="text-[12px] text-danger" role="alert">
                      {errors[`contacts.${i}.phone`]}
                    </p>
                  )}
                </div>
              </>
            )}
          />
        </Panel>

        <Panel title="Rupa kad">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fon" htmlFor="fontPreset">
              <Select id="fontPreset" value={form.fontPreset} onChange={(e) => set("fontPreset", e.target.value as SettingsInput["fontPreset"])}>
                {FONT_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {FONT_PRESETS[k].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Warna" htmlFor="colorPreset">
              <Select id="colorPreset" value={form.colorPreset} onChange={(e) => set("colorPreset", e.target.value as SettingsInput["colorPreset"])}>
                {COLOR_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {COLOR_PRESETS[k].label}
                  </option>
                ))}
              </Select>
              <div className="mt-1 flex flex-wrap gap-2">
                {COLOR_PRESET_KEYS.map((k) => {
                  const c = COLOR_PRESETS[k];
                  const active = form.colorPreset === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-label={c.label}
                      aria-pressed={active}
                      title={c.label}
                      onClick={() => set("colorPreset", k)}
                      className={cx("flex h-8 items-center gap-1 rounded-full border px-1.5", active ? "border-ink ring-2 ring-accent/40" : "border-line hover:border-muted")}
                    >
                      {[c.bg, c.ink, c.accent, c.leaf, c.soft].map((hex) => (
                        <span key={hex} className="h-4 w-4 rounded-full border border-black/10" style={{ background: hex }} />
                      ))}
                    </button>
                  );
                })}
              </div>
            </Field>
            <UploadZone kind="music" label="Muzik latar" hint="MP3, maksimum 3 MB." accept="audio/mpeg,.mp3" value={form.musicUrl} onChange={(url) => set("musicUrl", url)} />
            <UploadZone kind="background" label="Gambar latar" hint="JPG, PNG atau WebP, maksimum 2 MB." accept="image/jpeg,image/png,image/webp" value={form.backgroundUrl} onChange={(url) => set("backgroundUrl", url)} />
          </div>
        </Panel>

        <Panel title="RSVP">
          <label className="flex items-start gap-3 text-[14px]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-ink" checked={form.isRsvpEnabled} onChange={(e) => set("isRsvpEnabled", e.target.checked)} />
            <span>
              Benarkan tetamu sahkan kehadiran melalui kad
              <span className="block text-[12px] text-muted">Jika dimatikan, bahagian Kehadiran disembunyikan dan pengesahan baharu ditolak.</span>
            </span>
          </label>
        </Panel>

        <div className="sticky bottom-0 -mx-1 rounded-t-xl border-t border-line bg-paper/95 px-1 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan perubahan"}
            </Button>
            <SaveStatus errorCount={errorCount} saveError={saveError} dirty={dirty} savedAt={savedAt} />
          </div>
        </div>
      </div>

      <aside className="hidden w-[300px] shrink-0 lg:block lg:sticky lg:top-6">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted">Pratonton langsung</h2>
        <CardPreview settings={form} />
        <p className="mt-2 text-[12px] text-muted">Pratonton mengikut borang ini, termasuk perubahan yang belum disimpan. Nama dalam senarai RSVP hanya contoh.</p>
      </aside>
    </div>
  );
}

function SaveStatus({ errorCount, saveError, dirty, savedAt }: { errorCount: number; saveError: string | null; dirty: boolean; savedAt: string }) {
  // `now` is set after mount so the server and first client render agree.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [savedAt]);

  if (saveError) return <Notice tone="error">{saveError}</Notice>;
  if (errorCount > 0) return <Notice tone="error">{errorCount === 1 ? "1 ralat perlu dibetulkan." : `${errorCount} ralat perlu dibetulkan.`}</Notice>;
  if (dirty) return <span className="text-[13px] text-muted">Perubahan belum disimpan.</span>;
  return <span className="text-[13px] text-muted">{savedLabel(savedAt, now)}</span>;
}

function savedLabel(savedAt: string, now: number | null): string {
  if (now === null) return "Disimpan";
  const mins = Math.floor((now - Date.parse(savedAt)) / 60_000);
  if (mins < 1) return "Disimpan sebentar tadi";
  if (mins < 60) return `Disimpan ${mins} minit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Disimpan ${hours} jam lalu`;
  return `Disimpan ${formatDateMs(new Date(savedAt))}`;
}
