import { createNodeHandler } from "@iracing-data/api-router";
import express from "express";
import cookieParser from "cookie-parser";
import { page } from "./page";
import { PORT } from "./config";

const iracingRouter = createNodeHandler({
  basePath: "/iracing",
  openapi: {
    path: "/reference",
  },
  onRequest: (request) => {
    console.debug("Making request:", request);
  },
  onResponse: (response) => {
    console.debug("Response", response);
  },
  onError: (error) => {
    console.debug("Error!", error);
  },
});

const app = express();

app.use(express.urlencoded({ extended: true }), cookieParser());

app.get("/", (req, res) => {
  const hasToken = req.cookies?.["iracing-token"];

  res
    .type("html")
    .send(
      page(
        hasToken
          ? `<h1>Authenticated with iRacing</h1><a href="/logout">Sign out</a>`
          : `<h1>Login</h1><a href="/oauth/iracing/login">Login with iRacing</a>`
      )
    );
});

app.use("/iracing", iracingRouter);

app.listen(PORT, () => {
  console.info(`Example app listening on port ${PORT}`);
});
