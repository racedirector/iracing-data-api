import { OAuthClient, BASE_URL } from "@iracing-data/oauth-client";
import express from "express";
import { page } from "./page";
import { InMemoryStore } from "./storage/memory";

const client = new OAuthClient({
  clientMetadata: {
    clientId: process.env.IRACING_CLIENT_ID!,
    redirectUri: "http://127.0.0.1:3001/oauth/iracing/callback",
    scopes: "iracing.profile iracing.auth",
  },
  stateStore: new InMemoryStore(),
});

const PORT = process.env.PORT || "3000";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const hasToken = Boolean(req.headers.cookie?.includes("iracing_token="));
  res
    .type("html")
    .send(
      page(
        hasToken
          ? `<h1>Authenticated with iRacing</h1><a href="/logout">Sign out</a>`
          : `<h1>Login</h1><a href="/login">Login with iRacing</a>`
      )
    );
});

app.get("/login", async (req, res, next) => {
  try {
    // Revoke any pending authentication requests if the connection is closed (optional)
    const ac = new AbortController();
    req.on("close", () => ac.abort());

    const { url } = await client.authorize({
      signal: ac.signal,
    });

    ac.signal.throwIfAborted();

    res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
});

app.get("/logout", (req, res) => {
  res.setHeader("Set-Cookie", "iracing_token=; HttpOnly; Path=/; Max-Age=0");
  res.redirect("/");
});

app.get("/oauth/iracing/callback", async (req, res, next) => {
  try {
    const params = new URLSearchParams(req.url.split("?")[1]);

    const { access_token } = await client.callback(params);

    /**
     * In a standard application, we'd store the token result in some sort of
     * session store/cookie so the user can make subsequent calls, however,
     * iRacing does not support more than identity verification at this time.
     *
     * In their own guide, they suggest using the access token to request `/iracing/profile`,
     * and then discarding the access token.
     *
     * See: https://oauth.iracing.com/oauth2/book/identity_verification_workflow.html#steps
     */

    const response = await fetch(`${BASE_URL}/iracing/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.info("User identified as:", response);
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => {
  console.info(`Example app listening on port ${PORT}`);
});
