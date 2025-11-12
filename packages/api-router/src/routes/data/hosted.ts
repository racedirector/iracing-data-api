import { IRacingHostedCombinedSessionsParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const combinedSessions = createEndpoint(
  "/data/hosted/combined_sessions",
  {
    method: "GET",
    query: IRacingHostedCombinedSessionsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.hosted.getHostedCombinedSessions(query);
    return response.data;
  }
);

export const sessions = createEndpoint(
  "/data/hosted/sessions",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.hosted.getHostedSessions();
    return response.data;
  }
);
