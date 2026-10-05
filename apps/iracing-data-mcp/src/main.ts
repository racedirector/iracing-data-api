import { startProduction } from "./production.js";

void startProduction().catch(() => {
  console.error(
    "MCP startup failed. Check client ID, exact Host/Origin configuration, secret-file permissions, and non-root ownership of the 0700 data directory. See the local Docker guide; stop the server before repairing credentials.",
  );
  process.exitCode = 1;
});
