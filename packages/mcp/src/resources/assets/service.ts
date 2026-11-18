import { z } from "zod";
import type { ResourceSchema } from "../schemas.js";
import type { CatalogResolver } from "../service.js";

/** Static asset namespace owned by one upstream metadata document. */
export type AssetKind = "cars" | "tracks" | "series";

/** Static asset identity and host-owned indexed metadata access. */
export interface AssetCatalog {
  /** Optional standalone JSON acceptance schemas. */
  readonly schemas?: readonly ResourceSchema[];

  /** Collection name used in resource URIs. */
  readonly kind: AssetKind;

  /** Upstream entity key, such as track_id. */
  readonly idField: string;

  /** Indexed metadata entries over a lazy persisted document. */
  readonly resolver: CatalogResolver<Record<string, unknown>>;
}

/** Payload from a credential-free static media fetch. */
export interface AssetMedia {
  /** Validated HTTP media type. */
  readonly mimeType: string;

  /** Base64-encoded response bytes for MCP blob resource content. */
  readonly blob: string;
}

/** Supported binary image selectors; gallery references remain metadata. */
export const ImageFieldSchema = z.enum([
  "small_image",
  "large_image",
  "logo",
  "sponsor_logo",
  "group_image",
]);

/**
 * Runtime-injected data-plane transport; never receives OAuth credentials.
 * @param {URL} url - Validated official static asset URL.
 * @param {AbortSignal} signal - Resource read cancellation.
 * @returns {Promise<AssetMedia>} Bounded base64 media with its MIME type.
 */
export type ReadAssetMedia = (
  url: URL,
  signal: AbortSignal,
) => Promise<AssetMedia>;

/**
 * Require an unambiguous, positive upstream asset identity from a URI variable.
 * @param {string | string[] | undefined} value - Resource template variable.
 * @returns {number} Validated upstream entity key.
 * @throws {Error} When the ID is malformed or unsafe.
 */
export function assetId(value: string | string[] | undefined): number {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  ) {
    throw new Error("Invalid asset ID: expected a positive safe integer.");
  }

  return Number(value);
}

const imageBase = new URL("https://images-static.iracing.com/");

const mapOrigin = "https://members-assets.iracing.com";

/** Reject unexpected origins, credentials, queries and encoded path tricks. */
function trustedUrl(value: string, base: URL, prefix: string): URL {
  if (/%(?:2e|2f|5c)|\\/i.test(value) || /\p{Cc}/u.test(value)) {
    throw new Error("Unsafe asset reference.");
  }

  const target = new URL(value, base);

  if (
    target.protocol !== "https:" ||
    target.origin !== base.origin ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    !target.pathname.startsWith(prefix)
  ) {
    throw new Error("Unsafe asset reference.");
  }

  return target;
}

/**
 * Resolve only supported metadata image fields, never caller-supplied URLs.
 * @param {AssetKind} kind - Static metadata namespace.
 * @param {Record<string, unknown>} entry - Validated upstream asset entry.
 * @param {string} field - Supported image selector.
 * @returns {URL} Credential-free image URL on the official image host.
 * @throws {Error} When the selector, metadata or resolved URL is unsafe or unavailable.
 */
export function imageUrl(
  kind: AssetKind,
  entry: Record<string, unknown>,
  field: string,
): URL {
  const selector = ImageFieldSchema.parse(field);

  const value = entry[selector];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Image ${selector} is not available for this asset.`);
  }

  let base = imageBase;

  if (!value.includes("/")) {
    if (kind === "series" && selector === "logo") {
      base = new URL("/img/logos/series/", imageBase);
    } else if (typeof entry.folder === "string" && entry.folder) {
      base = trustedUrl(
        `${trimTrailingSlashes(entry.folder)}/`,
        imageBase,
        "/img/",
      );
    } else {
      throw new Error("Image filename has no verified asset folder.");
    }
  }

  return trustedUrl(value, base, "/img/");
}

/** Trim in one linear pass; unanchored trailing-slash regexes can backtrack quadratically. */
function trimTrailingSlashes(value: string): string {
  let end = value.length;

  while (end > 0 && value[end - 1] === "/") {
    end--;
  }

  return value.slice(0, end);
}

/**
 * Resolve an advertised map layer inside its official track-map directory.
 * @param {Record<string, unknown>} entry - Validated track asset metadata.
 * @param {string} layer - Exact key from track_map_layers.
 * @returns {URL} Safe absolute map-layer URL.
 * @throws {Error} When the map layer or its URL is unsafe or unavailable.
 */
export function trackMapUrl(
  entry: Record<string, unknown>,
  layer: string,
): URL {
  const layers = entry.track_map_layers;

  if (!layers || typeof layers !== "object" || !Object.hasOwn(layers, layer)) {
    throw new Error(
      "Track map layer not found; read track asset metadata for available layers.",
    );
  }

  const reference = (layers as Record<string, unknown>)[layer];

  if (
    typeof entry.track_map !== "string" ||
    typeof reference !== "string" ||
    !reference
  ) {
    throw new Error("Track map reference is unavailable.");
  }

  const base = trustedUrl(
    entry.track_map,
    new URL(mapOrigin),
    "/public/track-maps/",
  );

  if (!base.pathname.endsWith("/")) {
    throw new Error("Track map base must identify a directory.");
  }

  return trustedUrl(reference, base, base.pathname);
}
