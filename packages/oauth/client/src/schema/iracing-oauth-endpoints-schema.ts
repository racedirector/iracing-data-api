import { z } from "zod/v4";

export const IRacingOAuthEndpointsSchema = z.object({
  authorization: z.url(),
  token: z.url(),
});

export type IRacingOAuthEndpoints = z.infer<typeof IRacingOAuthEndpointsSchema>;
