import { OAuthClient } from "@iracing-data/oauth-client";
import express from "express";
import { page } from "./page";
import { InMemoryStore } from "./storage/memory";

const client = await OAuthClient.create({
  clientMetadata: {
    clientId: process.env.IRACING_CLIENT_ID!,
    redirectUri: "http://127.0.0.1:3001/oauth/iracing/callback",
    scopes: "iracing.profile iracing.auth",
  },
  stateStore: new InMemoryStore(),
});

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

    await client.callback(params);

    // console.info("authorize() was called with state:", state);
    // console.info("User authenticated as:");
  } catch (error) {
    next(error);
  }
});
