// A result type.
export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };
