/** The docs command's Commander input validation and normalization boundary. */
import { z } from "zod";
import { resolveTokenFormat } from "../token-output.js";

/**
 * Normalize Commander flags into a service-ready request.
 * Validates explicit formats before any credential or network I/O.
 */
export const DocsOptionsSchema = z
  .object({
    credentials: z.string().optional(),
    output: z.string().optional(),
    format: z.string().optional(),
    force: z.boolean().optional(),
  })
  .transform((input, context) => {
    if (
      input.format !== undefined &&
      input.format !== "json" &&
      input.format !== "yaml"
    ) {
      context.addIssue({
        code: "custom",
        path: ["format"],
        message: "Unsupported output format: " + input.format,
      });
      return z.NEVER;
    }

    return {
      ...input,
      format: resolveTokenFormat(input.output, input.format),
    };
  });

/** Raw Commander option shape accepted by the schema. */
export type RawDocsOptions = z.input<typeof DocsOptionsSchema>;

/** Fully validated input passed to the docs execution service. */
export type ParsedDocsOptions = z.output<typeof DocsOptionsSchema>;
