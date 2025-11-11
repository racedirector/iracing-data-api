import { createEndpoint } from "../utils";
import { z } from "zod";

export const getTeam = createEndpoint(
  "/data/team/get",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      teamId: z.number(),
      includeLicenses: z.boolean().optional(),
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
    const response = await iracing.api.data.team.get(query);
    return response.data;
  }
);

export const membership = createEndpoint(
  "/data/team/membership",
  {
    method: "GET",
    requireHeaders: true,
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
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.team.membership();
    return response.data;
  }
);
