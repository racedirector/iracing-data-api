/** Series-assets RawOptions-to-Options schema normalization. */
import { DocumentInputSchema } from "../../../services/request.js";
import type { z } from "zod";

/** Only public series-assets flag: --credentials. */
export const RawOptionsSchema = DocumentInputSchema.pick({ credentials: true });

/** Raw Commander options derived from the Zod schema. */
export type RawOptions = z.input<typeof RawOptionsSchema>;

/** Force JSON stdout without exposing a new output flag. */
export const OptionsSchema = RawOptionsSchema.transform((options) => ({
  ...options,
  format: "json" as const,
}));

/** Validated series-assets options. */
export type Options = z.output<typeof OptionsSchema>;
