import { ApplicationFailure } from "@iracing-data/mcp-server";
import { z } from "zod";

export const McpApplicationConfigSchema = z.object({
  name: z.string().trim().min(1).default("iracing-data-mcp"),
  version: z.string().trim().min(1).default("0.0.0"),
});

/**
 * Frozen application identity configuration consumed by MCP composition after schema
 * validation and defaulting.
 */
export type McpApplicationConfig = Readonly<
  z.infer<typeof McpApplicationConfigSchema>
>;

/**
 * Validates and freezes MCP application configuration, mapping invalid startup input to the
 * repository configuration-failure contract.
 */
export function parseMcpApplicationConfig(
  input: unknown = {},
): McpApplicationConfig {
  const parsed = McpApplicationConfigSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApplicationFailure("CONFIGURATION_ERROR");
  }

  return Object.freeze(parsed.data);
}
