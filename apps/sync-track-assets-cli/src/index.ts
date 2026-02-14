#!/usr/bin/env node

import crypto from "node:crypto";
import { Command } from "@commander-js/extra-typings";
import { Configuration, TrackApi } from "@iracing-data/api-client-fetch";
import { syncTrackAssets } from "@iracing-data/sync-track-assets";
import * as dotenv from "dotenv";
import createClient from "openapi-fetch";
import type { paths } from "./generated/openapi";

dotenv.config();

/**
 * Compute the Base64‑encoded SHA‑256 hash of (password + email.toLowerCase()).
 */
export async function hashPassword(email: string, password: string) {
  return crypto
    .createHash("sha256")
    .update(password + email.toLowerCase())
    .digest("base64");
}

const program = new Command("sync-iracing-track-assets")
  .description("Downloads the latest track SVGs.")
  .requiredOption("-o, --out-dir <path>", "Output directory")
  .option("-f, --force", "Force download of existing SVG layers", false)
  .option("-i, --write-full-info", "Write full track info", false)
  .option("--skip-info", "Skip writing track info", false)
  .option("-a, --write-full-assets", "Write full track assets", false)
  .option("--skip-assets", "Skip writing track asset", false)
  .option("--include-svgs", "Include SVGs", false)
  .action(async (_, command) => {
    console.log("Downloading track assets...");

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
      skipAssets: skipTrackAssets,
      skipInfo: skipTrackInfo,
      includeSvgs,
      force,
    } = command.optsWithGlobals();

    await syncTrackAssets(
      {
        outputDir: outDir,
        writeFullAssets,
        writeFullInfo,
        skipTrackAssets,
        skipTrackInfo,
        force,
        includeSVGs: includeSvgs,
      },
      new TrackApi(
        new Configuration({
          accessToken: session.data?.access_token,
        }),
      ),
    );

    console.log("Done!");
  });

program.parse();
