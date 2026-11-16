import { ResourceTemplate } from "@modelcontextprotocol/server";
import type { ReferenceCatalog } from "./catalog.js";
import type { McpServer } from "@modelcontextprotocol/server";

/**
 * Advertise collections and entity templates without loading their datasets.
 * @param {Pick<McpServer, "registerResource">} server - Caller-owned resource registration surface.
 * @param {readonly ReferenceCatalog[]} catalogs - Reference datasets sharing collection/entity handlers.
 */
export function registerReferenceResources(
  server: Pick<McpServer, "registerResource">,
  catalogs: readonly ReferenceCatalog[],
): void {
  for (const catalog of catalogs) {
    const uri = `iracing://${catalog.name}`;

    const metadata = {
      title: catalog.title,
      description: `${catalog.description} Entity key: ${catalog.idField}. Reads return JSON { schema, data }; schema describes data, including modeled fields and additional-property policy. Persisted snapshot; no automatic refresh.`,
      mimeType: "application/json",
    };

    server.registerResource(catalog.name, uri, metadata, async (target) => ({
      contents: [
        {
          uri: target.href,
          mimeType: "application/json",
          text: JSON.stringify({
            schema: catalog.collectionJsonSchema,
            data: await catalog.resolver.all(),
          }),
        },
      ],
    }));
    server.registerResource(
      `${catalog.name}-entity`,
      new ResourceTemplate(`${uri}/{${catalog.idField}}`, { list: undefined }),
      metadata,
      async (target, variables) => {
        const raw = variables[catalog.idField];

        if (
          typeof raw !== "string" ||
          !/^(?:0|[1-9]\d*)$/.test(raw) ||
          !Number.isSafeInteger(Number(raw))
        ) {
          throw new Error(
            `Invalid ${catalog.idField}: expected a nonnegative safe integer.`,
          );
        }

        const entry = await catalog.resolver.get(Number(raw));

        if (!entry) {
          throw new Error(
            `${catalog.title}: ${catalog.idField}=${raw} not found.`,
          );
        }

        return {
          contents: [
            {
              uri: target.href,
              mimeType: "application/json",
              text: JSON.stringify({
                schema: catalog.entityJsonSchema,
                data: entry,
              }),
            },
          ],
        };
      },
    );
  }
}
