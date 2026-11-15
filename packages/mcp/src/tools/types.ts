/** A discriminated result of an operation, containing either data or an error. */
export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

/** Transport-independent cancellation for domain operations. */
export interface OperationContext {
  /** Request cancellation propagated to every query. */
  readonly signal: AbortSignal;
}
