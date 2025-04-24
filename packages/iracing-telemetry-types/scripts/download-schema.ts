#!/usr/bin/env ts-node
import fs from "node:fs";
import path from "node:path";
import * as grpc from "@grpc/grpc-js";
import { iracing } from "./constants/proto/schema";

export const downloadSchema = async ({
  serverUrl,
  outputDir,
}: {
  serverUrl: string;
  outputDir: string;
}): Promise<{
  telemetrySchemaPath: string;
  sessionSchemaPath: string;
}> => {
  console.info("Downloading schema to ", outputDir);

  const client = new iracing.telemetry.SchemaClient(
    serverUrl,
    grpc.credentials.createInsecure()
  );

  const request = new iracing.telemetry.GetTelemetryJSONSchemaRequest();
  const response = await client.GetTelemetryJSONSchemaString(request);

  // Create schema directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const telemetrySchemaPath = path.join(outputDir, "telemetry.json");
  fs.writeFileSync(telemetrySchemaPath, response.telemetry);
  console.info(`Telemetry schema written to ${telemetrySchemaPath}`);

  const sessionSchemaPath = path.join(outputDir, "session.json");
  fs.writeFileSync(sessionSchemaPath, response.session);
  console.info(`Session schema written to ${sessionSchemaPath}`);

  return {
    telemetrySchemaPath,
    sessionSchemaPath,
  };
};

export default downloadSchema;
