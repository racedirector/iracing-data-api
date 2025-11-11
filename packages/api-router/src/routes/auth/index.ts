import { createEndpoint } from "../utils";
import { z } from "zod";

const AuthInputSchema = z.object({
  username: z.string(),
  hashedPassword: z.string(),
});

export const auth = createEndpoint(
  "/auth",
  {
    method: "POST",
    body: AuthInputSchema,
    metadata: {
      $Infer: {
        body: {} as z.infer<typeof AuthInputSchema>,
      },
    },
  },
  async ({ context: { iracing }, body }) => {
    return iracing.api.auth.auth(body);
  }
);
