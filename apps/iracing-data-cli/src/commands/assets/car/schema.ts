/** Car-assets option validation and RawOptions-to-Options normalization. */
import { DocumentInputSchema } from "../../../services/request.js";
import type { z } from "zod";

/** The only public car-assets flag is --credentials. */
export const RawOptionsSchema = DocumentInputSchema.pick({ credentials: true });
export type RawOptions = z.input<typeof RawOptionsSchema>;

/** JSON stdout is fixed policy, not an additional Commander option. */
export const OptionsSchema = RawOptionsSchema.transform((options) => ({
  ...options,
  format: "json" as const,
}));
export type Options = z.output<typeof OptionsSchema>;
