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
    return iracing.api.data.hosted.combinedSessions(query);
  }
);

export const sessions = createEndpoint(
  "/data/hosted/sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.hosted.sessions();
  }
);
