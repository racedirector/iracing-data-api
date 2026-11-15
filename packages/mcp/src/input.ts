import { z } from "zod";
import type { StandardSchemaWithJSON } from "@modelcontextprotocol/server";

/**
 * Advertise the actual Zod input contract, but let each tool handler validate it.
 * MCP SDK validation alone would turn invalid arguments into protocol errors instead
 * of the existing sanitized INVALID_INPUT tool result.
 * @param {z.ZodType} schema - Tool-local strict Zod input contract to advertise.
 * @returns {StandardSchemaWithJSON} MCP schema exposing JSON Schema while delegating validation to the tool handler.
 */
export function toolInputSchema(schema: z.ZodType): StandardSchemaWithJSON {
  const json = { ...z.toJSONSchema(schema, { io: "input" }), type: "object" };

  return {
    "~standard": {
      version: 1,
      vendor: "iracing-data-mcp",
      validate: (value) => ({ value }),
      jsonSchema: { input: () => json, output: () => json },
    },
  };
}
