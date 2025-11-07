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
    // metadata: {
    // openapi: {
    // requestBody: {
    //   content: {
    //     "application/json": {
    //       schema: {
    //         type: "object",
    //         properties: {
    //           category: {
    //             type: "string",
    //             description:
    //               "The category to look up for the current driver.",
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
    // },
    // },
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.driverStats.category(query);
  }
);
