import { z } from "zod";
import { ApplicationFailure } from "./diagnostics/errors.js";

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
  const parsed = McpApplicationConfigSchema.safeParse(input);
  if (!parsed.success) throw new ApplicationFailure("CONFIGURATION_ERROR");
  return Object.freeze(parsed.data);
}
