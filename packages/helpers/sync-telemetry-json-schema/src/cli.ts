#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { downloadSchema } from "./";

const program = new Command("sync-iracing-telemetry-json-schema")
  .description(
    "CLI tool for interacting with iracing-telemetry-services servers to fetch JSON schema."
  )
  .requiredOption("-s, --source <url>", "Server URL")
  .requiredOption("-o, --output <path>", "Output path")
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
