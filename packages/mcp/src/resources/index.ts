import {
  INTERNAL_ERROR,
  INVALID_PARAMS,
  ProtocolError,
  ResourceNotFoundError,
  ResourceTemplate,
} from "@modelcontextprotocol/server";
import type { ReferenceCatalog } from "./service.js";
import type {
  McpServer,
  ReadResourceResult,
  ResourceMetadata,
  Variables,
} from "@modelcontextprotocol/server";

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

    const metadata: ResourceMetadata = {
      title: catalog.title,
      mimeType: "application/json",
      annotations: { audience: ["user", "assistant"] },
    };

    const description = `${catalog.description} Data loading and refresh policy are managed by the host.`;

    server.registerResource(
      catalog.name,
      uri,
      {
        ...metadata,
        description: `Complete reference collection returned as a JSON array. ${description} Prefer ${uri}/{${catalog.idField}} when resolving a known ID to avoid loading the entire collection into context.`,
      },
      async (target) => ({
        contents: [
          {
            uri: target.href,
            mimeType: "application/json",
            text: JSON.stringify(
              await readCatalog(() => catalog.resolver.all()),
            ),
          },
        ],
      }),
    );
    server.registerResource(
      `${catalog.name}-entity`,
      new ResourceTemplate(`${uri}/{${catalog.idField}}`, {
        list: undefined,
        complete: {
          [catalog.idField]: (value) => completeIds(catalog, value),
        },
      }),
      {
        ...metadata,
        title: `${catalog.title} — single entity`,
        description: `One reference entity returned as a JSON object, selected by ${catalog.idField} (nonnegative safe integer). ${description} Use completion to discover matching IDs.`,
      },
      (target, variables) => readEntity(catalog, target, variables),
    );
  }
}

async function completeIds(
  catalog: ReferenceCatalog,
  value: string,
): Promise<string[]> {
  if (!/^\d*$/.test(value)) {
    return [];
  }

  const entries = await readCatalog(() => catalog.resolver.all());

  return entries
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) {
        return null;
      }

      const id = (entry as Record<string, unknown>)[catalog.idField];

      return typeof id === "number" && Number.isSafeInteger(id) && id >= 0
        ? String(id)
        : null;
    })
    .filter((id): id is string => id?.startsWith(value) === true)
    .sort((left, right) => Number(left) - Number(right));
}

async function readEntity(
  catalog: ReferenceCatalog,
  target: URL,
  variables: Variables,
): Promise<ReadResourceResult> {
  const raw = variables[catalog.idField];

  if (
    typeof raw !== "string" ||
    !/^(?:0|[1-9]\d*)$/.test(raw) ||
    !Number.isSafeInteger(Number(raw))
  ) {
    throw new ProtocolError(
      INVALID_PARAMS,
      `Invalid ${catalog.idField}: expected a nonnegative safe integer.`,
    );
  }

  const entry = await readCatalog(() => catalog.resolver.get(Number(raw)));

  if (!entry) {
    throw new ResourceNotFoundError(target.href);
  }

  return {
    contents: [
      {
        uri: target.href,
        mimeType: "application/json",
        text: JSON.stringify(entry),
      },
    ],
  };
}

async function readCatalog<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch {
    throw new ProtocolError(
      INTERNAL_ERROR,
      "Unable to load reference catalog.",
    );
  }
}
