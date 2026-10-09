#!/usr/bin/env node

/**
 * Filesystem/serialization owner for the authored Data API OpenAPI document.
 *
 * Import ./index for an in-memory document; importing that library does not write.
 * Explicit format overrides extension inference; .yaml/.yml choose YAML and other
 * names choose JSON. Both serialize the same document, not independently assembled
 * contracts. The command creates the output directory, replaces the selected file
 * and reports filesystem failures through normal CLI rejection. These are build
 * artifacts, not secret token documents or atomic credential persistence.
 *
 * Invoke only after dependency-aware build. scripts/check-generated.mjs uses fresh
 * temporary destinations for deterministic byte/file comparison; reviewed --write
 * mode intentionally replaces generator-owned output. Do not hand-edit output.
 */
import fs from "node:fs";
import path from "node:path";
import { Command, Option } from "@commander-js/extra-typings";
import { stringify as stringifyYAML } from "yaml";
import { document } from "./";

function inferFormatFromFileName(fileName?: string): "yaml" | undefined {
  return fileName && /\.ya?ml$/i.test(fileName) ? "yaml" : undefined;
}

function resolveFormat(
  fileName: string,
  format?: "json" | "yaml",
): "json" | "yaml" {
  if (format !== undefined) return format;
  return /\.ya?ml$/i.test(fileName) ? "yaml" : "json";
}

export async function generateOpenAPISpec({
  outputDir = __dirname,
  fileName = "openapi.json",
  format,
}: {
  outputDir?: string;
  fileName?: string;
  format?: "json" | "yaml";
}) {
  const outputPath = path.join(outputDir, fileName);

  // Create the output dir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Remove the existing file
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Write to file.
  console.log(`Writing to ${outputPath}`);
  const outputFormat = resolveFormat(fileName, format);

  fs.writeFileSync(
    outputPath,
    outputFormat === "yaml"
      ? stringifyYAML(document)
      : JSON.stringify(document),
  );
}

const program = new Command("iracing-api-openapi")
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
