import client from "@/oauth-client";
import { createEndpoint } from "better-call";

export const login = createEndpoint(
  "/login",
  {
    method: "GET",
  },
  async (context) => {
    const { url } = await client.authorize();
    return context.redirect(url.toString());
  }
);

export const logout = createEndpoint(
  "/logout",
  {
    method: "GET",
  },
  async (context) => {
    context.setHeader(
      "Set-Cookie",
      "iracing_token=; HttpOnly; Path=/; Max-Age=0"
    );

    return context.redirect("/");
  }
);
