import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import {
  createRouter as createIRacingRouter,
  IracingAPIResponse,
} from "@iracing-data/api-router";
import { createRouter as createOAuthRouter } from "@iracing-data/oauth-router";
import { PORT } from "./config";
import { page } from "./page";
import {
  getIRacingSession,
  IRacingSessionRequest,
  setIRacingSessionHeader,
} from "./middleware";
import { toNodeHandler } from "better-call/node";
import { toResponse } from "better-call";
import oauthClient from "./oauth-client";

/**
 * Create a router for handling iRacing API requests.
 */
const iracingRouter = createIRacingRouter({
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

/**
 * Create a router for handling iRacing OAuth requests.
 */
const oauthRouter = createOAuthRouter({
  oauthClient: oauthClient,
  callbackPath: "/oauth/iracing/callback",
  onCallback: (session, { request, setCookie, getHeader }) => {
    setCookie("iracing-session", JSON.stringify(session), {
      httpOnly: true,
    });

    const url = new URL(request.url);
    url.pathname = "/";
    url.search = "";

    return Response.redirect(url, 302);
  },
  onSignOut: (_, { setCookie }) => {
    setCookie("iracing-session", "");
  },
  onRequest: (request) => {
    console.debug("Received request:", request);
  },
  onResponse: (response) => {
    console.debug("Received response:", response);
  },
  onError: (error) => {
    console.debug("Received error:", error);
  },
  openapi: {
    disabled: true,
  },
});

const oauthNodeHandler = toNodeHandler(oauthRouter.handler);

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
          ? `<h1>Authenticated with iRacing</h1><a href="/signout">Sign out</a>${availablePathsList}`
          : `<h1>Login</h1><a href="/signin">Login with iRacing</a>`
      )
    );
});

app.use(
  "/iracing",
  setIRacingSessionHeader,
  toNodeHandler(iracingRouter.handler)
);

app.use(oauthNodeHandler);

app.listen(PORT, () => {
  console.info(`Example app listening on port ${PORT}`);
});
