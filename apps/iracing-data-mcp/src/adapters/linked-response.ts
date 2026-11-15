import {
  IracingAPIResponseToJSON,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import { ApplicationFailure } from "@iracing-data/mcp";
import { z } from "zod";

/** A generated iRacing response contains an expiring signed HTTPS URL. */
function resolveLink(envelope: IracingAPIResponse): {
  target: URL;
  deadline: number;
} {
  if (
    !(envelope.expires instanceof Date) ||
    !Number.isFinite(envelope.expires.getTime())
  ) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  const metadata = z
    .object({
      link: z.string(),
      expires: z.string(),
    })
    .safeParse(IracingAPIResponseToJSON(envelope));

  if (!metadata.success) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  const deadline = Date.parse(metadata.data.expires) - 30_000;

  if (!Number.isFinite(deadline)) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  let target: URL;

  try {
    target = new URL(metadata.data.link);
  } catch {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "unsafe_link",
    });
  }

  if (target.protocol !== "https:" || target.username || target.password) {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
      reason: "unsafe_link",
    });
  }

  return { target, deadline };
}

/** Fetch only the signed URL; never inherit headers or follow redirects. */
async function fetchSignedPayload(
  target: URL,
  signal: AbortSignal,
  fetchApi: typeof fetch,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetchApi(target.href, { signal, redirect: "error" });
  } catch {
    throw new ApplicationFailure("UPSTREAM_UNAVAILABLE");
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      throw new ApplicationFailure("CURSOR_EXPIRED");
    }

    if (response.status >= 500) {
      throw new ApplicationFailure("UPSTREAM_UNAVAILABLE");
    }

    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  try {
    return await response.json();
  } catch {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }
}

/**
 * Materialize a generated client's expiring linked response. The caller supplies
 * the HTTP implementation; no bearer credentials or cookies are forwarded.
 * @param {IracingAPIResponse} envelope - Generated API response with a signed HTTPS link and expiry.
 * @param {AbortSignal} signal - Request cancellation propagated to the signed data fetch.
 * @param {typeof fetch} fetchApi - Host's HTTP implementation, defaulting to the platform fetch.
 * @returns {Promise<unknown>} Parsed linked data for the caller to validate and project.
 */
export async function readLinkedData(
  envelope: IracingAPIResponse,
  signal: AbortSignal,
  fetchApi: typeof fetch = fetch,
): Promise<unknown> {
  const { target, deadline } = resolveLink(envelope);

  if (deadline <= Date.now()) {
    throw new ApplicationFailure("CURSOR_EXPIRED");
  }

  signal.throwIfAborted();
  const value = await fetchSignedPayload(target, signal, fetchApi);

  signal.throwIfAborted();
  if (deadline <= Date.now()) {
    throw new ApplicationFailure("CURSOR_EXPIRED");
  }

  return value;
}
