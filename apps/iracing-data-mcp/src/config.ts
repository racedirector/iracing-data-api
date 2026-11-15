import { fileURLToPath } from "node:url";
import { z } from "zod";

/** The CLI's dedicated MCP token document, separate from its main login. */
export const DEFAULT_CREDENTIAL_FILE = fileURLToPath(
  new URL("../../../.iracing-data/iracing-data-mcp/credentials.json", import.meta.url),
);

/** Validate environment values and map them directly to listener/stdio options. */
export const EnvironmentSchema = z
  .object({
    IRACING_MCP_LISTEN_HOST: z.string().min(1).default("127.0.0.1"),
    IRACING_MCP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    IRACING_MCP_CREDENTIAL_FILE: z.string().min(1).default(DEFAULT_CREDENTIAL_FILE),
  })
  .transform(({ IRACING_MCP_LISTEN_HOST, IRACING_MCP_PORT, IRACING_MCP_CREDENTIAL_FILE }) => ({
    host: IRACING_MCP_LISTEN_HOST,
    port: IRACING_MCP_PORT,
    credentialsFile: IRACING_MCP_CREDENTIAL_FILE,
  }));

/** Validated runtime settings with defaults already applied. */
export type McpConfig = z.infer<typeof EnvironmentSchema>;

/**
 * Parse runtime configuration without printing untrusted values.
 * @param {NodeJS.ProcessEnv} environment - Source environment.
 * @returns {McpConfig} Validated listener and local credential settings.
 */
export function parseConfig(environment: NodeJS.ProcessEnv = process.env): McpConfig {
  const result = EnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new Error("Invalid MCP runtime configuration.");
  }

  return result.data;
}
