import { z } from "zod";
import type { StandardSchemaWithJSON } from "@modelcontextprotocol/server";

/**
 * Advertise the Zod wire input while deferring parsing to the execution adapter.
 * SDK-native failures are text-only tool errors; the adapter preserves our fixed,
 * correlated INVALID_INPUT envelope without parsing or transforming input twice.
 * @param {z.ZodType} schema - Tool-local strict Zod input contract to advertise.
 * @returns {StandardSchemaWithJSON} MCP schema exposing JSON Schema while delegating validation to the tool handler.
 * @throws {Error} If the wire schema is not a representable object.
 */
export function toolInputSchema(schema: z.ZodType): StandardSchemaWithJSON {
  const json = z.toJSONSchema(schema, { io: "input" });

  if (json.type !== "object") {
    throw new TypeError("Tool input must advertise an object schema.");
  }

  return {
    "~standard": {
      version: 1,
      vendor: "iracing-data-mcp",
      validate: (value) => ({ value }),
      jsonSchema: { input: () => json, output: () => json },
    },
  };
}
