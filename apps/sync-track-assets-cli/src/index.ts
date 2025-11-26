#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { Configuration, TrackApi } from "@iracing-data/api-client-fetch";
import { syncTrackAssets } from "@iracing-data/sync-track-assets";
import { client } from "./oauth-client";

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

    /**
     * Authorize the consumer with a password limited grant from iRacing OAuth services
     */
    const token = await client.passwordLimitedAuthorization();

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
          accessToken: token.access_token,
        })
      )
    );

    console.log("Done!");
  });

program.parse();
