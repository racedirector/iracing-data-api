import { toNodeHandler } from "better-call/node";
import cookieParser from "cookie-parser";
import express from "express";
import { PORT } from "./config";
import { page } from "./page";
import router from "./router";

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
          : `<h1>Login</h1><a href="/login">Login with iRacing</a>`,
      ),
    );
});

app.use(toNodeHandler(router.handler));

app.listen(PORT, () => {
  console.info(`Example app listening on port ${PORT}`);
});
