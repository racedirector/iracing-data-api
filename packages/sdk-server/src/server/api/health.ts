import { Router } from "express";
import { AppContext } from "../../context";

export const createRouter = (_context: AppContext): Router => {
  const router = Router();

  router.get("/", (_req, res) => {
    res.type("text/plain").send("iRacing SDK Server");
  });

  router.get("/status", (_req, res) => {
    res.send("OK");
  });

  return router;
};
