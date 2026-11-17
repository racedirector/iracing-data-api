import { z } from "zod";

/** The supported, non-personal reference catalogs. */
export const ReferenceKind = z.enum([
  "cars",
  "tracks",
  "series",
  "car-classes",
]);

/** Strict bounded lookup; no arbitrary URI, upstream URL or account selection. */
export const FindReferenceInput = z.strictObject({
  kind: ReferenceKind,
  query: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .refine(
      (query) => !/^\d+$/.test(query) || Number.isSafeInteger(Number(query)),
      "Numeric queries must be safe integer IDs",
    )
    .meta({
      description:
        "Exact numeric ID, or case-insensitive entity name/manufacturer/model keywords, e.g. BMW. Omit request words such as logo or image. All whitespace-separated keywords must match; no fuzzy matching.",
    }),
  limit: z.int().min(1).max(20).default(5),
});

/** Narrow input from a host's reference provider, never arbitrary upstream fields. */
export const ReferenceEntrySchema = z.object({
  id: z.int().nonnegative(),
  name: z.string().min(1).max(256),
  aliases: z.array(z.string().max(256)).optional(),
});

/** One selected catalog snapshot and the resource surfaces actually available. */
export const ReferenceDatasetSchema = z.object({
  entries: z.array(ReferenceEntrySchema),
  metadata_available: z.boolean(),
  assets_available: z.boolean(),
});

/** Bounded candidates with links only to resources exposed by their host. */
export const FindReferenceOutput = z.object({
  kind: ReferenceKind,
  query: z.string().min(1).max(120),
  available: z.boolean().meta({
    description:
      "False means the host did not configure this catalog, not that the entity does not exist.",
  }),
  total_matches: z.int().nonnegative(),
  returned_count: z.int().nonnegative(),
  has_more: z.boolean(),
  matches: z
    .array(
      z.object({
        id: z.int().nonnegative(),
        name: z.string().min(1).max(256),
        metadata_uri: z.url().optional(),
        asset_metadata_uri: z.url().optional(),
        media_index_uri: z.url().optional(),
      }),
    )
    .max(20),
});

export type ReferenceKind = z.infer<typeof ReferenceKind>;
export type FindReferenceInput = z.infer<typeof FindReferenceInput>;
export type FindReferenceOutput = z.infer<typeof FindReferenceOutput>;
export type ReferenceEntry = z.infer<typeof ReferenceEntrySchema>;
export type ReferenceDataset = z.infer<typeof ReferenceDatasetSchema>;
