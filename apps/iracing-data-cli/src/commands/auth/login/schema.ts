import { IRacingOAuthScopesArraySchema } from "@iracing-data/oauth-client";
import { z } from "zod";

/** Supported login methods. */
export const LoginMethodSchema = z.enum(["browser", "password-limited"]).meta({
  description: "Authentication methods supported by the login command",
});

/**
 * Transforms the raw command input to a schema type.
 */
export const resolveOptions = z
  .object({
    method: z.string(),
    output: z.string().optional(),
    credentials: z.string().optional(),
    scope: z.array(z.string()).optional(),
    format: z.string().optional(),
    force: z.literal(true).optional(),
    open: z.boolean(),
    timeoutSeconds: z.string(),
  })
  .refine(({ output, credentials }) => !(output && credentials), {
    error: "Use either --output or --credentials, not both.",
  })
  .transform((options) => ({
    method: z
      .string()
      .optional()
      .default("browser")
      .pipe(LoginMethodSchema)
      .parse(options.method),
    output: options.output,
    credentials: options.credentials,
    scopes: IRacingOAuthScopesArraySchema.min(1)
      .default(["iracing.auth", "iracing.profile"])
      .transform((scopes) => [...new Set(scopes)])
      .parse(options.scope),
    format: z
      .enum(["json", "yaml"])
      .meta({
        description: "Token serialization format",
      })
      .parse(options.format ?? "json"),
    force: options.force ?? false,
    open: options.open,
    timeoutSeconds: z.coerce
      .number()
      .int()
      .positive()
      .parse(options.timeoutSeconds),
  }));

/**
 * The raw CLI command input.
 */
export type RawLoginOptions = z.input<typeof resolveOptions>;

/**
 * The login command options.
 */
export type LoginOptions = z.infer<typeof resolveOptions>;
