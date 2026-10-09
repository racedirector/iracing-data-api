/**
 * Executable startup boundary. Production owns configuration and lifetimes;
 * this entry point projects startup failure to fixed remediation text and nonzero
 * exit status. Raw configuration, filesystem and credential exceptions stay private.
 */
import { startProduction } from "./production.js";

void startProduction().catch(() => {
  console.error(
    "MCP startup failed. Check the client ID, exact Host/Origin configuration, optional client-secret file, and Docker-managed data volume. See the local Docker guide; stop the server before repairing credentials.",
  );
  process.exitCode = 1;
});
