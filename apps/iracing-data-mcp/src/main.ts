import { parseConfig } from "./config.js";
import { startMcpStdio } from "./stdio.js";

/** Local executable: stdio is the default; an HTTP host mounts the router. */
try {
  startMcpStdio(parseConfig(process.env));
} catch {
  process.stderr.write(
    "MCP startup failed. Check the local credential path.\n",
  );
  process.exitCode = 1;
}
