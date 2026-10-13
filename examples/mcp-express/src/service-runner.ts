import { registerTerminationHandlers } from "./transports/transport";
import type { AppLogger } from "./logger";
import type {
  ProcessLifecycle,
  Transport,
  TransportHandle,
} from "./transports/transport";
import type { McpServerFactory } from "@modelcontextprotocol/server";

/** Dependencies chosen once by the CLI composition root. */
export interface CreateServiceRunnerOptions<Configuration> {
  logger: AppLogger;
  lifecycle: ProcessLifecycle;
  composeServer: (
    configuration: Configuration,
    context: { logger: AppLogger },
  ) => McpServerFactory;
}

/** One command's configuration and already-configured transport. */
export interface RunServiceOptions<Configuration> {
  name: string;
  configuration: Configuration;
  transport: Transport;
}

/**
 * Start a composed service and own its process termination handlers.
 * The returned handle shares one close operation across signals and callers.
 */
export function createServiceRunner<Configuration>({
  logger,
  lifecycle,
  composeServer,
}: CreateServiceRunnerOptions<Configuration>) {
  return async function runService({
    name,
    configuration,
    transport,
  }: RunServiceOptions<Configuration>): Promise<TransportHandle> {
    const serviceLogger = logger.child({ transport: name });

    const createServer = composeServer(configuration, {
      logger: serviceLogger,
    });

    // Do not install process handlers until the transport has started successfully.
    const transportHandle = await transport({
      logger: serviceLogger,
      createServer,
    });

    let closing: Promise<void> | undefined;
    let removeTerminationHandlers: (() => void) | undefined;

    const handle: TransportHandle = {
      close() {
        // A signal and an explicit close may arrive together. Both await the same
        // shutdown, and listener cleanup runs even if the transport fails to close.
        closing ??= Promise.resolve()
          .then(() => transportHandle.close())
          .finally(() => removeTerminationHandlers?.());

        return closing;
      },
    };

    try {
      removeTerminationHandlers = registerTerminationHandlers(
        handle,
        serviceLogger,
        lifecycle,
      );
    } catch (error) {
      // Startup is incomplete if lifecycle registration fails after binding.
      await handle.close();

      throw error;
    }

    return handle;
  };
}
