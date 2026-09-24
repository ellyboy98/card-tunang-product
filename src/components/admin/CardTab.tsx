"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FloralThumb } from "@/components/card/Florals";
import { api, errorMessage } from "@/lib/api";
import { formatDate, fromKlLocalInput, parseLatLng, toKlLocalInput } from "@/lib/format";
import { label, LANG_NAMES, LANGS, type Lang } from "@/lib/i18n";
import { COLOR_PRESET_KEYS, COLOR_PRESETS, ENTRANCE_PRESET_KEYS, ENTRANCE_PRESETS, FLORAL_PRESET_KEYS, FLORAL_PRESETS, FONT_PRESET_KEYS, FONT_PRESETS, REVEAL_PRESET_KEYS, REVEAL_PRESETS, WIND_PRESET_KEYS, WIND_PRESETS } from "@/lib/presets";
import type { SettingsDto } from "@/lib/types";
import { issueMap, settingsInput, zodErrorMap, type Contact, type ScheduleItem, type SettingsInput } from "@/lib/validation";
import { CardPreview } from "./CardPreview";
import { useT } from "./i18n";
import { ListEditor } from "./ListEditor";
import { Button, cx, Field, Input, Notice, Panel, Select, Textarea } from "./ui";
import { UploadZone } from "./UploadZone";

function stripMeta({ updatedAt: _updatedAt, ...form }: SettingsDto): SettingsInput {
  void _updatedAt;
  return form;
}

export function CardTab({ initial }: { initial: SettingsDto }) {
  const router = useRouter();
  const { lang, t } = useT();
  const [form, setForm] = useState<SettingsInput>(() => stripMeta(initial));
  const [savedAt, setSavedAt] = useState(initial.updatedAt);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  // Bumping the key remounts the preview so the entrance can be watched again.
  const [replay, setReplay] = useState(0);
  const [coordText, setCoordText] = useState(initial.venueLat != null && initial.venueLng != null ? `${initial.venueLat}, ${initial.venueLng}` : "");

  const setMany = (patch: Partial<SettingsInput>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };
  const set = <K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) => setMany({ [key]: value });
  const validate = (data: SettingsInput) => settingsInput.safeParse(data, { error: zodErrorMap(lang) });

  // Once a save has surfaced errors, keep re-validating so they clear as the admin types.
  useEffect(() => {
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const r = settingsInput.safeParse(form, { error: zodErrorMap(lang) });
      return r.success ? {} : issueMap(r.error, lang);
    });
  }, [form, lang]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaveError(null);
    const parsed = validate(form);
    if (!parsed.success) {
      setErrors(issueMap(parsed.error, lang));
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
      setSaveError(errorMessage(e, lang, "err.saveFailed"));
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
  const L = (p: { label: string; labelEn: string }) => label(lang, p);

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <Panel title={t("a.couple")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${t("a.title")} (BM)`} htmlFor="title" error={errors.title}>
              <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} invalid={!!errors.title} maxLength={120} />
            </Field>
            <Field label={`${t("a.title")} (EN)`} htmlFor="titleEn" error={errors.titleEn} hint={t("a.enFallbackHint")}>
              <Input id="titleEn" lang="en" value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} invalid={!!errors.titleEn} maxLength={120} placeholder="Engagement Ceremony" />
            </Field>
            <Field label={t("a.hostSide")} htmlFor="hostSide" hint={t("a.hostSideHint")} className="sm:col-span-2">
              <Select id="hostSide" value={form.hostSide} onChange={(e) => set("hostSide", e.target.value as SettingsInput["hostSide"])}>
                <option value="bride">{t("a.brideSide")}</option>
                <option value="groom">{t("a.groomSide")}</option>
              </Select>
            </Field>
            <Field label={t("a.brideName")} htmlFor="brideName" error={errors.brideName} hint={t("a.brideNameHint")}>
              <Input id="brideName" value={form.brideName} onChange={(e) => set("brideName", e.target.value)} invalid={!!errors.brideName} maxLength={120} />
            </Field>
            <Field label={t("a.groomName")} htmlFor="groomName" error={errors.groomName} hint={t("a.groomNameHint")}>
              <Input id="groomName" value={form.groomName} onChange={(e) => set("groomName", e.target.value)} invalid={!!errors.groomName} maxLength={120} />
            </Field>
            <Field label={t("a.brideParents")} htmlFor="brideParents" error={errors.brideParents}>
              <Input id="brideParents" value={form.brideParents} onChange={(e) => set("brideParents", e.target.value)} invalid={!!errors.brideParents} maxLength={240} placeholder="Hj. Kamaruddin bin Ismail & Hjh. Rosnah binti Ahmad" />
            </Field>
            <Field label={t("a.groomParents")} htmlFor="groomParents" error={errors.groomParents}>
              <Input id="groomParents" value={form.groomParents} onChange={(e) => set("groomParents", e.target.value)} invalid={!!errors.groomParents} maxLength={240} />
            </Field>
            <Field label={`${t("a.openingText")} (BM)`} htmlFor="openingText" error={errors.openingText}>
              <Textarea id="openingText" value={form.openingText} onChange={(e) => set("openingText", e.target.value)} invalid={!!errors.openingText} maxLength={600} />
            </Field>
            <Field label={`${t("a.openingText")} (EN)`} htmlFor="openingTextEn" error={errors.openingTextEn} hint={t("a.enFallbackHint")}>
              <Textarea id="openingTextEn" lang="en" value={form.openingTextEn} onChange={(e) => set("openingTextEn", e.target.value)} invalid={!!errors.openingTextEn} maxLength={600} placeholder="With gratitude to the Almighty, we invite you to the engagement ceremony of our beloved" />
            </Field>
            <Field label={`${t("a.closingText")} (BM)`} htmlFor="closingText" error={errors.closingText}>
              <Textarea id="closingText" rows={2} value={form.closingText} onChange={(e) => set("closingText", e.target.value)} invalid={!!errors.closingText} maxLength={300} />
            </Field>
            <Field label={`${t("a.closingText")} (EN)`} htmlFor="closingTextEn" error={errors.closingTextEn} hint={t("a.enFallbackHint")}>
              <Textarea id="closingTextEn" lang="en" rows={2} value={form.closingTextEn} onChange={(e) => set("closingTextEn", e.target.value)} invalid={!!errors.closingTextEn} maxLength={300} placeholder="Your presence and blessings mean the world to us." />
            </Field>
            <Field label={t("a.hashtag")} htmlFor="hashtag" error={errors.hashtag} hint={t("a.hashtagHint")}>
              <Input id="hashtag" value={form.hashtag ?? ""} onChange={(e) => set("hashtag", e.target.value || null)} invalid={!!errors.hashtag} maxLength={60} />
            </Field>
          </div>
        </Panel>

        <Panel title={t("a.dateVenue")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("a.start")} htmlFor="eventStartAt" error={errors.eventStartAt} hint={t("a.myTime")}>
              <Input id="eventStartAt" type="datetime-local" value={toKlLocalInput(form.eventStartAt)} onChange={(e) => set("eventStartAt", fromKlLocalInput(e.target.value))} invalid={!!errors.eventStartAt} />
            </Field>
            <Field label={t("a.end")} htmlFor="eventEndAt" error={errors.eventEndAt} hint={t("a.endHint")}>
              <Input id="eventEndAt" type="datetime-local" value={toKlLocalInput(form.eventEndAt)} onChange={(e) => set("eventEndAt", fromKlLocalInput(e.target.value))} invalid={!!errors.eventEndAt} />
            </Field>
            <Field label={t("a.venueName")} htmlFor="venueName" error={errors.venueName} className="sm:col-span-2">
              <Input id="venueName" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} invalid={!!errors.venueName} maxLength={160} />
            </Field>
            <Field label={t("a.address")} htmlFor="venueAddress" error={errors.venueAddress} className="sm:col-span-2">
              <Textarea id="venueAddress" value={form.venueAddress} onChange={(e) => set("venueAddress", e.target.value)} invalid={!!errors.venueAddress} maxLength={400} />
            </Field>
            <Field label={t("a.coords")} htmlFor="coords" className="sm:col-span-2" hint={t("a.coordsHint")}>
              <Input id="coords" value={coordText} onChange={(e) => onCoords(e.target.value)} placeholder="https://www.google.com/maps/place/…" />
              {hasCoords ? <p className="text-[12px] text-success">{t("a.coordsFound", { lat: String(form.venueLat), lng: String(form.venueLng) })}</p> : <p className="text-[12px] text-muted">{t("a.coordsNone")}</p>}
            </Field>
          </div>
        </Panel>

        <Panel title={t("a.schedule")}>
          <ListEditor<ScheduleItem>
            items={form.schedule}
            onChange={(schedule) => set("schedule", schedule)}
            blank={() => ({ time: "", label: "", timeEn: "", labelEn: "" })}
            max={20}
            addLabel={t("a.addRow")}
            emptyText={t("a.scheduleEmpty")}
            renderRow={(row, update, i) => (
              <div className="grid flex-1 gap-2 sm:grid-cols-[150px_1fr]">
                <Input aria-label={t("a.rowTime", { n: i + 1 })} placeholder={t("a.timePlaceholder")} maxLength={20} value={row.time} onChange={(e) => update({ time: e.target.value })} invalid={!!errors[`schedule.${i}.time`]} />
                <Input aria-label={t("a.rowLabel", { n: i + 1 })} placeholder={t("a.activityPlaceholder")} maxLength={120} value={row.label} onChange={(e) => update({ label: e.target.value })} invalid={!!errors[`schedule.${i}.label`]} />
                <Input lang="en" aria-label={t("a.rowTimeEn", { n: i + 1 })} placeholder={`EN · ${t("a.timePlaceholderEn")}`} maxLength={20} value={row.timeEn ?? ""} onChange={(e) => update({ timeEn: e.target.value })} invalid={!!errors[`schedule.${i}.timeEn`]} />
                <Input lang="en" aria-label={t("a.rowLabelEn", { n: i + 1 })} placeholder={`EN · ${t("a.activityPlaceholderEn")}`} maxLength={120} value={row.labelEn ?? ""} onChange={(e) => update({ labelEn: e.target.value })} invalid={!!errors[`schedule.${i}.labelEn`]} />
              </div>
            )}
          />
        </Panel>

        <Panel title={t("a.contacts")}>
          <ListEditor<Contact>
            items={form.contacts}
            onChange={(contacts) => set("contacts", contacts)}
            blank={() => ({ name: "", relation: "", relationEn: "", phone: "" })}
            max={10}
            addLabel={t("a.addRow")}
            emptyText={t("a.contactsEmpty")}
            renderRow={(c, update, i) => (
              <>
                <Input aria-label={t("a.contactName", { n: i + 1 })} placeholder={t("a.namePlaceholder")} maxLength={80} value={c.name} onChange={(e) => update({ name: e.target.value })} invalid={!!errors[`contacts.${i}.name`]} />
                <Input className="sm:w-[130px]" aria-label={t("a.relation", { n: i + 1 })} placeholder={t("a.relationPlaceholder")} maxLength={60} value={c.relation ?? ""} onChange={(e) => update({ relation: e.target.value || undefined })} />
                <Input className="sm:w-[130px]" lang="en" aria-label={t("a.relationEn", { n: i + 1 })} placeholder={`EN · ${t("a.relationPlaceholderEn")}`} maxLength={60} value={c.relationEn ?? ""} onChange={(e) => update({ relationEn: e.target.value || undefined })} />
                <div className="flex flex-col gap-1 sm:w-[160px]">
                  <Input
                    aria-label={t("a.phone", { n: i + 1 })}
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

        <Panel title={t("a.look")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("a.font")} htmlFor="fontPreset">
              <Select id="fontPreset" value={form.fontPreset} onChange={(e) => set("fontPreset", e.target.value as SettingsInput["fontPreset"])}>
                {FONT_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {L(FONT_PRESETS[k])}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("a.colour")} htmlFor="colorPreset">
              <Select id="colorPreset" value={form.colorPreset} onChange={(e) => set("colorPreset", e.target.value as SettingsInput["colorPreset"])}>
                {COLOR_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {L(COLOR_PRESETS[k])}
                  </option>
                ))}
              </Select>
              <div className="mt-1 flex flex-wrap gap-2">
                {COLOR_PRESET_KEYS.map((k) => {
                  const c = COLOR_PRESETS[k];
                  const active = form.colorPreset === k;
                  return (
                    <button key={k} type="button" aria-label={L(c)} aria-pressed={active} title={L(c)} onClick={() => set("colorPreset", k)} className={cx("flex h-8 items-center gap-1 rounded-full border px-1.5", active ? "border-ink ring-2 ring-accent/40" : "border-line hover:border-muted")}>
                      {[c.bg, c.ink, c.accent, c.leaf, c.soft].map((hex) => (
                        <span key={hex} className="h-4 w-4 rounded-full border border-black/10" style={{ background: hex }} />
                      ))}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label={t("a.florals")} htmlFor="floralPreset" className="sm:col-span-2" hint={t("a.floralsHint")}>
              <Select id="floralPreset" value={form.floralPreset} onChange={(e) => set("floralPreset", e.target.value as SettingsInput["floralPreset"])}>
                {FLORAL_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {L(FLORAL_PRESETS[k])}
                  </option>
                ))}
              </Select>
              <div className="mt-1 flex flex-wrap gap-2">
                {FLORAL_PRESET_KEYS.map((k) => {
                  const active = form.floralPreset === k;
                  return (
                    <button key={k} type="button" aria-label={L(FLORAL_PRESETS[k])} aria-pressed={active} title={L(FLORAL_PRESETS[k])} onClick={() => set("floralPreset", k)} className={cx("overflow-hidden rounded-md border", active ? "border-ink ring-2 ring-accent/40" : "border-line hover:border-muted")}>
                      <FloralThumb preset={k} width={60} />
                    </button>
                  );
                })}
              </div>
            </Field>
            <UploadZone kind="music" label={t("a.music")} hint={t("a.musicHint")} accept="audio/mpeg,.mp3" value={form.musicUrl} onChange={(url) => set("musicUrl", url)} />
            <UploadZone kind="background" label={t("a.background")} hint={t("a.backgroundHint")} accept="image/jpeg,image/png,image/webp" value={form.backgroundUrl} onChange={(url) => set("backgroundUrl", url)} />
          </div>
        </Panel>

        <Panel title={t("a.animation")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("a.entrance")} htmlFor="entrancePreset" hint={lang === "en" ? ENTRANCE_PRESETS[form.entrancePreset].hintEn : ENTRANCE_PRESETS[form.entrancePreset].hint}>
              <Select id="entrancePreset" value={form.entrancePreset} onChange={(e) => set("entrancePreset", e.target.value as SettingsInput["entrancePreset"])}>
                {ENTRANCE_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {L(ENTRANCE_PRESETS[k])}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("a.wind")} htmlFor="windPreset" hint={t("a.windHint")}>
              <Select id="windPreset" value={form.windPreset} onChange={(e) => set("windPreset", e.target.value as SettingsInput["windPreset"])}>
                {WIND_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {L(WIND_PRESETS[k])}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("a.reveal")} htmlFor="revealPreset" hint={t("a.revealHint")}>
              <Select id="revealPreset" value={form.revealPreset} onChange={(e) => set("revealPreset", e.target.value as SettingsInput["revealPreset"])}>
                {REVEAL_PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {L(REVEAL_PRESETS[k])}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => setReplay((n) => n + 1)} title={t("a.previewAnimationTitle")}>
              {t("a.previewAnimation")}
            </Button>
            <p className="text-[12px] text-muted">{t("a.previewAnimationHint")}</p>
          </div>
        </Panel>

        <Panel title={t("a.cardLanguage")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("a.defaultLanguage")} htmlFor="defaultLanguage" hint={t("a.defaultLanguageHint")}>
              <Select id="defaultLanguage" value={form.defaultLanguage} onChange={(e) => set("defaultLanguage", e.target.value as Lang)}>
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {LANG_NAMES[l]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title={t("a.rsvp")}>
          <label className="flex items-start gap-3 text-[14px]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-ink" checked={form.isRsvpEnabled} onChange={(e) => set("isRsvpEnabled", e.target.checked)} />
            <span>
              {t("a.rsvpAllow")}
              <span className="block text-[12px] text-muted">{t("a.rsvpAllowHint")}</span>
            </span>
          </label>
        </Panel>

        <div className="sticky bottom-0 -mx-1 rounded-t-xl border-t border-line bg-paper/95 px-1 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? t("a.saving") : t("a.save")}
            </Button>
            <SaveStatus errorCount={errorCount} saveError={saveError} dirty={dirty} savedAt={savedAt} />
          </div>
        </div>
      </div>

      <aside className="hidden w-[300px] shrink-0 lg:block lg:sticky lg:top-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">{t("a.livePreview")}</h2>
          <Button size="sm" onClick={() => setReplay((n) => n + 1)} title={t("a.replayTitle")}>
            {t("a.replay")}
          </Button>
        </div>
        <CardPreview key={replay} settings={form} />
        <p className="mt-2 text-[12px] text-muted">{t("a.previewNote")}</p>
      </aside>
    </div>
  );
}

function SaveStatus({ errorCount, saveError, dirty, savedAt }: { errorCount: number; saveError: string | null; dirty: boolean; savedAt: string }) {
  const { lang, t } = useT();
  // `now` is set after mount so the server and first client render agree.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(i);
  }, [savedAt]);

  if (saveError) return <Notice tone="error">{saveError}</Notice>;
  if (errorCount > 0) return <Notice tone="error">{errorCount === 1 ? t("a.errorsToFix1") : t("a.errorsToFix", { n: errorCount })}</Notice>;
  if (dirty) return <span className="text-[13px] text-muted">{t("a.unsaved")}</span>;
  if (now === null) return <span className="text-[13px] text-muted">{t("a.saved")}</span>;
  const mins = Math.floor((now - Date.parse(savedAt)) / 60_000);
  const text = mins < 1 ? t("a.savedJustNow") : mins < 60 ? t("a.savedMinutes", { n: mins }) : mins < 1440 ? t("a.savedHours", { n: Math.floor(mins / 60) }) : t("a.savedOn", { date: formatDate(new Date(savedAt), lang) });
  return <span className="text-[13px] text-muted">{text}</span>;
}
