// Helpers that keep route handlers thin: parse → service → respond.
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { HttpError } from "./errors";

type Handler<Ctx> = (req: NextRequest, ctx: Ctx) => Promise<Response>;

/** Turns thrown HttpErrors into `{ error }` responses; anything else is a 500 with no detail. */
export function route<Ctx = unknown>(handler: Handler<Ctx>): Handler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        return NextResponse.json(e.issues === undefined ? { error: e.message } : { error: e.message, issues: e.issues }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
    }
  };
}

export async function parseJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Data tidak sah");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "Data tidak sah", z.flattenError(parsed.error));
  return parsed.data;
}

/** A positive integer from a path or query parameter. */
export function parseId(raw: string | null | undefined): number {
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) throw new HttpError(400, "ID tidak sah");
  return id;
}

export type IdContext = { params: Promise<{ id: string }> };
