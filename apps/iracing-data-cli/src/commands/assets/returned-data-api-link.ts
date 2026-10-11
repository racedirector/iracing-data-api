const DEFAULT_RETURNED_LINK_TIMEOUT_MS = 15_000;

/** Injectable transport and timeout policy for returned Data API links. */
export interface ReturnedDataApiLinkDependencies {
  fetch(input: string, init: RequestInit): Promise<Response>;
  timeoutMs: number;
}

const defaultDependencies: ReturnedDataApiLinkDependencies = {
  fetch(input, init) {
    return globalThis.fetch(input, init);
  },
  timeoutMs: DEFAULT_RETURNED_LINK_TIMEOUT_MS,
};

/** Validate that an opaque Data API data-plane link is an absolute HTTPS URL. */
function validateReturnedLink(link: string): void {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw new Error(
      "Data API returned an invalid asset link. Retry the command to obtain a fresh link.",
    );
  }

  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    throw new Error(
      "Data API returned a non-HTTPS or credential-bearing asset link. The link was not requested.",
    );
  }
}

/**
 * Materialize one opaque link returned by the modeled Data API request.
 *
 * The request intentionally sends no iRacing Authorization header. Failures expose only
 * fixed transport/status/JSON diagnostics and never include arbitrary response bodies.
 */
export async function materializeReturnedDataApiLink(
  link: string,
  dependencies: ReturnedDataApiLinkDependencies = defaultDependencies,
): Promise<unknown> {
  validateReturnedLink(link);

  let response: Response;
  try {
    response = await dependencies.fetch(link, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(dependencies.timeoutMs),
    });
  } catch {
    throw new Error(
      "Asset payload request failed (network or timeout). Check connectivity and retry.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `Asset payload request failed with HTTP ${response.status}. Retry the command to obtain a fresh link.`,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    throw new Error(
      "Asset payload response was not JSON. No response body logged.",
    );
  }

  try {
    return await response.json();
  } catch {
    throw new Error(
      "Asset payload response was not valid JSON. No response body logged.",
    );
  }
}
