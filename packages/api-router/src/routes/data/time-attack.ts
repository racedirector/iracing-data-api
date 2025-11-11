import { createEndpoint } from "../utils";
import { z } from "zod";

export const memberSeasonResults = createEndpoint(
  "/data/time_attack/member_season_results",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      seasonId: z.number(),
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
    const response =
      await iracing.api.data.timeAttack.memberSeasonResults(query);
    return response.data;
  }
);
