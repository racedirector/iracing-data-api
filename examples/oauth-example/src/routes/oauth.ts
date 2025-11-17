import client from "@/oauth-client";
import { createEndpoint } from "better-call";
import { z } from "zod";

// TODO: Add routes for session management

export const oauthSignIn = createEndpoint(
  "/login",
  {
    method: "GET",
  },
  async (context) => {
    const { url } = await client.authorize();
    return context.redirect(url.toString());
  }
);

export const oauthCallback = createEndpoint(
  "/oauth/iracing/callback",
  {
    method: "GET",
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
  },
  async (context) => {
    const token = await client.callback(new URLSearchParams(context.query));

    /**
     * TODO: Write some sort of handler at the top-level that consumers can provide to process the token
     * before redirecting.
     */
    context.setCookie("iracing-token", token.access_token, {
      httpOnly: true,
      path: "/",
      maxAge: token.expires_in,
    });

    context.setHeader("X-IRACING-ACCESS-TOKEN", token.access_token);
    context.setHeader(
      "X-IRACING-ACCESS-TOKEN-EXPIRES-IN",
      token.expires_in.toString()
    );

    if (token.scope) {
      context.setHeader("X-IRACING-SCOPE", token.scope);
    }

    if (token.refresh_token) {
      context.setHeader("X-IRACING-REFRESH-TOKEN", token.refresh_token);
    }

    if (token.refresh_token_expires_in) {
      context.setHeader(
        "X-IRACING-REFRESH-TOKEN-EXPIRES-IN",
        token.refresh_token_expires_in.toString()
      );
    }

    return context.redirect("/");
  }
);

export const oauthSignOut = createEndpoint(
  "/logout",
  {
    method: "GET",
  },
  async (context) => {
    context.setCookie("iracing-token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return context.redirect("/");
  }
);
