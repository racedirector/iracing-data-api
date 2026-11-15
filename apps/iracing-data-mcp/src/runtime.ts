import { randomUUID } from "node:crypto";
import { composeMcpServices } from "./composition.js";
import { parseMcpApplicationConfig } from "./config.js";
import { createHttpApplication, installTerminationHandlers } from "./http.js";
import type { McpAuthorizationBoundary } from "./authorization.js";
import type { McpRuntimeDependencies } from "./composition.js";
import type { RuntimeConfig } from "./runtime-config.js";

/** Inputs needed to host an MCP server on the supplied interface and port. */
export interface McpRuntimeOptions {
  /** Zod-validated host/port and exact Host/Origin allowlists. */
  readonly config: RuntimeConfig;

  /** Caller-selected actor identity and per-actor service providers. */
  readonly dependencies: McpRuntimeDependencies;

  /** Optional verified ingress bearer authorization supplied by the caller. */
  readonly authorization?: McpAuthorizationBoundary;

  /**
   * Optional shutdown callback; signals are installed only when supplied.
   * @param {0 | 1} exitCode - Zero after clean shutdown, otherwise one.
   */
  readonly onStopped?: (exitCode: 0 | 1) => void;
}

/**
 * Compose the HTTP runtime without opening a socket. The transport never
 * constructs credentials or assumes that two actors share an account.
 * @param {McpRuntimeOptions} options - Host configuration and actor-specific providers.
 * @returns {ReturnType<typeof createHttpApplication>} Unstarted runtime with listener and shutdown controls.
 */
export function createMcpRuntime({
  config,
  dependencies,
  authorization,
}: McpRuntimeOptions): ReturnType<typeof createHttpApplication> {
  const services = composeMcpServices(dependencies);

  return createHttpApplication({
    config: parseMcpApplicationConfig(),
    services,
    authorization,
    allowedHosts: config.allowedHosts,
    allowedOrigins: config.allowedOrigins,
    sessionIdGenerator: randomUUID,
  });
}

/**
 * Start the MCP host on precisely the configured host and port. The caller can
 * inject a Better Auth actor resolver without changing the transport or tools.
 * @param {McpRuntimeOptions} options - Listener, dependency and optional shutdown settings.
 * @returns {Promise<ReturnType<typeof createHttpApplication>>} Listening MCP application.
 */
export async function startMcpRuntime(
  options: McpRuntimeOptions,
): Promise<ReturnType<typeof createHttpApplication>> {
  const app = createMcpRuntime(options);

  try {
    await app.listen(options.config.port, options.config.host);

    if (options.onStopped) {
      installTerminationHandlers(app, options.onStopped);
    }

    return app;
  } catch {
    await app.shutdown();
    throw new Error("MCP runtime startup failed.");
  }
}
