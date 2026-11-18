import { z } from "zod";

/** Explicit local maintenance selectors; never arbitrary resource URIs. */
export const RefreshInput = z.strictObject({
  dataset: z.enum([
    "cars",
    "tracks",
    "car-classes",
    "car-assets",
    "track-assets",
    "series-assets",
  ]),
});

/** Bounded summary, not the refreshed payload. */
export const RefreshOutput = z.strictObject({
  dataset: RefreshInput.shape.dataset,
  resource_uri: z.string(),
  count: z.int().nonnegative(),
});

/** Parsed explicit dataset selector. */
export type RefreshInput = z.output<typeof RefreshInput>;

/** Bounded replacement summary. */
export type RefreshOutput = z.output<typeof RefreshOutput>;
