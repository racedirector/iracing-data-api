import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

const DatasetSchema = z.enum([
  "cars",
  "car-assets",
  "track-assets",
  "series-assets",
]);

export type StaticDataset = z.output<typeof DatasetSchema>;

/** A deliberately bounded map: no dynamic results, arbitrary URLs, or bulk refresh. */
export type StaticCacheRefreshers = Readonly<
  Record<StaticDataset, () => Promise<unknown>>
>;

const resourceUris: Readonly<Record<StaticDataset, string>> = {
  cars: "iracing://cars",
  "car-assets": "iracing://assets/cars",
  "track-assets": "iracing://assets/tracks",
  "series-assets": "iracing://assets/series",
};

const OutputSchema = z.object({
  dataset: DatasetSchema,
  status: z.literal("refreshed"),
  resourceUri: z.string(),
  records: z.number().int().nonnegative(),
});

/** Register a user/agent-invoked refresh with explicit dataset selection. */
export function registerRefreshStaticCacheTool(
  server: Pick<McpServer, "registerTool">,
  refreshers: StaticCacheRefreshers,
): void {
  server.registerTool(
    "refresh_static_cache",
    {
      title: "Refresh a static iRacing cache",
      description:
        "Force one fresh iRacing request and replace the selected local static " +
        "JSON snapshot. Choose the smallest relevant dataset: cars, car-assets, " +
        "track-assets, or series-assets. Each request fetches a COMPLETE dataset; " +
        "asset catalogs may be large. Do not refresh unrelated datasets. " +
        "Race results and other costly/dynamic queries are NOT supported. " +
        "Returns a summary, not the dataset contents.",
      inputSchema: z.strictObject({
        dataset: DatasetSchema.describe("Which single static cache to refresh"),
      }),
      outputSchema: OutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ dataset }) => {
      try {
        const data = await refreshers[dataset]();
        const records = data !== null && typeof data === "object"
          ? Object.keys(data).length
          : 0;
        const summary = {
          dataset,
          status: "refreshed" as const,
          resourceUri: resourceUris[dataset],
          records,
        };

        return {
          structuredContent: summary,
          content: [{ type: "text" as const, text: JSON.stringify(summary) }],
        };
      } catch {
        return {
          isError: true,
          content: [{
            type: "text" as const,
            text: "Static cache refresh failed. The last valid snapshot remains available.",
          }],
        };
      }
    },
  );
}
