import { Router } from "express";
import { AppContext } from "../../context";

export const createRouter = (_context: AppContext): Router => {
  const router = Router();

  router.get("/iracing/sim/connected", async (_req, res) => {
    res.send("TODO");
    res.end();
  });

  router.get("/iracing/telemetry/connected", async (_req, res) => {
    res.send("TODO");
    res.end();
  });

  /**
   * Get the latest telemetry state from the iRacing module.
   */
  router.get("/iracing/telemetry", (_req, res) => {
    res.send("TODO");
    res.end();
  });

  router.get("/iracing/session", (_req, res) => {
    res.send("TODO");
    res.end();
  });

  return router;
};
