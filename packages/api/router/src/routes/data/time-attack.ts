import { TimeAttackMemberSeasonResultsParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const memberSeasonResults = createEndpoint(
  "/data/time_attack/member_season_results",
  {
    method: "GET",
    query: TimeAttackMemberSeasonResultsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.timeAttack.getTimeAttackMemberSeasonResults(query);
  },
);
