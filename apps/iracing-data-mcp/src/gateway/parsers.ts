import {
  APIResponseSchema,
  ConstantsResponseSchema,
  ResultsSearchSeriesResponseSchema,
  ServicesDocsResponseSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import { cacheUrl, chunkUrl, invalidData } from "./policy.js";

export const objectPayload = z.record(z.string(), z.unknown());
export const arrayPayload = z.array(objectPayload);
export const payloadSchemas = {
  member: objectPayload.refine(
    (value) =>
      Number.isSafeInteger(value.cust_id) &&
      (value.cust_id as number) > 0 &&
      typeof value.display_name === "string",
  ),
  drivers: arrayPayload,
  cars: arrayPayload,
  tracks: arrayPayload,
  seasons: z.object({ seasons: arrayPayload }).passthrough(),
  schedule: z
    .object({
      success: z.literal(true),
      season_id: z.number().int().positive(),
      schedules: arrayPayload,
    })
    .passthrough(),
  recent: z
    .object({ cust_id: z.number().int().positive(), races: arrayPayload })
    .passthrough(),
  result: z.object({ session_results: arrayPayload }).passthrough(),
};

/** Return schema-parsed data or throw DATA_RESOLUTION_FAILED with reason invalid_data. */
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    invalidData();
  }

  return parsed.data;
}

/**
 * Validate a cache link and return its URL and expiry in Unix milliseconds.
 * Does not check freshness. Malformed data or unsafe URLs throw DATA_RESOLUTION_FAILED.
 */
export function parseEnvelope(value: unknown) {
  // Zod URL validation trims whitespace/strips tabs: reject the original wire URL first.
  const wire = parse(objectPayload, value);

  if (typeof wire.link !== "string") {
    invalidData();
  }

  cacheUrl(wire.link);
  const envelope = parse(APIResponseSchema, value);

  cacheUrl(envelope.link);

  return { url: envelope.link, expiry: Date.parse(envelope.expires) };
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

export const directSchemas = {
  document: ServicesDocsResponseSchema,
  constants: ConstantsResponseSchema,
};
