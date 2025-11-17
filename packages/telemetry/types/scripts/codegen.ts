#!/usr/bin/env ts-node
import path from "node:path";
import { fileURLToPath } from "url";
import { downloadSchema } from "@iracing-data/sync-telemetry-json-schema";
import { generateTypes } from "@iracing-data/iracing-json-schema-to-typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || "localhost:50051";

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
