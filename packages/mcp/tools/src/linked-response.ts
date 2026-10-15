import {
  IracingAPIResponseToJSON,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import { APIResponseSchema } from "@iracing-data/api-schema";
import { ApplicationFailure } from "./diagnostics/errors.js";
import type { z } from "zod";

/**
 * Return schema-parsed data, throwing DATA_RESOLUTION_FAILED for validation failures
 * without exposing validator diagnostics. Exceptions thrown by schema callbacks propagate.
 */
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  }

  return result.data;
}

/**
 * Parse an absolute HTTPS URL without embedded credentials, throwing
 * DATA_RESOLUTION_FAILED with reason unsafe_link when it is rejected.
 */
export function linkedUrl(input: string): URL {
  try {
    const url = new URL(input);

    if (url.protocol === "https:" && !url.username && !url.password) {
      return url;
    }
  } catch {
    /* Fixed failure below. */
  }

  throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
    reason: "unsafe_link",
  });
}

/**
 * Fetch and validate an API-provided HTTPS link with no inherited headers or bearer
 * credentials, requesting redirect rejection from fetchApi. Fetch rejections and
 * HTTP 5xx become UPSTREAM_UNAVAILABLE; HTTP 403/404 become CURSOR_EXPIRED.
 * Other non-success statuses, unsafe URLs, and invalid payloads become
 * DATA_RESOLUTION_FAILED. JSON decoding errors and explicit abort checks propagate.
 */
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

  if (!response.ok) {
    throw new ApplicationFailure(linkedFailureCode(response.status));
  }

  const value: unknown = await response.json();

  signal.throwIfAborted();

  return parse(schema, value);
}

/**
 * Resolve a generated link envelope and return validated data with expiresAt in
 * Unix milliseconds, 30 seconds before the upstream expiry. Reject with CURSOR_EXPIRED
 * if that deadline is reached before or after fetching. Malformed envelopes raise
 * DATA_RESOLUTION_FAILED; linked-fetch, JSON decoding, and abort errors propagate.
 */
export async function materialize<T>(
  envelope: IracingAPIResponse,
  schema: z.ZodType<T>,
  signal: AbortSignal,
  fetchApi: typeof fetch = fetch,
): Promise<{ data: T; expiresAt: number }> {
  if (
    !(envelope.expires instanceof Date) ||
    !Number.isFinite(envelope.expires.getTime())
  ) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "invalid_data",
    });
  }

  const link = parse(APIResponseSchema, IracingAPIResponseToJSON(envelope));

  const expiresAt = Date.parse(link.expires) - 30_000;

  if (expiresAt <= Date.now()) {
    throw new ApplicationFailure("CURSOR_EXPIRED");
  }

  const data = await fetchLinkedJson(link.link, schema, signal, fetchApi);

  if (expiresAt <= Date.now()) {
    throw new ApplicationFailure("CURSOR_EXPIRED");
  }

  return { data, expiresAt };
}

function linkedFailureCode(status: number) {
  if (status === 403 || status === 404) {
    return "CURSOR_EXPIRED";
  }

  if (status >= 500) {
    return "UPSTREAM_UNAVAILABLE";
  }

  return "DATA_RESOLUTION_FAILED";
}
