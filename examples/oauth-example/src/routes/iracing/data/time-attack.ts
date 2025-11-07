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
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.api.data.timeAttack.memberSeasonResults(query);
    return response.data;
  }
);
