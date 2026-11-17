import { createServer, Server } from "node:http";
import { serve } from "@hono/node-server";
import { createMcpRouter } from "./router.js";
import type { McpRouterOptions } from "./router.js";

/**
 * A handle to a running http server.
 */
export interface HttpTransportHandle {
  /** A node HTTP server. */
  server: Server;

  /**
   * A callback that indicates ready status.
   * @returns {boolean} Ready status.
   */
  isReady: () => boolean;

  /**
   * Close handle.
   * @returns {Promise<void>} A handle that resolves when the server is shut down.
   */
  close: () => Promise<void>;
}

/** Standalone HTTP listener configuration; embedding hosts use createMcpRouter. */
export interface HttpServerOptions extends McpRouterOptions {
  /** The listener host. */
  host: string;

  /** The listener port. */
  port: number;

  /** The length of time to wait for connections to close at shutdown. */
  shutdownTimeoutMs: number;
}

/**
 * Starts an HTTP server on the requested host and port.
 * @param {HttpServerOptions} options - The options for the server configuration.
 * @returns {HttpTransportHandle} - A server, a callback that reports ready status, and a close callback.
 * @throws {Error} - Throws if the constructed server isn't a Node HTTP server.
 */
export function createHttpServer({
  host,
  port,
  shutdownTimeoutMs: shutdownTimeout,
  ...options
}: HttpServerOptions): HttpTransportHandle {
  const app = createMcpRouter(options);

  const server = serve({
    port,
    hostname: host,
    fetch: app.fetch,
    createServer,
  });

  if (!(server instanceof Server)) {
    throw new Error("Expected Node HTTP server");
  }

  let isReady = true;

  let closing: Promise<void> | undefined;

  return {
    server,
    isReady: () => isReady,

    /** Stop accepting work, drain active requests, then force-close at the deadline. */
    close: () => {
      if (closing) {
        return closing;
      }

      isReady = false;
      closing = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          server.closeAllConnections();
        }, shutdownTimeout);

        server.close((error) => {
          clearTimeout(timeout);

          if (error) {
            reject(new Error("API shutdown failed"));
          } else {
            resolve();
          }
        });

        server.closeIdleConnections();
      });

      return closing;
    },
  };
}
