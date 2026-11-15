import path from "node:path";
import { z } from "zod";

/**
 * Transforms the raw command input to a schema type.
 */
export const resolveOptions = z
  .object({
    output: z.string().optional(),
    credentials: z.string().optional(),
    accessToken: z.string().optional(),
    format: z.enum(["json", "yaml"]).optional(),
    force: z.boolean().default(false),
  })
  .transform((options) => ({
    output: options.output,
    credentials: options.credentials,
    accessToken: options.accessToken,
    format:
      options.format ??
      (options.output &&
      [".yaml", ".yml"].includes(path.extname(options.output).toLowerCase())
        ? "yaml"
        : "json"),
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
