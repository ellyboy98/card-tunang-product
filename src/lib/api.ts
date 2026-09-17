// Browser-side fetch wrapper for the JSON routes. Throws ApiError with the server's message.

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
    throw new ApiError(res.status, data?.error ?? "Ralat rangkaian", data?.issues);
  }
  return data as T;
}

export function errorMessage(e: unknown, fallback = "Sesuatu tidak kena. Cuba lagi."): string {
  return e instanceof Error && e.message ? e.message : fallback;
}
