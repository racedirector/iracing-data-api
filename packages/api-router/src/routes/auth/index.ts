import { createEndpoint } from "../utils";
import { z } from "zod";

export const auth = createEndpoint(
  "/auth",
  {
    method: "POST",
    body: z.object({
      username: z.string(),
      hashedPassword: z.string(),
    }),
  },
  async ({ context: { iracing }, body }) => {
    return iracing.api.auth.auth(body);
  }
);
