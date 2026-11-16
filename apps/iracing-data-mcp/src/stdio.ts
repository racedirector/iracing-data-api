import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { dirname, join } from "node:path";
import { createAssetCatalogLoader } from "./adapters/assets.js";
import { createCarCatalogLoader } from "./adapters/catalog.js";
import { AssetCatalogSchema, createAssetCatalogResolver } from "./assets.js";
import { CarCatalogSchema, createCarCatalogResolver } from "./catalog.js";
import { createFetchQueries } from "./adapters/fetch.js";
import { composeMcpServices } from "./composition.js";
import { createCliAccessToken } from "./credentials.js";
import { registerRefreshStaticCacheTool } from "./refresh.js";
import { createFileBackedResolver, registerReferenceResources } from "./resources.js";
import type { AssetKind } from "./adapters/assets.js";
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
  const directory = join(dirname(config.credentialsFile), "reference");
  const asset = (kind: AssetKind) =>
    createAssetCatalogResolver(
      createFileBackedResolver(
        join(directory, `${kind}-assets.json`),
        createAssetCatalogLoader(kind, accessToken),
        (document) => AssetCatalogSchema.parse(document),
      ),
    );
  const assets = {
    car: asset("car"),
    track: asset("track"),
    series: asset("series"),
  };
  const resources = { cars, assets };
  const refreshers = {
    cars: () => cars.refresh(),
    "car-assets": () => assets.car.refresh(),
    "track-assets": () => assets.track.refresh(),
    "series-assets": () => assets.series.refresh(),
  };

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
      registerRefreshStaticCacheTool(server, refreshers);
      return server;
    },
    {
      onerror: () => {
        process.stderr.write("MCP transport error.\n");
      },
    },
  );
}
