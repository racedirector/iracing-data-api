#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { downloadSchema } from "./";

const program = new Command("sync-iracing-telemetry-json-schema")
  .description(
    "CLI tool for interacting with iracing-telemetry-services servers to fetch JSON schema.",
  )
  .requiredOption("-o, --output <path>", "Output path")
  .option("-s, --source <url>", "Server URL", "http://localhost:50051")
  .action(async (_, command) => {
    const { output, source } = command.optsWithGlobals();

    const result = await downloadSchema({
      outputDir: output,
      serverUrl: source,
    });

    console.log("Successfully output schema:");
    console.log("\tTelemetry:", result.telemetrySchemaPath);
    console.log("\tSession:", result.sessionSchemaPath);
  });

program.parse();
