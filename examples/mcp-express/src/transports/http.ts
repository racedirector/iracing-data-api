import { createServer } from "node:http";
import {
  localhostHostValidation,
  localhostOriginValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { startHttpListener } from "./http-listener";
import type { HttpListenerOptions } from "./http-listener";
import type { Transport } from "./transport";

/** Configure the native HTTP adapter; the returned transport owns its listener. */
export function configureHttpTransport(
  options: HttpListenerOptions,
): Transport {
  return async ({ logger, createServer: createMcpServer }) => {
    logger.info("Starting Node HTTP MCP server");

    const handler = createMcpHandler(createMcpServer);

    const nodeHandler = toNodeHandler(handler);

    const validateHost = localhostHostValidation();

    const validateOrigin = localhostOriginValidation();

    const server = createServer((req, res) => {
      if (!validateHost(req, res) || !validateOrigin(req, res)) {
        return;
      }

      void nodeHandler(req, res);
    });

    server.on("error", (error: Error) => {
      logger.error("Node HTTP MCP server failed", { err: error });
    });

    // Binding must succeed before the runner installs termination handlers.
    const handle = await startHttpListener(server, handler, options);

    logger.info("Node HTTP MCP server listening", {
      address: server.address(),
    });

    return handle;
  };
}
