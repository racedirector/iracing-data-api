import {
  IracingAPIResponseToJSON,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import { ApplicationFailure } from "@iracing-data/mcp";
import { z } from "zod";

/**
 * The generated clients return signed link envelopes rather than the payload.
 * Only this concrete Fetch adapter knows how to resolve those envelopes.
 * @param envelope
 * @param signal
 * @param fetchApi
 */
export async function readLinkedData(
  envelope: IracingAPIResponse,
  signal: AbortSignal,
  fetchApi: typeof fetch = fetch,
): Promise<unknown> {
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

  if (deadline <= Date.now()) {
    throw new ApplicationFailure("CURSOR_EXPIRED");
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

  // Do not send Authorization, Cookie or any inherited API client headers.
  // Signed links are not allowed to redirect to an uncontrolled destination.
  signal.throwIfAborted();
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

  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  signal.throwIfAborted();
  if (deadline <= Date.now()) {
    throw new ApplicationFailure("CURSOR_EXPIRED");
  }

  return value;
}
