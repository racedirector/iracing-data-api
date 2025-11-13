#!/usr/bin/env node

import crypto from "node:crypto";
import { Command } from "@commander-js/extra-typings";
import { TrackApi, AuthApi } from "@iracing-data/api-client";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as dotenv from "dotenv";
import { getIRacingCredentials } from "./util.js";
import { syncTrackAssets } from "./";

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

    // Create an axios instance capable of handling cookies.
    const client = wrapper(
      axios.create({
        baseURL: "https://members-ng.iracing.com/",
        withCredentials: true,
        jar: new CookieJar(),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    // Use the axios instance to authenticate
    const auth = new AuthApi(undefined, undefined, client);
    const { username, password } = await getIRacingCredentials();
    const hashedPassword = await hashPassword(username, password);
    await auth.postAuth({
      post_auth_request: {
        email: username,
        password: hashedPassword,
      },
    });

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
      new TrackApi(undefined, undefined, client)
    );

    console.log("Done!");
  });

program.parse();
