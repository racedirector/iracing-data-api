#!/usr/bin/env node
import crypto from "node:crypto";
import { Command } from "@commander-js/extra-typings";
import { CarApi, AuthApi } from "@iracing-data/api-client";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as dotenv from "dotenv";
import { syncCarAssets } from "./index.js";
import { getIRacingCredentials } from "./util.js";

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

const program = new Command("sync-iracing-car-assets")
  .description("Downloads the latest car assets.")
  .requiredOption("-o, --out-dir <path>", "Output directory")
  .option("-i, --write-full-info", "Write full car info", false)
  .option("--skip-info", "Skip writing car info", false)
  .option("-a, --write-full-assets", "Write full car assets", false)
  .option("--skip-assets", "Skip writing car asset", false)
  .action(async (_, command) => {
    console.log("Downloading car assets...");

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
      new CarApi(undefined, undefined, client)
    );

    console.log("Done!");
  });

program.parse();
