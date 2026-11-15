import { parseArgs } from "node:util";
import { parseConfig } from "./config.js";
import { startMcpStdio } from "./stdio.js";

/** Local executable: stdio is the default; an HTTP host mounts the router. */
try {
  const { values } = parseArgs({
    options: { credentials: { type: "string" } },
    allowPositionals: false,
  });

  startMcpStdio(
    parseConfig({
      ...process.env,
      IRACING_MCP_CREDENTIAL_FILE:
        values.credentials ?? process.env.IRACING_MCP_CREDENTIAL_FILE,
    }),
  );
} catch {
  process.stderr.write(
    "MCP startup failed. Check the local credential path.\n",
  );
  process.exitCode = 1;
}
