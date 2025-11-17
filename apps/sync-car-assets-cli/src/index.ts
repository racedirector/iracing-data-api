#!/usr/bin/env node

import crypto from "node:crypto";
import { Command } from "@commander-js/extra-typings";
import { CarApi, Configuration } from "@iracing-data/api-client-fetch";
import { syncCarAssets } from "@iracing-data/sync-car-assets";
import * as dotenv from "dotenv";
import createClient from "openapi-fetch";
import type { paths } from "./generated/openapi";

dotenv.config();

async function hashPassword(email: string, password: string) {
  return crypto
    .createHash("sha256")
    .update(password + email.toLowerCase())
    .digest("base64");
}

const program = new Command("sync-iracing-car-assets")
  .description("Downloads the latest car assets.")
  .requiredOption("-o, --out-dir <path>", "Output directory")
  .option("-i, --write-full-info", "Write full car info", false)
  .option("--skip-info", "Skip writing car info", false)
  .option("-a, --write-full-assets", "Write full car assets", false)
  .option("--skip-assets", "Skip writing car asset", false)
  .action(async (_, command) => {
    console.log("Downloading car assets...");

    const username = process.env.IRACING_AUTH_USERNAME!;
    const password = process.env.IRACING_AUTH_PASSWORD!;

    /**
     * Authorize the consumer with a password limited grant from iRacing OAuth services
     */
    const client = createClient<paths>({
      baseUrl: "https://oauth.iracing.com/oauth2",
    });

    const session = await client.POST("/token", {
      body: {
        grant_type: "password_limited",
        client_id: process.env.IRACING_AUTH_CLIENT!,
        client_secret: process.env.IRACING_AUTH_SECRET!,
        username: username,
        password: await hashPassword(username, password),
        scope: process.env.IRACING_AUTH_SCOPE!,
      },
    });

    // TODO: Store the session somewhere?

    const {
      outDir,
      writeFullAssets,
      writeFullInfo,
      skipInfo: skipCarInfo,
      skipAssets: skipCarAssets,
    } = command.optsWithGlobals();

    await syncCarAssets(
      {
        outputDir: outDir,
        writeFullAssets,
        writeFullInfo,
        skipCarAssets,
        skipCarInfo,
      },
      new CarApi(
        new Configuration({
          accessToken: session.data?.access_token,
        })
      )
    );

    console.log("Done!");
  });

program.parse();
