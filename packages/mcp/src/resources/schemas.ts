import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

/** Standalone schema documentation, separate from resource data. */
export interface ResourceSchema {
  /** URI suffix under iracing://schemas/. */
  readonly name: string;

  /** Human-readable schema title. */
  readonly title: string;

  /** JSON Schema document for the resource's JSON text content. */
  readonly document: Readonly<Record<string, unknown>>;
}

/**
 * Convert an authored acceptance schema into standalone resource documentation.
 * @param {string} name - Schema URI suffix.
 * @param {string} title - Human-readable title.
 * @param {z.ZodType} schema - Authored JSON-compatible acceptance schema.
 * @returns {ResourceSchema} Schema documentation without loading any data.
 */
export function createResourceSchema(
  name: string,
  title: string,
  schema: z.ZodType,
): ResourceSchema {
  return { name, title, document: z.toJSONSchema(schema) };
}

/**
 * Advertise schemas only for resources selected by the host.
 * @param {Pick<McpServer, "registerResource">} server - Caller-owned registration surface.
 * @param {readonly ResourceSchema[]} schemas - Authored schema documents.
 */
export function registerResourceSchemas(
  server: Pick<McpServer, "registerResource">,
  schemas: readonly ResourceSchema[],
): void {
  for (const schema of schemas) {
    server.registerResource(
      `schema-${schema.name.replaceAll("/", "-")}`,
      `iracing://schemas/${schema.name}`,
      {
        title: schema.title,
        mimeType: "application/schema+json",
        annotations: { audience: ["user", "assistant"] },
        description:
          "Authored resource acceptance schema, not an exhaustive upstream contract. Unknown upstream fields may be retained without being modeled. Describes JSON resource content, not an API link envelope or the MCP contents wrapper.",
      },
      (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/schema+json",
            text: JSON.stringify(schema.document),
          },
        ],
      }),
    );
  }
}
