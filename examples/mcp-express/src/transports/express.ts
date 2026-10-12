/**
 * Serves the MCP server over expresss HTTP.
 */
import { errorMonitor } from "node:events";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Transport } from "./transport";

export const createExpressTransport: Transport = ({ logger, createServer }) => {
  logger.info("Starting Express MCP server");
  const handler = createMcpHandler(createServer);
  const app = createMcpExpressApp();
  const node = toNodeHandler(handler);

  app.all("/mcp", (req, res) => void node(req, res, req.body));

  const server = app.listen(3000, "127.0.0.1");
  server.once("listening", () => {
    logger.info("Express MCP server listening", {
      host: "127.0.0.1",
      port: 3000,
      path: "/mcp",
    });
  });
  server.on(errorMonitor, (error: Error) => {
    logger.error("Express MCP server failed", { err: error });
  });

  return {
    async close() {
      logger.debug("Closing Express listener, connections, and MCP handler");
      const closed = new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      server.closeAllConnections();
      await Promise.all([handler.close(), closed]);
    },
  };
};

export default createExpressTransport;
