import type { ReadAssetMedia } from "@iracing-data/mcp";

const maxBytes = 5 * 1024 * 1024;

const imageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

/**
 * Create a bounded unsigned media transport for verified static asset URLs.
 * @param {typeof fetch} fetchApi - Independent unsigned transport.
 * @returns {ReadAssetMedia} Fetcher returning MCP-compatible base64 media.
 */
export function createAssetMediaReader(
  fetchApi: typeof fetch = fetch,
): ReadAssetMedia {
  return async (url, signal) => {
    signal.throwIfAborted();
    const response = await fetchApi(url.href, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
      redirect: "error",
      credentials: "omit",
    });

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `Static asset request failed (HTTP ${String(response.status)}).`,
      );
    }

    const mimeType =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() ?? "";

    if (!imageTypes.has(mimeType)) {
      await response.body?.cancel();
      throw new Error("Static asset response is not a supported image.");
    }

    if (Number(response.headers.get("content-length")) > maxBytes) {
      await response.body?.cancel();
      throw new Error("Static asset exceeds the 5 MiB limit.");
    }

    if (!response.body) {
      throw new Error("Static asset response has no body.");
    }

    const bytes = await readBoundedBody(response.body);

    return { mimeType, blob: bytes.toString("base64") };
  };
}

async function readBoundedBody(
  body: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = body.getReader();

  const chunks: Uint8Array[] = [];

  let size = 0;

  try {
    let chunk = await reader.read();

    while (!chunk.done) {
      size += chunk.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Static asset exceeds the 5 MiB limit.");
      }

      chunks.push(chunk.value);
      chunk = await reader.read();
    }
  } finally {
    reader.releaseLock();
  }

  if (!size) {
    throw new Error("Static asset response is empty.");
  }

  return Buffer.concat(chunks);
}
