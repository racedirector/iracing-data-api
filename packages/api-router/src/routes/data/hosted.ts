import { createEndpoint } from "../utils";
import { z } from "zod";

export const combinedSessions = createEndpoint(
  "/data/hosted/combined_sessions",
  {
    method: "GET",
    query: z.object({
      packageId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.hosted.combinedSessions(query);
    return response.data;
  }
);

export const sessions = createEndpoint(
  "/data/hosted/sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.hosted.sessions();
    return response.data;
  }
);
