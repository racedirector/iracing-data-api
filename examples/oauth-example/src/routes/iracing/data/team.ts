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
    return iracing.api.data.team.get(query);
  }
);

export const membership = createEndpoint(
  "/data/team/membership",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.team.membership();
  }
);
