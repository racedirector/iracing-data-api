import { McpServer } from "@modelcontextprotocol/server";
import { AppLogger, createNoopLogger } from "../logger";

export interface TransportOptions {
  createServer: () => McpServer;
  logger: AppLogger;
}

export interface TransportHandle {
  close(): void | Promise<void>;
}

export interface Transport {
  (options: TransportOptions): TransportHandle;
}

/**
 * Registers global termination handlers for the provided transport handle.
 * @param handle The transport to install termination handlers
 * @param logger The logger to send messages to. Defaults to noop.
 */
export function registerTerminationHandlers(
  handle: TransportHandle,
  logger: AppLogger = createNoopLogger(),
) {
  let stopping = false;
  const stop = (signal: NodeJS.Signals) => {
    if (stopping) {
      logger.debug("MCP server shutdown already in progress", { signal });
      return;
    }

    stopping = true;
    logger.info("Stopping MCP server", { signal });

    void Promise.resolve()
      .then(() => handle.close())
      .then(() => logger.info("MCP server stopped"))
      .catch((error: unknown) => {
        logger.error("MCP server shutdown failed", { err: error });
        process.exitCode = 1;
      })
      .finally(() => {
        process.removeListener("SIGINT", stop);
        process.removeListener("SIGTERM", stop);
      });
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
