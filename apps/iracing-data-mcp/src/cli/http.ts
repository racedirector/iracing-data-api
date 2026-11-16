import { createHttpServer } from "./server.js";
import type { HttpServerOptions } from "./server.js";
import type { Server } from "node:http";
import type pino from "pino";

/**
 * Options for customizing the http runtime.
 */
export interface CreateHttpListenerOptions extends Pick<
  HttpServerOptions,
  "host" | "port" | "services" | "catalogs" | "assets"
> {
  /** Logger instance. */
  logger: pino.Logger;
}

/**
 * Create the HTTP listener with termination handlers.
 * @param {CreateHttpListenerOptions} options - Listener options and logging configuration.
 * @returns {Server} - Node server.
 */
export function createHttpListener(options: CreateHttpListenerOptions): Server {
  const { server, close } = createHttpServer({
    host: options.host,
    port: options.port,
    shutdownTimeoutMs: 10000,
    services: options.services,
    catalogs: options.catalogs,
    assets: options.assets,
  });

  server
    .once("listening", () => {
      options.logger.info(
        {
          host: options.host,
          port: options.port,
        },
        "API listening",
      );
    })
    .once("error", (error) => {
      options.logger.error({ error }, "API listener failed");
      process.exitCode = 1;
    });

  // Install termination handlers
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => {
      void close().catch((error: unknown) => {
        options.logger.error({ error }, "API shutdown failed");
        process.exitCode = 1;
      });
    });
  }

  return server;
}
