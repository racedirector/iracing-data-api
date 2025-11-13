import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import { createRouter } from "@iracing-data/api-router";
import { PORT } from "./config";
import oauthClient from "./oauth-client";
import { page } from "./page";
import {
  getIRacingSession,
  IRacingSessionRequest,
  setIRacingSessionHeader,
} from "./middleware";
import { toNodeHandler } from "better-call/node";
import { toResponse } from "better-call";
import { IracingAPIResponse } from "../../../packages/api-client/dist";

const iracingRouter = createRouter({
  basePath: "/iracing",
  openapi: {
    path: "/reference",
  },
  /**
   * By default, the iRacing API responds with links that
   * contain the data. Here, we parse the link, fetch the data,
   * and return it directly.
   */
  onResponse: async (response) => {
    // TODO: Cache the data until the expiration date.
    const json = await response.json();
    const { link, expires } = json as IracingAPIResponse;

    const expirationDate = new Date(expires);
    if (expirationDate.getTime() < Date.now()) {
      throw new Error("Data is expired!");
    }

    const data = await fetch(link);
    const result = await data.json();

    return toResponse(result);
  },
});

const availablePaths = Object.values(iracingRouter.endpoints).map(
  ({ path: endpointPath }) => path.join("/iracing", endpointPath)
);

const availablePathsList = `<ul>${availablePaths
  .map((p) => `<li><a href="${p}">${p}</a></li>`)
  .join("")}</ul>`;

const app = express();
app.use(express.json(), express.urlencoded({ extended: true }), cookieParser());

app.get("/", getIRacingSession, (req: IRacingSessionRequest, res) => {
  res
    .type("html")
    .send(
      page(
        req.accessToken
          ? `<h1>Authenticated with iRacing</h1><a href="/logout">Sign out</a>${availablePathsList}`
          : `<h1>Login</h1><a href="/iracing/login">Login with iRacing</a>`
      )
    );
});

/**
 * Kicks off the iRacing OAuth sign-in flow.
 */
app.get("/iracing/login", async (req, res) => {
  const { url } = await oauthClient.authorize();
  return res.redirect(url.toString());
});

/**
 * Callback for the iRacing OAuth sign-in flow.
 * The path this handler is registered to should match
 * the path provided to iRacing during client registration.
 */
app.get("/oauth/iracing/callback", async (req, res) => {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const session = await oauthClient.callback(params);

  res.cookie("iracing-session", JSON.stringify(session), {
    httpOnly: true,
  });

  return res.redirect("/");
});

app.use(
  "/iracing",
  setIRacingSessionHeader,
  toNodeHandler(iracingRouter.handler)
);

app.listen(PORT, () => {
  console.info(`Example app listening on port ${PORT}`);
});
