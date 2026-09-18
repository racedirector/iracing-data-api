#!/usr/bin/env node

import path from "node:path";
import { Command, Option } from "@commander-js/extra-typings";
import { generateOpenAPISpec } from ".";

function inferFormatFromFileName(fileName?: string): "yaml" | undefined {
  return fileName && /\.ya?ml$/i.test(fileName) ? "yaml" : undefined;
}

const program = new Command("iracing-oauth-api-openapi")
  .requiredOption("-o, --output <path>", "Output path")
  .option(
    "-f, --file <fileName>",
    "The name of the output file. Defaults to 'openapi.json'; a .yaml or .yml extension implies YAML output unless --format is given.",
  )
  .addOption(
    new Option(
      "--format <format>",
      "Force the output format: json or yaml. Defaults to the extension of --file.",
    ).choices(["json", "yaml"] as const),
  )
  .action(async (_, command) => {
    const { output, file = "openapi.json", format } = command.optsWithGlobals();

    const resolvedFormat = format ?? inferFormatFromFileName(file) ?? "json";

    await generateOpenAPISpec({
      fileName: file,
      outputDir: output,
      format: resolvedFormat,
    });

    console.log("Output schema to", path.join(output, file));
  });

program.parse();
