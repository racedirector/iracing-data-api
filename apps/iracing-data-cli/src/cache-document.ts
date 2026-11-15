/**
 * Materialize an opaque API-returned HTTPS URL without API credentials.
 * @param {string} link - Opaque cache reference from a modeled response.
 * @param {typeof fetch} transport - Host-owned HTTP transport.
 * @returns {Promise<unknown>} Decoded JSON document.
 */
export async function downloadCacheDocument(
  link: string,
  transport: typeof fetch,
): Promise<unknown> {
  const response = await downloadCacheResponse(link, transport);

  return await response.json();
}

/**
 * Download a text payload from an opaque API-returned URL without credentials.
 * @param {string} link - Opaque cache URL.
 * @param {typeof fetch} transport - Host transport.
 * @returns {Promise<string>} Exact response text.
 */
export async function downloadCacheText(
  link: string,
  transport: typeof fetch,
): Promise<string> {
  const response = await downloadCacheResponse(link, transport);

  return await response.text();
}

/**
 * Validate and request an opaque cache link.
 * @param {string} link - Opaque cache URL.
 * @param {typeof fetch} transport - Host transport.
 * @returns {Promise<Response>} Successful credential-free response.
 */
async function downloadCacheResponse(
  link: string,
  transport: typeof fetch,
): Promise<Response> {
  const url = new URL(link);

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Unsafe cache URL.");
  }

  const response = await transport(url);

  if (!response.ok) {
    throw new Error("Cache download failed.");
  }

  return response;
}
