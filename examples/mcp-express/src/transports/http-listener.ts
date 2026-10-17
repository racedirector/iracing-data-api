import type { TransportHandle } from "./transport";
import type { Server } from "node:http";

/** Listener configuration supplied by the command's transport factory. */
export interface HttpListenerOptions {
  host: string;
  port: number;
}

/** Wait for binding and remove temporary listeners on every startup outcome. */
function waitForListening(
  server: Server,
  options: HttpListenerOptions,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function removeStartupListeners() {
      server.removeListener("listening", onListening);
      server.removeListener("error", onError);
    }

    function onError(error: Error) {
      removeStartupListeners();
      reject(error);
    }

    function onListening() {
      removeStartupListeners();
      resolve();
    }

    server.once("error", onError);
    server.once("listening", onListening);

    try {
      server.listen(options.port, options.host);
    } catch (error) {
      // Invalid listen arguments can throw before Node emits an error event.
      removeStartupListeners();
      reject(error);
    }
  });
}

/** Close both HTTP connections and MCP resources, even if one cleanup fails. */
async function closeHttpResources(
  server: Server,
  handler: TransportHandle,
): Promise<void> {
  const listenerClosed = new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });

  // Preserve the existing immediate shutdown policy: there is no drain period.
  server.closeAllConnections();

  const results = await Promise.allSettled([
    listenerClosed,
    Promise.resolve().then(() => handler.close()),
  ]);

  const failures: unknown[] = [];

  for (const result of results) {
    if (result.status === "rejected") {
      failures.push(result.reason);
    }
  }

  if (failures.length > 0) {
    throw new AggregateError(failures, "HTTP shutdown failed");
  }
}

/**
 * Resolve only after binding succeeds. A failed bind releases the MCP handler;
 * a successful bind returns a handle that shares one shutdown across all callers.
 */
export async function startHttpListener(
  server: Server,
  handler: TransportHandle,
  options: HttpListenerOptions,
): Promise<TransportHandle> {
  try {
    await waitForListening(server, options);
  } catch (error) {
    await handler.close();

    throw error;
  }

  let closing: Promise<void> | undefined;

  return {
    close() {
      closing ??= closeHttpResources(server, handler);

      return closing;
    },
  };
}
