#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { generateTypes } from "./";

const program = new Command("sync-iracing-telemetry-json-schema")
  .description("CLI tool for transforming JSON schema to typescript types.")
  .requiredOption("-o, --output <path>", "Output path")
  .option(
    "--ti, --telemetry-input <telemetrySchemaPath>",
    "Telemetry JSON schema input"
  )
  .option(
    "--to, --telemetry-output <telemetryTypesPath>",
    "Telmetry types output"
  )
  .option(
    "--si, --session-input <sessionSchemaPath>",
    "Session JSON schema input"
  )
  .option("--so, --session-output <sessionTypesPath>", "Session types output")
  .action(async (_, command) => {
    const {
      output,
      sessionInput,
      sessionOutput,
      telemetryInput,
      telemetryOutput,
    } = command.optsWithGlobals();

    await generateTypes({
      outputDir: output,
      sessionSchemaPath: sessionInput,
      sessionTypesPath: sessionOutput,
      telemetrySchemaPath: telemetryInput,
      telemetryTypesPath: telemetryOutput,
    });

    console.log("Output types to", output);
  });

program.parse();
