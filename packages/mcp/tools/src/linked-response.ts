import {
  IracingAPIResponseToJSON,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import { APIResponseSchema } from "@iracing-data/api-schema";
import { z } from "zod";
import { ApplicationFailure } from "./diagnostics/errors.js";
/** Validate payloads without exposing validator diagnostics. */
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  return result.data;
}
/** Accept only credential-free HTTPS URLs returned by the authenticated API. */
export function linkedUrl(input: string): URL {
  try {
    const url = new URL(input);
    if (url.protocol === "https:" && !url.username && !url.password) return url;
  } catch {
    /* Fixed failure below. */
  }
  throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
    reason: "unsafe_link",
  });
}
/** Fetch an opaque API-produced URL with no inherited headers or bearer credentials. */
export async function fetchLinkedJson<T>(
  url: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
  fetchApi: typeof fetch = fetch,
): Promise<T> {
  const target = linkedUrl(url);
  signal.throwIfAborted();
  const response = await fetchApi(target.href, {
    signal,
    redirect: "error",
  }).catch(() => {
    throw new ApplicationFailure("UPSTREAM_UNAVAILABLE");
  });
  if (!response.ok)
    throw new ApplicationFailure(
      response.status === 403 || response.status === 404
        ? "CURSOR_EXPIRED"
        : response.status >= 500
          ? "UPSTREAM_UNAVAILABLE"
          : "DATA_RESOLUTION_FAILED",
    );
  const value: unknown = await response.json();
  signal.throwIfAborted();
  return parse(schema, value);
}
/** Resolve a generated link envelope and validate the final maintained/projection contract. */
export async function materialize<T>(
  envelope: IracingAPIResponse,
  schema: z.ZodType<T>,
  signal: AbortSignal,
  fetchApi: typeof fetch = fetch,
): Promise<{ data: T; expiresAt: number }> {
  if (
    !(envelope?.expires instanceof Date) ||
    !Number.isFinite(envelope.expires.getTime())
  ) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  }
  const link = parse(APIResponseSchema, IracingAPIResponseToJSON(envelope));
  const expiresAt = Date.parse(link.expires) - 30_000;
  if (expiresAt <= Date.now()) throw new ApplicationFailure("CURSOR_EXPIRED");
  const data = await fetchLinkedJson(link.link, schema, signal, fetchApi);
  if (expiresAt <= Date.now()) throw new ApplicationFailure("CURSOR_EXPIRED");
  return { data, expiresAt };
}
