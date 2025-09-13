#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { syncCarAssets } from "./index.js";

const program = new Command("sync-iracing-car-assets")
  .description("Downloads the latest car assets.")
  .requiredOption("-o, --out-dir <path>", "Output directory")
  .option("-i, --write-full-info", "Write full car info", false)
  .option("--skip-info", "Skip writing car info", false)
  .option("-a, --write-full-assets", "Write full car assets", false)
  .option("--skip-assets", "Skip writing car asset", false)
  .option("-u, --username <username>", "iRacing username")
  .action(async (_, command) => {
    console.log("Downloading car assets...");

    const {
      outDir,
      writeFullAssets,
      writeFullInfo,
      skipInfo: skipCarInfo,
      skipAssets: skipCarAssets,
      username,
    } = command.optsWithGlobals();

    await syncCarAssets({
      outputDir: outDir,
      writeFullAssets,
      writeFullInfo,
      skipCarAssets,
      skipCarInfo,
      username,
    });

    console.log("Done!");
  });

program.parse();
