import { createEndpoint } from "../utils";
import { z } from "zod";

export const category = createEndpoint(
  "/data/driver_stats_by_category/:category",
  {
    method: "GET",
    requireHeaders: true,
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
    metadata: {
      openapi: {
        parameters: [
          {
            in: "header",
            name: "X-IRACING-ACCESS-TOKEN",
            schema: {
              type: "string",
            },
            required: true,
            description: "The JWT token to sign the request with.",
          },
        ],
      },
    },
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.driverStats.category(query);
    return response.data;
  }
);
