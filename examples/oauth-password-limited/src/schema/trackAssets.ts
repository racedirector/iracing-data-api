import { z } from "zod";

/**
 * Nested object: the SVG layer filenames for the track map.
 */
export const TrackMapLayersSchema = z.object({
  background: z.string(),
  inactive: z.string(),
  active: z.string(),
  pitroad: z.string(),
  "start-finish": z.string(),
  turns: z.string(),
});
export type TrackMapLayersType = z.infer<typeof TrackMapLayersSchema>;

/**
 * Single entry: the value for each track/config key in the JSON file.
 */
export const TrackAssetEntrySchema = z.object({
  // e.g. "35.3511641,-80.6912655"
  coordinates: z.string(),

  // HTML string blob
  detail_copy: z.string().nullable(),

  // Seen as null and also as the literal string "null" in some entries,
  // so treat as "string | null".
  detail_techspecs_copy: z.union([z.string(), z.null()]),

  // Always seemed null in samples, but model as "string | null" for forward-compat.
  detail_video: z.string().nullable(),

  folder: z.string(),

  // Seen as string like "1,2,3" and also null in some entries.
  gallery_images: z.string().nullable(),

  // Seen as string and also null in some entries.
  gallery_prefix: z.string().nullable(),

  large_image: z.string(),
  logo: z.string(),

  // Seen as strings like "90deg" / "160deg" and also null in some entries.
  north: z.string().nullable(),

  num_svg_images: z.number().int(),
  small_image: z.string(),

  track_id: z.number().int(),

  // URL string
  track_map: z.string(),

  track_map_layers: TrackMapLayersSchema,
});
export type TrackAssetEntryType = z.infer<typeof TrackAssetEntrySchema>;

/**
 * Keys are numeric IDs encoded as strings (e.g. "551", "44", etc.)
 */
export const TrackAssetKeySchema = z
  .string()
  .regex(/^\d+$/, "Expected a numeric string track asset key");
export type TrackAssetKeyType = z.infer<typeof TrackAssetKeySchema>;

/**
 * Entire JSON file: record keyed by track/config ID (stringified number).
 */
export const TrackAssetJSONFileSchema = z.record(
  TrackAssetKeySchema,
  TrackAssetEntrySchema,
);
export type TrackAssetJSONFileType = z.infer<typeof TrackAssetJSONFileSchema>;
