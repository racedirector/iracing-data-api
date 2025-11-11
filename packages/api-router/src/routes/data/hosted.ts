import { createEndpoint } from "../utils";
import { z } from "zod";

export const combinedSessions = createEndpoint(
  "/data/hosted/combined_sessions",
  {
    method: "GET",
    requireHeaders: true,
    query: z.object({
      packageId: z.number().optional(),
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
    const response = await iracing.api.data.hosted.combinedSessions(query);
    return response.data;
  }
);

export const sessions = createEndpoint(
  "/data/hosted/sessions",
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
    const response = await iracing.api.data.hosted.sessions();
    return response.data;
  }
);
