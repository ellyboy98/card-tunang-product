import { NextResponse } from "next/server";
import { loginInput } from "@/lib/validation";
import { checkPassword, makeSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth";
import { HttpError } from "@/server/errors";
import { parseJson, route } from "@/server/http";

export const POST = route(async (req) => {
  const { password } = await parseJson(req, loginInput);
  if (!checkPassword(password)) throw new HttpError(401, "err.wrongPassword");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await makeSessionToken(), sessionCookieOptions());
  return res;
});
