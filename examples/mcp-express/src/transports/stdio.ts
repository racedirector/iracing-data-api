/**
 * Serves the MCP server over stdio.
 */

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { Transport } from "./transport";

export const createStdIoTransport: Transport = ({ logger, createServer }) => {
  logger.info("Starting stdio MCP server");
  const server = serveStdio(createServer, {
    onerror: (error) => {
      logger.error("Stdio MCP server failed", { err: error });
    },
  });
  logger.info("Stdio MCP server started");
  return server;
};

export default createStdIoTransport;
