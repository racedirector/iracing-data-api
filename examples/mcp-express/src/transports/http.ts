/**
 * Serves the MCP server over a default Node HTTP server.
 */
import { errorMonitor } from "node:events";
import { createServer as createHttpServer } from "node:http";
import {
  localhostHostValidation,
  localhostOriginValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Transport } from "./transport";

export const createHttpTransport: Transport = ({ logger, createServer }) => {
  logger.info("Starting Node HTTP MCP server");

  const handler = createMcpHandler(createServer);
  const nodeHandler = toNodeHandler(handler);
  const validateHost = localhostHostValidation();
  const validateOrigin = localhostOriginValidation();

  const server = createHttpServer((req, res) => {
    if (!validateHost(req, res) || !validateOrigin(req, res)) return;
    void nodeHandler(req, res);
  })
    .listen(3000, "127.0.0.1")
    .once("listening", () => {
      logger.info("Node HTTP MCP server listening", {
        host: "127.0.0.1",
        port: 3000,
      });
    })
    .on(errorMonitor, (error: Error) => {
      logger.error("Node HTTP MCP server failed", { err: error });
    });

  return {
    async close() {
      logger.debug("Closing HTTP listener, connections, and MCP handler");
      const closed = new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      server.closeAllConnections();
      await Promise.all([handler.close(), closed]);
    },
  };
};

export default createHttpTransport;
