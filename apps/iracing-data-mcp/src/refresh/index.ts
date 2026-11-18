import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "@iracing-data/mcp";
import { mapUpstreamFailure } from "../adapters/errors.js";
import { refreshStaticCache } from "./operation.js";
import { RefreshInput, RefreshOutput } from "./schema.js";
import type { RefreshableAssetCatalog, RefreshableCatalog } from "./service.js";
import type { McpServer } from "@modelcontextprotocol/server";

/**
 * Register local snapshot maintenance against the same resolvers used by reads.
 * This host-only tool is deliberately not registered in the MCP core.
 * @param {McpServer} server - Local stdio server only.
 * @param {readonly RefreshableCatalog[]} catalogs - Shared reference catalogs.
 * @param {readonly RefreshableAssetCatalog[]} assets - Shared asset metadata.
 */
export function registerStaticCacheRefresh(
  server: McpServer,
  catalogs: readonly RefreshableCatalog[],
  assets: readonly RefreshableAssetCatalog[],
): void {
  server.registerTool(
    "refresh_static_cache",
    {
      description:
        "Refetch one static dataset, validate and atomically persist it, then replace its live index. No bulk refresh or dynamic result caches. Failed refresh retains last-good data.",
      inputSchema: RefreshInput,
      outputSchema: RefreshOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (raw, request) => {
      const signal = request.mcpReq.signal;

      try {
        signal.throwIfAborted();
        const checked = RefreshInput.safeParse(raw);

        if (!checked.success) {
          throw new ApplicationFailure("INVALID_INPUT");
        }

        // Shared refresh/persistence must finish even if one caller cancels.
        const summary = await refreshStaticCache(
          checked.data,
          catalogs,
          assets,
        );

        signal.throwIfAborted();
        const result = RefreshOutput.parse(summary);

        return {
          structuredContent: result,
          content: [{ type: "text" as const, text: JSON.stringify(result) }],
        };
      } catch (error) {
        signal.throwIfAborted();

        return toolError(mapUpstreamFailure(error), createRequestContext());
      }
    },
  );
}
