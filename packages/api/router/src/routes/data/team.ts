import { IRacingTeamGetParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const getTeam = createEndpoint(
  "/data/team/get",
  {
    method: "GET",
    query: IRacingTeamGetParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.team.getTeam(query);
  },
);

export const membership = createEndpoint(
  "/data/team/membership",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.team.getTeamMembership();
  },
);
