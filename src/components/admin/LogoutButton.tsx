"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useT } from "./i18n";
import { Button } from "./ui";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await api("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }
  return (
    <Button onClick={logout} disabled={busy}>
      {t("a.logout")}
    </Button>
  );
}
