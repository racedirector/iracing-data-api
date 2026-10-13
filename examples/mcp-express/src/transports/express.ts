import { createServer } from "node:http";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { startHttpListener } from "./http-listener";
import type { HttpListenerOptions } from "./http-listener";
import type { Transport } from "./transport";

/** Listener and routing choices owned by the command. */
export interface ExpressTransportOptions extends HttpListenerOptions {
  path: string;
}

/** Configure Express without opening a listener until the transport is started. */
export function configureExpressTransport(
  options: ExpressTransportOptions,
): Transport {
  return async ({ logger, createServer: createMcpServer }) => {
    logger.info("Starting Express MCP server");

    const handler = createMcpHandler(createMcpServer);

    const app = createMcpExpressApp();

    const node = toNodeHandler(handler);

    app.all(options.path, (req, res) => void node(req, res, req.body));

    const server = createServer(app);

    server.on("error", (error: Error) => {
      logger.error("Express MCP server failed", { err: error });
    });

    // Binding must succeed before the runner installs termination handlers.
    const handle = await startHttpListener(server, handler, options);

    logger.info("Express MCP server listening", {
      address: server.address(),
      path: options.path,
    });

    return handle;
  };
}
