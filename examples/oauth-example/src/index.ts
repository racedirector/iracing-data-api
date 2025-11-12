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

const iracingRouter = createRouter({
  basePath: "/iracing",
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }), cookieParser());

app.get("/", getIRacingSession, (req: IRacingSessionRequest, res) => {
  res
    .type("html")
    .send(
      page(
        req.accessToken
          ? `<h1>Authenticated with iRacing</h1><a href="/logout">Sign out</a>`
          : `<h1>Login</h1><a href="/iracing/login">Login with iRacing</a>`
      )
    );
});

app.get("/iracing/login", async (req, res) => {
  const { url } = await oauthClient.authorize();
  return res.redirect(url.toString());
});

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
