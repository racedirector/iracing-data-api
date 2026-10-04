import { DriverStatsByCategoryPathSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const category = createEndpoint(
  "/data/driver_stats_by_category/:category",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing }, params: queryParams }) => {
    return await iracing.driverStats.getDriverStatsByCategory(
      await DriverStatsByCategoryPathSchema.parseAsync(queryParams),
    );
  },
);
