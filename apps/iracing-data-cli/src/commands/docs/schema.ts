import { z } from "zod";

/**
 * Transforms the raw command input to a schema type.
 */
export const resolveOptions = z
  .object({
    output: z.string().optional(),
    credentials: z.string().optional(),
    accessToken: z.string().optional(),
    format: z.enum(["json", "yaml"]).default("json"),
    force: z.boolean().default(false),
  })
  .transform((options) => ({
    output: options.output,
    credentials: options.credentials,
    accessToken: options.accessToken,
    format: options.format,
    force: options.force,
  }));

/**
 * The raw command input.
 */
export type RawOptions = z.input<typeof resolveOptions>;

/**
 * The normalized command options.
 */
export type Options = z.output<typeof resolveOptions>;
