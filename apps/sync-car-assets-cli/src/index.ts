#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { CarApi, Configuration } from "@iracing-data/api-client-fetch";
import { syncCarAssets } from "@iracing-data/sync-car-assets";
import { client } from "./oauth-client";

const program = new Command("sync-iracing-car-assets")
  .description("Downloads the latest car assets.")
  .requiredOption("-o, --out-dir <path>", "Output directory")
  .option("-i, --write-full-info", "Write full car info", false)
  .option("--skip-info", "Skip writing car info", false)
  .option("-a, --write-full-assets", "Write full car assets", false)
  .option("--skip-assets", "Skip writing car asset", false)
  .action(async (_, command) => {
    console.log("Downloading car assets...");

    /**
     * Authorize the consumer with a password limited grant from iRacing OAuth services
     */
    const token = await client.passwordLimitedAuthorization();

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
          accessToken: token.access_token,
        })
      )
    );

    console.log("Done!");
  });

program.parse();
