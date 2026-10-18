/** Docs-specific option validation and RawOptions-to-Options normalization. */
import path from "node:path";
import type { z } from "zod";
import {
  DocumentFormatSchema,
  DocumentInputSchema,
} from "../../services/request.js";

/** Commander flags accepted by the docs command before format inference. */
export const RawOptionsSchema = DocumentInputSchema.omit({
  format: true,
}).extend({
  format: DocumentFormatSchema.optional(),
});

/** The raw Commander option shape, derived from its Zod schema. */
export type RawOptions = z.input<typeof RawOptionsSchema>;

/**
 * Validate CLI input and infer its output format within the schema transform.
 * Explicit format always wins; otherwise YAML extensions select YAML, then JSON.
 */
export const OptionsSchema = RawOptionsSchema.transform((options) => ({
  ...options,
  format:
    options.format ??
    (options.output &&
    [".yaml", ".yml"].includes(path.extname(options.output).toLowerCase())
      ? "yaml"
      : "json"),
})).pipe(DocumentInputSchema);

/** Normalized command options passed to the docs handler. */
export type Options = z.output<typeof OptionsSchema>;
