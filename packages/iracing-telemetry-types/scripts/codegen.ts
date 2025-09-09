#!/usr/bin/env ts-node
import path from "node:path";
import { downloadSchema } from "@iracing-data/sync-telemetry-json-schema";
import { generateTypes } from "@iracing-data/iracing-json-schema-to-typescript";

const API_URL = process.env.API_URL || "localhost:50051";

const main = async () => {
  const schemaOutputDir = path.join(__dirname, "../schemas");

  const { telemetrySchemaPath, sessionSchemaPath } = await downloadSchema({
    serverUrl: API_URL,
    outputDir: schemaOutputDir,
  });

  await generateTypes({
    outputDir: path.join(__dirname, "../src"),
    telemetrySchemaPath,
    sessionSchemaPath,
  });
};

main();
