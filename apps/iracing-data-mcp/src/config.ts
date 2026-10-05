import { z } from "zod";

export const McpApplicationConfigSchema = z.object({
  name: z.string().trim().min(1).default("iracing-data-mcp"),
  version: z.string().trim().min(1).default("0.0.0"),
});

export type McpApplicationConfig = Readonly<
  z.infer<typeof McpApplicationConfigSchema>
>;

export function parseMcpApplicationConfig(
  input: unknown = {},
): McpApplicationConfig {
  return Object.freeze(McpApplicationConfigSchema.parse(input));
}
