import { AppLogger } from "../logger";
import type { McpServerFactory } from "@modelcontextprotocol/server";

/** Common dependencies passed to every configured transport at startup. */
export interface TransportOptions {
  createServer: McpServerFactory;
  logger: AppLogger;
}

/** The caller can stop a transport without knowing its underlying technology. */
export interface TransportHandle {
  close(): void | Promise<void>;
}

/** Start serving; asynchronous implementations resolve only when ready. */
export interface Transport {
  (options: TransportOptions): TransportHandle | Promise<TransportHandle>;
}

/** Process capabilities injected by the root rather than read by the runner. */
export type ProcessLifecycle = Pick<
  NodeJS.Process,
  "on" | "removeListener" | "exitCode"
>;

/**
 * Registers global termination handlers for the provided transport handle.
 * @param handle The transport to install termination handlers
 * @param logger The logger to send messages to.
 * @returns A function that removes the installed handlers.
 */
export function registerTerminationHandlers(
  handle: TransportHandle,
  logger: AppLogger,
  lifecycle: ProcessLifecycle,
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
        lifecycle.exitCode = 1;
      })
      .finally(() => {
        dispose();
      });
  };

  const dispose = () => {
    lifecycle.removeListener("SIGINT", stop);
    lifecycle.removeListener("SIGTERM", stop);
  };

  try {
    lifecycle.on("SIGINT", stop);
    lifecycle.on("SIGTERM", stop);
  } catch (error) {
    // Remove the first handler if installing the second one fails.
    dispose();

    throw error;
  }

  return dispose;
}
