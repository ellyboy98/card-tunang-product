// Helpers that keep route handlers thin: parse → service → respond.
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_LANG_COOKIE, LANG_COOKIE, langKey, t, type Lang } from "@/lib/i18n";
import { HttpError } from "./errors";

type Handler<Ctx> = (req: NextRequest, ctx: Ctx) => Promise<Response>;

/** Admin routes answer in the admin's language, public routes in the guest's. */
export function requestLang(req: NextRequest): Lang {
  const name = req.nextUrl.pathname.startsWith("/api/admin/") ? ADMIN_LANG_COOKIE : LANG_COOKIE;
  return langKey(req.cookies.get(name)?.value);
}

/** Turns thrown HttpErrors into `{ error }` responses; anything else is a 500 with no detail. */
export function route<Ctx = unknown>(handler: Handler<Ctx>): Handler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      const lang = requestLang(req);
      if (e instanceof HttpError) {
        const error = t(lang, e.key, e.vars);
        return NextResponse.json(e.issues === undefined ? { error } : { error, issues: e.issues }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: t(lang, "err.server") }, { status: 500 });
    }
  };
}

export async function parseJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "err.invalidData");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "err.invalidData", z.flattenError(parsed.error));
  return parsed.data;
}

/** A positive integer from a path or query parameter. */
export function parseId(raw: string | null | undefined): number {
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) throw new HttpError(400, "err.invalidId");
  return id;
}

export type IdContext = { params: Promise<{ id: string }> };
