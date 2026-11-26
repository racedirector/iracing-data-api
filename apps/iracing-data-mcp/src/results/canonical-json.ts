/**
 * Canonical JSON for stored race-result documents.
 *
 * Object keys are sorted recursively so an upstream key reorder is not mistaken
 * for an amendment; array order remains significant because it carries upstream
 * session and participant ordering. The compact serialization is hashed over its
 * UTF-8 bytes so amendment detection is stable across platforms.
 */
import { createHash } from "node:crypto";

/** Defensive ceiling for a canonical stored document, independent of pruning. */
export const MAX_CANONICAL_DOCUMENT_BYTES = 2 * 1024 * 1024;

/**
 * Measure UTF-8 bytes without allocating a second copy of the text.
 *
 * @param {string} text - Serialized JSON or other text.
 * @returns {number} UTF-8 byte length.
 */
export function utf8ByteLength(text: string): number {
  return Buffer.byteLength(text, "utf8");
}

/**
 * Recursively sort object keys while preserving array order.
 *
 * Undefined object values are dropped, matching JSON serialization; `undefined`
 * array entries become `null`, also matching JSON.
 *
 * @param {unknown} value - Parsed JSON value.
 * @returns {unknown} Canonical value with deterministic key order.
 */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) =>
      entry === undefined ? null : canonicalize(entry),
    );
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  const source = value as Record<string, unknown>;

  // Null prototype is required: assignment of "__proto__" on a plain object
  // invokes the inherited setter and silently drops an own JSON property.
  const result: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;

  for (const key of Object.keys(source).sort()) {
    if (source[key] !== undefined) {
      result[key] = canonicalize(source[key]);
    }
  }

  return result;
}

/**
 * Serialize a value as compact canonical JSON.
 *
 * @param {unknown} value - Parsed JSON value.
 * @returns {string} Compact JSON with recursively sorted object keys.
 */
export function serializeCanonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

/**
 * Compute the stored content hash in `sha256:<hex>` form.
 *
 * @param {string} canonicalJson - Compact canonical JSON text.
 * @returns {string} `sha256:` prefixed lowercase hex digest.
 */
export function canonicalContentHash(canonicalJson: string): string {
  return `sha256:${createHash("sha256").update(canonicalJson, "utf8").digest("hex")}`;
}
