// Browser-side fetch wrapper for the JSON routes. Throws ApiError with the server's message.
import { isStringKey, t, type Lang, type StringKey } from "./i18n";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly issues?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Init = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

export async function api<T = unknown>(url: string, init: Init = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: json === undefined ? headers : { "Content-Type": "application/json", ...headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  });
  const data: { error?: string; issues?: unknown } | null = await res.json().catch(() => null);
  if (!res.ok) {
    // An expired admin session sends the admin back to the login page.
    if (res.status === 401 && url.startsWith("/api/admin/") && !url.endsWith("/login") && typeof window !== "undefined") {
      window.location.assign("/admin/login");
    }
    // The server already answered in the caller's language; a missing body becomes a key for errorMessage.
    throw new ApiError(res.status, data?.error ?? "err.network", data?.issues);
  }
  return data as T;
}

/** The error's message for the admin, translating the keys api() falls back to. */
export function errorMessage(e: unknown, lang: Lang, fallback: StringKey = "err.generic"): string {
  const m = e instanceof Error && e.message ? e.message : "";
  if (!m) return t(lang, fallback);
  return isStringKey(m) ? t(lang, m) : m;
}
