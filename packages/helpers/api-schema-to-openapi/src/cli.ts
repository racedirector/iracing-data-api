#!/usr/bin/env node

import path from "node:path";
import { Command } from "@commander-js/extra-typings";
import { generateOpenAPISpec } from "./";

const program = new Command("iracing-api-openapi")
  .requiredOption("-o, --output <path>", "Output path")
  .option(
    "-f, --file <fileName>",
    "The name of the output file. Defaults to 'openapi.json'",
  )
  .action(async (_, command) => {
    const { output, file = "openapi.json" } = command.optsWithGlobals();

    await generateOpenAPISpec({
      fileName: file,
      outputDir: output,
    });

    console.log("Output schema to", path.join(output, file));
  });

program.parse();
