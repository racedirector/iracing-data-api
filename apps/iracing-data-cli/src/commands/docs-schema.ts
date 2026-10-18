/** The docs command's Commander input validation and normalization boundary. */
import { z } from "zod";
import { resolveTokenFormat } from "../token-output.js";

/** Raw Commander values and allowed options for the docs command. */
const RawDocsOptionsSchema = z.strictObject({
  credentials: z.string().optional(),
  output: z.string().optional(),
  format: z.enum(["json", "yaml"]).optional(),
  force: z.boolean().optional(),
});

/** Raw Commander option shape accepted by the schema. */
export type RawDocsOptions = z.input<typeof RawDocsOptionsSchema>;

/**
 * Transform accepted Commander input into a fully normalized request.
 * Zod validates explicit formats before any credential or network I/O.
 */
export const DocsOptionsSchema = RawDocsOptionsSchema.transform((options) => ({
  ...options,
  format: resolveTokenFormat(options.output, options.format),
}));

/** Fully validated input passed to the docs command service. */
export type DocsOptions = z.output<typeof DocsOptionsSchema>;
