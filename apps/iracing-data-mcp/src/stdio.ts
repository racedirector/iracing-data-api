import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { composeMcpServices } from "./composition.js";
import { createCliCapabilities } from "./credentials.js";
import type { McpConfig } from "./config.js";

/**
 * Start a local MCP connection using the CLI's dedicated credential document.
 * There is no listener, HTTP authorization server, or OAuth callback flow.
 * @param {Pick<McpConfig, "credentialsFile">} config - Local credential document selection.
 * @returns {ReturnType<typeof serveStdio>} Handle for closing the stdio connection.
 */
export function startMcpStdio(
  config: Pick<McpConfig, "credentialsFile">,
): ReturnType<typeof serveStdio> {
  const capabilities = createCliCapabilities(config.credentialsFile);

  const services = composeMcpServices(
    { id: "local", provider: "cli" },
    () => capabilities,
  );

  return serveStdio(
    () =>
      createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services,
      }),
    {
      onerror: () => {
        process.stderr.write("MCP transport error.\n");
      },
    },
  );
}
