import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { dirname, join } from "node:path";
import { createCarCatalogLoader } from "./adapters/catalog.js";
import { CarCatalogSchema, createCarCatalogResolver } from "./catalog.js";
import { createFetchQueries } from "./adapters/fetch.js";
import { composeMcpServices } from "./composition.js";
import { createCliAccessToken } from "./credentials.js";
import { createFileBackedResolver, registerReferenceResources } from "./resources.js";
import type { McpConfig } from "./config.js";

/**
 * Start local stdio with file-backed car collection and entity resources.
 * @param {Pick<McpConfig, "credentialsFile">} config - Local credential document selection.
 * @returns {ReturnType<typeof serveStdio>} Handle for closing the connection.
 */
export function startMcpStdio(
  config: Pick<McpConfig, "credentialsFile">,
): ReturnType<typeof serveStdio> {
  const accessToken = createCliAccessToken(config.credentialsFile);
  const capabilities = createFetchQueries(accessToken);
  const services = composeMcpServices(
    { id: "local", provider: "cli" },
    () => capabilities,
  );
  const cars = createCarCatalogResolver(
    createFileBackedResolver(
      join(dirname(config.credentialsFile), "reference", "cars.json"),
      createCarCatalogLoader(accessToken),
      (document) => CarCatalogSchema.parse(document),
    ),
  );
  const resources = { cars };

  // Hydrate the one shared catalog asynchronously, without blocking registration.
  void cars.all().catch(() => {
    process.stderr.write("Car catalog warmup failed; a read can retry.\n");
  });

  return serveStdio(
    () => {
      const server = createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services,
      });

      registerReferenceResources(server, resources);
      return server;
    },
    {
      onerror: () => {
        process.stderr.write("MCP transport error.\n");
      },
    },
  );
}
