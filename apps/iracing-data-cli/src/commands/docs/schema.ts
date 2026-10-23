import { z } from "zod";

/**
 * Transforms the raw command input to a schema type.
 */
export const resolveOptions = z
  .object({
    output: z.string().optional(),
    credentials: z.string().optional(),
    format: z.string().optional(),
    force: z.literal(true).optional(),
  })
  .transform((options) => ({
    output: options.output,
    credentials: options.credentials,
    format: z
      .enum(["json", "yaml"])
      .meta({
        description: "Token serialization format",
      })
      .parse(options.format ?? "json"),
    force: options.force ?? false,
  }));

/**
 * The raw command input.
 */
export type RawOptions = z.input<typeof resolveOptions>;

/**
 * The normalized command options.
 */
export type Options = z.output<typeof resolveOptions>;
