import { McpServer } from "@modelcontextprotocol/server";
import type { McpApplicationConfig } from "./config.js";
import type { McpServices } from "./services.js";

/**
 * Registers MCP tools on a request-scoped server using the application's shared services.
 *
 * Registrars should only bind protocol handlers; long-lived OAuth and Data API state belongs
 * to {@link McpServices} so it can be reused across request-scoped server instances.
 */
export type McpToolRegistrar = (
  server: McpServer,
  services: McpServices,
) => void;

const toolRegistrars: readonly McpToolRegistrar[] = [];

/**
 * Registers the app-owned tool surface on one request-scoped MCP server.
 *
 * Tool slices add registrars here; transports and shared services remain outside
 * this function so server instances can stay request scoped.
 */
export function registerMcpTools(
  server: McpServer,
  services: McpServices,
): void {
  for (const register of toolRegistrars) {
    register(server, services);
  }
}

/** Inputs required to construct one request-scoped MCP server instance. */
export interface CreateMcpServerOptions {
  /** Stable application identity advertised during MCP initialization. */
  readonly config: McpApplicationConfig;
  /** Long-lived dependencies shared by request-scoped MCP server instances. */
  readonly services: McpServices;
}

/** Creates a fresh MCP server around long-lived application services. */
export function createMcpServer({
  config,
  services,
}: CreateMcpServerOptions): McpServer {
  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  registerMcpTools(server, services);
  return server;
}
