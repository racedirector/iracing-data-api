import path from "node:path";
import { z } from "zod";

/** The CLI's dedicated MCP token document, separate from its main login. */
export const DEFAULT_CREDENTIAL_FILE = path.resolve(
  ".iracing-data/iracing-data-mcp/credentials.json",
);

const CONFIGURATION_DOCS =
  "https://github.com/racedirector/iracing-data-api/tree/main/apps/iracing-data-mcp#environment-configuration";

/** Actionable startup configuration failure without raw environment values. */
export class McpConfigurationError extends Error {
  /**
   * Identify invalid settings without reflecting credentials or supplied values.
   * @param {readonly string[]} fields - Known configuration field names.
   */
  constructor(fields: readonly string[]) {
    super(
      `Missing or invalid MCP configuration: ${fields.join(", ")}. See ${CONFIGURATION_DOCS}`,
    );
    this.name = "McpConfigurationError";
  }
}

/** Validate environment values and map them directly to listener/stdio options. */
export const EnvironmentSchema = z
  .object({
    IRACING_MCP_LISTEN_HOST: z.string().min(1).default("127.0.0.1"),
    IRACING_MCP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    IRACING_MCP_CREDENTIAL_FILE: z
      .string()
      .min(1)
      .default(DEFAULT_CREDENTIAL_FILE),
  })
  .transform(
    ({
      IRACING_MCP_LISTEN_HOST,
      IRACING_MCP_PORT,
      IRACING_MCP_CREDENTIAL_FILE,
    }) => ({
      host: IRACING_MCP_LISTEN_HOST,
      port: IRACING_MCP_PORT,
      credentialsFile: IRACING_MCP_CREDENTIAL_FILE,
    }),
  );

/** Validated runtime settings with defaults already applied. */
export type McpConfig = z.infer<typeof EnvironmentSchema>;

const RegistrationEnvironmentSchema = z
  .object({
    IRACING_AUTH_CLIENT: z.string().trim().min(1),
    IRACING_AUTH_SECRET: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).optional(),
    ),
  })
  .transform(({ IRACING_AUTH_CLIENT, IRACING_AUTH_SECRET }) => ({
    clientId: IRACING_AUTH_CLIENT,
    clientSecret: IRACING_AUTH_SECRET,
    scopes: [],
  }));

/** File-backed stdio settings with explicitly validated OAuth registration. */
export interface StdioConfig extends McpConfig {
  /** Registration used to acquire and refresh the selected OAuth session. */
  clientMetadata: z.infer<typeof RegistrationEnvironmentSchema>;
}

/**
 * Parse runtime configuration without printing untrusted values.
 * @param {NodeJS.ProcessEnv} environment - Source environment.
 * @returns {McpConfig} Validated listener and local credential settings.
 * @throws {Error} When environment configuration is invalid.
 */
export function parseConfig(
  environment: NodeJS.ProcessEnv = process.env,
): McpConfig {
  const result = EnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new McpConfigurationError(
      result.error.issues.map((issue) => issue.path.join(".")),
    );
  }

  return result.data;
}

/**
 * Validate local OAuth registration separately from HTTP listener configuration.
 * @param {NodeJS.ProcessEnv} environment - Already supplied process environment.
 * @returns {StdioConfig} Runtime options and explicit OAuth client metadata.
 * @throws {McpConfigurationError} When local configuration is missing or invalid.
 */
export function parseStdioConfig(
  environment: NodeJS.ProcessEnv = process.env,
): StdioConfig {
  const runtime = EnvironmentSchema.safeParse(environment);

  const registration = RegistrationEnvironmentSchema.safeParse(environment);

  if (!runtime.success || !registration.success) {
    throw new McpConfigurationError(
      [runtime, registration].flatMap((result) =>
        result.success
          ? []
          : result.error.issues.map((issue) => issue.path.join(".")),
      ),
    );
  }

  return { ...runtime.data, clientMetadata: registration.data };
}
