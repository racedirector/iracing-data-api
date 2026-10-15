import { ResultsSearchSeriesResponseSchema } from "@iracing-data/api-schema";
import { z } from "zod";
import { ApplicationFailure } from "../../diagnostics/errors.js";
import { parse, linkedUrl } from "../../linked-response.js";
const objectPayload = z.record(z.string(), z.unknown());

function invalidData(): never {
  throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
    reason: "invalid_data",
  });
}

/**
 * Validate an HTTPS URL without embedded credentials. Directory URLs must end in
 * a slash and have no query or fragment. Rejections throw DATA_RESOLUTION_FAILED.
 */
function cacheUrl(input: string, directory = false): URL {
  const url = linkedUrl(input);

  if (directory && (!url.pathname.endsWith("/") || url.search || url.hash)) {
    invalidData();
  }

  return url;
}

/**
 * Resolve a filename of at most 255 characters within the API-provided HTTPS directory.
 * Reject invalid directories, unsupported filename characters, or paths outside that
 * directory with DATA_RESOLUTION_FAILED.
 */
export function chunkUrl(base: string, filename: string): URL {
  const url = cacheUrl(base, true);

  if (
    !/^[A-Za-z0-9][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)*$/.test(filename) ||
    filename.length > 255
  ) {
    invalidData();
  }

  const child = new URL(filename, url);

  if (
    child.origin !== url.origin ||
    child.pathname !== url.pathname + filename
  ) {
    invalidData();
  }

  return child;
}

/**
 * Return chunk metadata for a successful search with consistent counts and safe URLs.
 * Allows at most 1,000 chunks and 500,000 rows; an empty result must have no chunks.
 * Malformed metadata or unsafe download paths throw DATA_RESOLUTION_FAILED.
 */
export function parseManifest(value: unknown) {
  const wire = parse(
    objectPayload,
    parse(objectPayload, parse(objectPayload, value).data).chunk_info,
  );

  if (typeof wire.base_download_url !== "string") {
    invalidData();
  }

  cacheUrl(wire.base_download_url, true);
  const manifest = parse(ResultsSearchSeriesResponseSchema, value);

  const { success, chunk_info: info } = manifest.data;

  if (
    !success ||
    info.num_chunks > 1000 ||
    info.rows > 500_000 ||
    info.num_chunks !== info.chunk_file_names.length ||
    new Set(info.chunk_file_names).size !== info.num_chunks ||
    (info.rows === 0
      ? info.num_chunks !== 0
      : info.chunk_size === 0 ||
        info.num_chunks !== Math.ceil(info.rows / info.chunk_size))
  ) {
    invalidData();
  }

  cacheUrl(info.base_download_url, true);
  for (const filename of info.chunk_file_names) {
    chunkUrl(info.base_download_url, filename);
  }

  return info;
}

/** Optional manifest echoes may be absent, but must never contradict the request. */
export function validateSearchEcho(
  value: unknown,
  expected: Record<string, unknown>,
): void {
  const params = parse(
    objectPayload,
    parse(objectPayload, parse(objectPayload, value).data).params,
  );

  for (const [key, wanted] of Object.entries(expected)) {
    if (
      wanted !== undefined &&
      Object.hasOwn(params, key) &&
      normalize(key, params[key]) !== normalize(key, wanted)
    ) {
      invalidData();
    }
  }

  if (
    expected.cust_id !== undefined &&
    expected.team_id === undefined &&
    params.team_id != null &&
    normalize("team_id", params.team_id) !== 0
  ) {
    invalidData();
  }
}

function normalize(key: string, input: unknown): unknown {
  if (key.endsWith("_begin") || key.endsWith("_end")) {
    return typeof input === "string" && Number.isFinite(Date.parse(input))
      ? Date.parse(input)
      : input;
  }

  if (key === "event_types" || key === "category_ids") {
    const values = listValues(input);

    return values.map(String).sort().join(",");
  }

  if (key === "official_only") {
    return normalizeBoolean(input);
  }

  return typeof input === "string" && /^\d+$/.test(input)
    ? Number(input)
    : input;
}

function normalizeBoolean(input: unknown): unknown {
  if (input === true || input === "true" || input === 1 || input === "1") {
    return true;
  }

  if (input === false || input === "false" || input === 0 || input === "0") {
    return false;
  }

  return input;
}

function listValues(input: unknown): unknown[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === "string") {
    return input.split(",");
  }

  return [input];
}
