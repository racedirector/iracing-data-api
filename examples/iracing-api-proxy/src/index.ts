import { IRacingAPISessionClient } from "@iracing-data/api";
import express from "express";
import type { Request, Response } from "express";
import { AddressInfo } from "node:net";

const PORT = process.env.PORT || "3000";
const IRACING_USERNAME = process.env.IRACING_USERNAME;

async function main() {
  if (!IRACING_USERNAME) {
    throw new Error("Missing iRacing username.");
  }

  const iracing = new IRacingAPISessionClient();
  await iracing.authenticate({
    username: IRACING_USERNAME,
    // If you provide a password via env, it will be hashed under-the-hood
    password: process.env.IRACING_PASSWORD,
    // ...Otherwise, provide a pre-hashed password.
    hashedPassword: process.env.IRACING_HASHED_PASSWORD,
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

  const server = app.listen(PORT, () => {
    console.info(
      "Example app listening on",
      (server.address() as AddressInfo).port
    );
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
