// Single-admin auth: one password from env, one HMAC session token, no session
// store. Web Crypto only, so this also runs in middleware's edge runtime.

export const SESSION_COOKIE = "kt_admin";
const SESSION_MESSAGE = "kad-tunang-admin-session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function requireEnv(name: "ADMIN_PASSWORD" | "ADMIN_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/** Byte-wise compare whose duration depends only on the longer input, not on where they differ. */
export function timingSafeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  const n = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function checkPassword(input: string): boolean {
  return timingSafeEqual(input, requireEnv("ADMIN_PASSWORD"));
}

export function makeSessionToken(): Promise<string> {
  return hmacHex(SESSION_MESSAGE, requireEnv("ADMIN_SECRET"));
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return timingSafeEqual(token, await makeSessionToken());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  };
}
