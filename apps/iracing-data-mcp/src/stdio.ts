import { dirname, join } from "node:path";
import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createAssetCatalogs } from "./adapters/assets.js";
import { createReferenceCatalogs } from "./adapters/catalog.js";
import { createFetchQueries } from "./adapters/fetch.js";
import { createAssetMediaReader } from "./adapters/media.js";
import { registerAssetResources } from "./asset-resources.js";
import { composeMcpServices } from "./composition.js";
import { createCliAccessToken } from "./credentials.js";
import { registerReferenceResources } from "./resources.js";
import type { McpConfig } from "./config.js";

/**
 * Start local stdio with shared reference collection and entity resources.
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

  const resources = createReferenceCatalogs(
    join(dirname(config.credentialsFile), "reference"),
    accessToken,
  );

  const assets = createAssetCatalogs(
    join(dirname(config.credentialsFile), "reference"),
    accessToken,
  );

  return serveStdio(
    () => {
      const server = createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services,
      });

      registerReferenceResources(server, resources);
      registerAssetResources(server, assets, createAssetMediaReader());

      return server;
    },
    {
      onerror: () => {
        process.stderr.write("MCP transport error.\n");
      },
    },
  );
}
