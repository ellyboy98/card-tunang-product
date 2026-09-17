/** An error a route can return as `{ error, issues? }` with this HTTP status. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Field-level detail for 400s; shaped by `z.flattenError`. */
    public readonly issues?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
