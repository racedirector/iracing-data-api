import { createEndpoint } from "../utils";
import { z } from "zod";

export const getTeam = createEndpoint(
  "/data/team/get",
  {
    method: "GET",
    query: z.object({
      teamId: z.number(),
      includeLicenses: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.team.get(query);
    return response.data;
  }
);

export const membership = createEndpoint(
  "/data/team/membership",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.team.membership();
    return response.data;
  }
);
