import client from "@/oauth-client";
import { createEndpoint } from "better-call";
import { z } from "zod";

const OAuthCallbackQuerySchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const oAuthCallback = createEndpoint(
  "/oauth/iracing/callback",
  {
    method: "GET",
    query: OAuthCallbackQuerySchema,
  },
  async (context) => {
    const params = new URLSearchParams(context.query);
    const token = await client.callback(params);

    context.setCookie("iracing-token", token.access_token, {
      httpOnly: true,
      path: "/",
      maxAge: token.expires_in,
    });

    return context.redirect("/");
  }
);
