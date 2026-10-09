/**
 * Transport mechanism for the gateway's fixed upstream policy.
 *
 * DNS is resolved for each request, every answer is vetted and the first address
 * is pinned for the socket while TLS validates the original hostname. There is
 * no proxy/environment agent, cookie jar, redirect following or connection reuse.
 * The gateway chooses authorization headers; cache downloads must remain isolated
 * from API bearer headers. Decoding precedes gateway byte accounting, so compressed
 * payloads cannot bypass decoded-size limits. This transport deliberately leaves
 * URL/status/time/size policy to its caller and propagates abort/body errors.
 */
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";
import { Readable } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { isPublicAddress, unsafeLink } from "./policy.js";

export type GatewayTransport = (
  url: URL,
  init: RequestInit,
) => Promise<Response>;
export type GatewayLookup = (
  hostname: string,
) => Promise<readonly { address: string; family: number }[]>;

/**
 * Create a GET transport that checks every DNS answer and pins TLS to the first.
 * Lookup occurs for each request. No proxy/environment agent, cookie storage,
 * redirect following or connection reuse is used; supplied headers are forwarded.
 * Returns a streaming body decoded from gzip, Brotli, or deflate, with encoding
 * and length headers removed. Callers must enforce URL, status, size, and time limits.
 * Transport requests reject unsafe DNS answers or unsupported encodings with
 * DATA_RESOLUTION_FAILED;
 * lookup, connection, and abort errors propagate, as do errors while reading the body.
 */
export function createGatewayTransport(
  resolve: GatewayLookup = (hostname) => lookup(hostname, { all: true }),
  connect: typeof request = request,
): GatewayTransport {
  return async (url, init) => {
    const addresses = await resolve(url.hostname);

    if (
      !addresses.length ||
      addresses.some(
        (item) =>
          !isPublicAddress(item.address) ||
          (item.family !== 4 && item.family !== 6) ||
          isIP(item.address) !== item.family,
      )
    ) {
      unsafeLink();
    }

    init.signal?.throwIfAborted();
    const pinned = addresses[0];

    return await new Promise<Response>((accept, reject) => {
      const req = connect(
        url,
        {
          method: "GET",
          agent: false,
          family: pinned.family,
          rejectUnauthorized: true,
          servername: url.hostname,
          signal: init.signal ?? undefined,
          headers: Object.fromEntries(new Headers(init.headers)),

          // TLS still verifies the original host; this callback never resolves again.
          lookup: (_hostname, _options, callback) =>
            callback(null, pinned.address, pinned.family),
        },
        (incoming) => {
          const headers = new Headers();

          for (const [key, value] of Object.entries(incoming.headers)) {
            if (value !== undefined) {
              headers.set(key, Array.isArray(value) ? value.join(", ") : value);
            }
          }

          const encoding = headers.get("content-encoding");

          const decoder =
            encoding === "gzip"
              ? createGunzip()
              : encoding === "deflate"
                ? createInflate()
                : encoding === "br"
                  ? createBrotliDecompress()
                  : undefined;

          if (encoding && encoding !== "identity" && !decoder) {
            incoming.destroy();
            reject(
              new ApplicationFailure("DATA_RESOLUTION_FAILED", {
                reason: "invalid_data",
              }),
            );

            return;
          }

          // Errors/abort propagate through decompression. The caller counts decoded bytes.
          if (decoder) {
            incoming.on("error", (error) => decoder.destroy(error));
          }

          const stream = decoder ? incoming.pipe(decoder) : incoming;

          stream.on("close", () => {
            if (!incoming.complete) {
              req.destroy();
            }
          });
          headers.delete("content-encoding");
          headers.delete("content-length");
          const status = incoming.statusCode ?? 502;

          if ([204, 205, 304].includes(status)) {
            incoming.destroy();
            accept(new Response(null, { status, headers }));
          } else {
            accept(
              new Response(
                Readable.toWeb(stream) as ReadableStream<Uint8Array>,
                { status, headers },
              ),
            );
          }
        },
      );

      req.on("error", reject);
      req.end();
    });
  };
}
