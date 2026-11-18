import { createIracingMcpServer } from "@iracing-data/mcp";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createMcpRouter as router } from "../../dist/cli/router.js";
import { createHttpServer as listener } from "../../dist/cli/server.js";

export * from "../../dist/index.js";

function createServer(options) {
  return createIracingMcpServer({
    serverInfo: { name: "test-host", version: "1" },
    ...options,
  });
}

// Test hosts compose the listener-free factory with the SDK transports.
export function createHttpTransport({ serveOptions, ...options }) {
  return createMcpHandler(() => createServer(options), serveOptions);
}

export function createStdioTransport({ serveOptions, ...options }) {
  return serveStdio(() => createServer(options), serveOptions);
}

export function createMcpRouter(options) {
  return router({ server: () => createServer(options) });
}

export function createHttpServer({
  host,
  port,
  shutdownTimeoutMs,
  ...options
}) {
  return listener({
    host,
    port,
    shutdownTimeoutMs,
    server: () => createServer(options),
  });
}
