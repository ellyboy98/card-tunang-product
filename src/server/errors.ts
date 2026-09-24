import type { StringKey, Vars } from "@/lib/i18n";

/** An error a route can return as `{ error, issues? }` with this HTTP status. The message is an i18n key; `route()` translates it. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly key: StringKey,
    /** Field-level detail for 400s; shaped by `z.flattenError`. */
    public readonly issues?: unknown,
    public readonly vars?: Vars,
  ) {
    super(key);
    this.name = "HttpError";
  }
}
