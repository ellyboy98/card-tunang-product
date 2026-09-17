"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, errorMessage } from "@/lib/api";
import { Button, Field, Input } from "./ui";

export function LoginForm() {
  const router = useRouter();
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
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[360px] space-y-4 rounded-xl border border-line bg-panel p-6">
      <h1 className="font-display text-[28px] italic leading-tight">
        Kad Tunang <span className="font-sans text-[14px] not-italic text-muted">· admin</span>
      </h1>
      <Field label="Kata laluan" htmlFor="password" error={error}>
        <Input id="password" type="password" autoFocus autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!error} />
      </Field>
      <Button type="submit" variant="primary" className="w-full" disabled={busy || !password}>
        {busy ? "Menyemak…" : "Log masuk"}
      </Button>
    </form>
  );
}
