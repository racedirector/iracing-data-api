import { createEndpoint } from "../utils";
import { z } from "zod";

export const category = createEndpoint(
  "/data/driver_stats_by_category/:category",
  {
    method: "GET",
    query: z.object({
      category: z.union([
        z.literal("oval"),
        z.literal("road"),
        z.literal("dirt_road"),
        z.literal("dirt_oval"),
        z.literal("sports_car"),
        z.literal("formula_car"),
      ]),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.driverStats.category(query);
    return response.data;
  }
);
