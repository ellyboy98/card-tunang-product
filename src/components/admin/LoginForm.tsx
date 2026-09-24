"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, errorMessage } from "@/lib/api";
import { useT } from "./i18n";
import { Button, Field, Input } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const { lang, t } = useT();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/login", { method: "POST", json: { password } });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, lang));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[360px] space-y-4 rounded-xl border border-line bg-panel p-6">
      <h1 className="font-display text-[28px] italic leading-tight">
        Kad Tunang <span className="font-sans text-[14px] not-italic text-muted">· {t("a.admin")}</span>
      </h1>
      <Field label={t("a.password")} htmlFor="password" error={error}>
        <Input id="password" type="password" autoFocus autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!error} />
      </Field>
      <Button type="submit" variant="primary" className="w-full" disabled={busy || !password}>
        {busy ? t("a.checking") : t("a.login")}
      </Button>
    </form>
  );
}
