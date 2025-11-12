import { IRacingTeamGetParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const getTeam = createEndpoint(
  "/data/team/get",
  {
    method: "GET",
    query: IRacingTeamGetParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.team.getTeam(query);
    return response.data;
  }
);

export const membership = createEndpoint(
  "/data/team/membership",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.team.getTeamMembership();
    return response.data;
  }
);
