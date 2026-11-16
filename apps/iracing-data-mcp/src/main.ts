#!/usr/bin/env node
import { parseArgs } from "node:util";
import { LocalAuthorizationError } from "./auth-errors.js";
import { McpConfigurationError, parseStdioConfig } from "./config.js";
import { createFileCapabilities, validateFileSession } from "./credentials.js";
import { startMcpStdio } from "./stdio.js";

/** Local executable: stdio is the default; an HTTP host mounts the router. */
try {
  const { values } = parseArgs({
    options: {
      credentials: { type: "string" },
    },
    allowPositionals: false,
  });

  const config = parseStdioConfig({
    ...process.env,
    IRACING_MCP_CREDENTIAL_FILE:
      values.credentials ?? process.env.IRACING_MCP_CREDENTIAL_FILE,
  });

  await validateFileSession(config.credentialsFile);

  // This executable explicitly selects the file-backed strategy. Transport
  // adapters accept host-owned resolvers and do not select an auth strategy.
  const capabilities = createFileCapabilities(
    config.credentialsFile,
    config.clientMetadata,
  );

  startMcpStdio({
    actor: { id: "local", provider: "file" },
    resolveCapabilities: () => capabilities,
  });
} catch (error) {
  if (!(error instanceof LocalAuthorizationError)) {
    const detail =
      error instanceof McpConfigurationError
        ? error.message
        : "Invalid startup arguments. Supported option: --credentials <path>. Supply environment variables through your MCP client or an external loader such as dotenv CLI. See https://github.com/racedirector/iracing-data-api/tree/main/apps/iracing-data-mcp#environment-configuration";

    process.stderr.write(`MCP startup failed. ${detail}\n`);
  }

  process.exitCode = 1;
}
