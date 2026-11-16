#!/usr/bin/env node
import { loadEnvFile } from "node:process";
import { parseArgs } from "node:util";
import { parseConfig } from "./config.js";
import { startMcpStdio } from "./stdio.js";

function loadOptionalEnvironment(file: string): void {
  try {
    loadEnvFile(file);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

/** Local executable: stdio is the default; an HTTP host mounts the router. */
try {
  const { values } = parseArgs({
    options: {
      credentials: { type: "string" },
      "env-file-if-exists": { type: "string" },
    },
    allowPositionals: false,
  });

  if (values["env-file-if-exists"]) {
    loadOptionalEnvironment(values["env-file-if-exists"]);
  }

  startMcpStdio(
    parseConfig({
      ...process.env,
      IRACING_MCP_CREDENTIAL_FILE:
        values.credentials ?? process.env.IRACING_MCP_CREDENTIAL_FILE,
    }),
  );
} catch {
  process.stderr.write(
    "MCP startup failed. Check arguments, environment file and credential path.\n",
  );
  process.exitCode = 1;
}
