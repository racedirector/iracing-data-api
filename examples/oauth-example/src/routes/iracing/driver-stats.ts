import { assertCategory } from "@iracing-data/api";
import { createEndpoint } from "./utils";
import { z } from "zod";

export const category = createEndpoint(
  "/data/driver_stats_by_category/:category",
  {
    method: "GET",
    query: z.object({
      category: z.union([z.literal("ass"), z.literal("foo")]),
    }),
  },
  async ({ context: { iracing }, params: { category } }) => {
    assertCategory(category);

    return iracing.api.data.driverStats.category({
      category,
    });
  }
);
