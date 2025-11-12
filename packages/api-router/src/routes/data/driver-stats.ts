import { IRacingDriverStatsByCategoryPathSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const category = createEndpoint(
  "/data/driver_stats_by_category/:category",
  {
    method: "GET",
    requireHeaders: true,
    query: IRacingDriverStatsByCategoryPathSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.driverStats.getDriverStatsByCategory(query);
    return response.data;
  }
);
