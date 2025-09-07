import { IRacingAPISessionClient, hashPassword } from "@iracing-data/api";
import express from "express";
import type { Request, Response } from "express";

const PORT = process.env.PORT || "3000";
const IRACING_USERNAME = process.env.IRACING_USERNAME;
const IRACING_PASSWORD = process.env.IRACING_PASSWORD;

async function main() {
  if (!IRACING_USERNAME || !IRACING_PASSWORD) {
    throw new Error("Missing iRacing credentials.");
  }

  const iracing = new IRacingAPISessionClient();
  await iracing.authenticate({
    username: IRACING_USERNAME,
    password: await hashPassword(IRACING_USERNAME, IRACING_PASSWORD),
  });

  const app = express();

  app.get(
    "/driver",
    async (req: Request<{}, {}, {}, { iracingId?: string }>, res) => {
      const iracingId = req.query.iracingId;
      if (!iracingId) {
        return res
          .status(400)
          .send({ message: "Missing `iracingId` parameter." });
      }

      const normalizedId = parseInt(iracingId);

      const response = await iracing.memberProfile({
        customerId: normalizedId,
      });

      res.send(response);
    }
  );

  app.get(
    "/team",
    async (req: Request<{}, {}, {}, { iracingId?: string }>, res) => {
      const iracingId = req.query.iracingId;
      if (!iracingId) {
        return res
          .status(400)
          .send({ message: "Missing `iracingId` parameter." });
      }

      const normalizedId = parseInt(iracingId);

      const response = await iracing.teamGet({
        teamId: normalizedId,
      });

      res.send(response);
    }
  );

  app.get(
    "/league-membership",
    async (req: Request<{}, {}, {}, { iracingId?: string }>, res) => {
      const iracingId = req.query.iracingId;
      if (!iracingId) {
        return res
          .status(400)
          .send({ message: "Missing `iracingId` parameter." });
      }

      const normalizedId = parseInt(iracingId);

      const response = await iracing.leagueMembership({
        customerId: normalizedId,
      });

      res.send(response);
    }
  );

  app.get(
    "/league",
    async (req: Request<{}, {}, {}, { iracingId?: string }>, res) => {
      const iracingId = req.query.iracingId;
      if (!iracingId) {
        return res
          .status(400)
          .send({ message: "Missing `iracingId` parameter." });
      }

      const normalizedId = parseInt(iracingId);

      const response = await iracing.leagueGet({
        leagueId: normalizedId,
      });

      res.send(response);
    }
  );

  app.listen(PORT, () => {
    console.info(`Example app listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
