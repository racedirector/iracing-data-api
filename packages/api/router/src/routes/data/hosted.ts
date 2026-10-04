import { HostedCombinedSessionsParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const combinedSessions = createEndpoint(
  "/data/hosted/combined_sessions",
  {
    method: "GET",
    query: HostedCombinedSessionsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.hosted.getHostedCombinedSessions(query);
  },
);

export const sessions = createEndpoint(
  "/data/hosted/sessions",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.hosted.getHostedSessions();
  },
);
