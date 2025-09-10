import fs from "node:fs";
import path from "node:path";
import { compileFromFile } from "json-schema-to-typescript";

export interface GenerateTypesOptions {
  /** Output directory for the generated types */
  outputDir: string;
  /** Path to the telemetry JSON schema */
  telemetrySchemaPath?: string;
  /** Output path for the telemetry types */
  telemetryTypesPath?: string;
  /** Path to the session JSON schema */
  sessionSchemaPath?: string;
  /** Output path for the session types */
  sessionTypesPath?: string;
}

/**
 * Generate TypeScript types from the telemetry and session JSON schema.
 */
export const generateTypes = async ({
  outputDir = __dirname,
  telemetrySchemaPath,
  telemetryTypesPath = path.join(outputDir, "telemetry.ts"),
  sessionSchemaPath,
  sessionTypesPath = path.join(outputDir, "session.ts"),
}: GenerateTypesOptions) => {
  // Ensure outputDir exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (telemetrySchemaPath) {
    const schema = await compileFromFile(telemetrySchemaPath, {
      additionalProperties: false,
      ignoreMinAndMaxItems: true,
      enableConstEnums: false,
      unreachableDefinitions: true,
    });
    // If the file already exists, remove it
    if (fs.existsSync(telemetryTypesPath)) {
      fs.unlinkSync(telemetryTypesPath);
    }

    fs.writeFileSync(telemetryTypesPath, schema);
  }

  if (sessionSchemaPath) {
    const schema = await compileFromFile(sessionSchemaPath, {
      additionalProperties: false,
      enableConstEnums: false,
      inferStringEnumKeysFromValues: true,
      unreachableDefinitions: true,
    });

    // If the file already exists, remove it
    if (fs.existsSync(sessionTypesPath)) {
      fs.unlinkSync(sessionTypesPath);
    }

    fs.writeFileSync(sessionTypesPath, schema);
  }
};
