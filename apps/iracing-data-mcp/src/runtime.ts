import { serve } from "@hono/node-server";
import { createIracingMcpServer } from "@iracing-data/mcp";
import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import {
  createMcpHandler,
  getOAuthProtectedResourceMetadataUrl,
  requireBearerAuth,
} from "@modelcontextprotocol/server";
import { composeMcpServices } from "./composition.js";
import type { McpRuntimeDependencies } from "./composition.js";
import type { RuntimeConfig } from "./runtime-config.js";
import type { McpServices } from "./services.js";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/server";

/** Optional remote OAuth ingress; account resolution remains separate. */
export interface McpIngressAuthorization {
  /** Canonical URL for this MCP resource. */
  readonly resourceUrl: string;

  /** Verifies the caller's bearer token. */
  readonly verifier: OAuthTokenVerifier;

  /** Optional advertised OAuth issuer. */
  readonly issuer?: string;

  /** Scopes required for incoming requests. */
  readonly requiredScopes?: readonly string[];
}

/** Inputs for the Hono MCP listener. */
export interface McpRuntimeOptions {
  /** Zod-validated listener settings. */
  readonly config: RuntimeConfig;

  /** Request-local actor and capability resolution. */
  readonly dependencies: McpRuntimeDependencies;

  /** Optional remote bearer verification. */
  readonly authorization?: McpIngressAuthorization;

  /**
   * Called after an executable receives a termination signal.
   * @param {0 | 1} exitCode - Zero for a clean shutdown, one otherwise.
   */
  readonly onStopped?: (exitCode: 0 | 1) => void;
}

/** Hono application and Node listener lifecycle. */
export interface McpRuntime {
  /** Hono app for embedding or HTTP testing. */
  readonly app: ReturnType<typeof createMcpHonoApp>;

  /** Node listener once started. */
  readonly server: ReturnType<typeof serve> | undefined;

  /**
   * Listen on the validated interface, or an explicit test override.
   * @param {number} port - TCP port, or zero for an ephemeral port.
   * @param {string} host - TCP interface.
   * @returns {Promise<void>} Resolves when listening.
   */
  listen(port?: number, host?: string): Promise<void>;

  /**
   * Close MCP requests, the listener, and the credential owner.
   * @returns {Promise<void>} Completion of the shutdown.
   */
  shutdown(): Promise<void>;
}

type HonoApp = ReturnType<typeof createMcpHonoApp>;
type Handler = ReturnType<typeof createMcpHandler>;

function createHttpApp(config: RuntimeConfig): HonoApp {
  const app = createMcpHonoApp({
    host: config.host,
    allowedHosts: config.allowedHosts.map(
      (host) => new URL(`http://${host}`).hostname,
    ),
    allowedOrigins: config.allowedOrigins.map(
      (origin) => new URL(origin).hostname,
    ),
    maxRequestBodySize: 64 * 1024,
  });

  // SDK hostname validation is augmented by the operator's exact port policy.
  app.use("*", async (context, next) => {
    const host = context.req.header("host");

    const origin = context.req.header("origin");

    if (
      !host ||
      !config.allowedHosts.includes(host) ||
      (origin !== undefined && !config.allowedOrigins.includes(origin))
    ) {
      return context.json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: "Forbidden" },
          id: null,
        },
        403,
      );
    }

    return next();
  });

  return app;
}

function mountResourceMetadata(
  app: HonoApp,
  authorization: McpIngressAuthorization | undefined,
): void {
  if (!authorization?.issuer) {
    return;
  }

  const path = new URL(
    getOAuthProtectedResourceMetadataUrl(new URL(authorization.resourceUrl)),
  ).pathname;

  const resource = {
    resource: authorization.resourceUrl,
    authorization_servers: [authorization.issuer],
    ...(authorization.requiredScopes?.length
      ? { scopes_supported: [...authorization.requiredScopes] }
      : {}),
  };

  app.get(path, (context) =>
    context.json(resource, 200, { "Access-Control-Allow-Origin": "*" }),
  );
  app.options(path, (context) =>
    context.body(null, 204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version",
    }),
  );
}

function mountMcp(
  app: HonoApp,
  handler: Handler,
  authorization: McpIngressAuthorization | undefined,
): void {
  const authorize = authorization
    ? requireBearerAuth({
        verifier: authorization.verifier,
        expectedResource: new URL(authorization.resourceUrl),
        requiredScopes: [...(authorization.requiredScopes ?? [])],
        resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(
          new URL(authorization.resourceUrl),
        ),
      })
    : undefined;

  app.all("/mcp", async (context) => {
    const auth = authorize ? await authorize(context.req.raw) : undefined;

    if (auth instanceof Response) {
      return auth;
    }

    return handler.fetch(context.req.raw, { authInfo: auth });
  });
}

function createLifecycle(
  app: HonoApp,
  handler: Handler,
  services: McpServices,
  config: RuntimeConfig,
): McpRuntime {
  let listener: ReturnType<typeof serve> | undefined;

  let stopped = false;

  return {
    app,
    get server() {
      return listener;
    },
    listen(port = config.port, host = config.host) {
      return new Promise<void>((resolve, reject) => {
        listener = serve({ fetch: app.fetch, port, hostname: host }, () => {
          resolve();
        });

        listener.once("error", reject);
      });
    },
    async shutdown() {
      if (stopped) {
        return;
      }

      stopped = true;

      await handler.close();

      const activeListener = listener;

      if (activeListener?.listening) {
        await new Promise<void>((resolve, reject) => {
          activeListener.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }

      await services.shutdownAuthorizationOwner?.();
    },
  };
}

/**
 * Compose two MCP tools into an unstarted Hono application.
 * @param {McpRuntimeOptions} options - Listener configuration and injected providers.
 * @returns {McpRuntime} Hono app with a small Node lifecycle.
 */
export function createMcpRuntime(options: McpRuntimeOptions): McpRuntime {
  const services = composeMcpServices(options.dependencies);

  const app = createHttpApp(options.config);

  const handler = createMcpHandler(
    () =>
      createIracingMcpServer({
        serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
        services,
      }),
    { maxRequestBodySize: 64 * 1024 },
  );

  app.get("/healthz", (context) =>
    context.json({
      live: true,
      auth_state: services.authorizationState?.() ?? "ready",
    }),
  );

  mountResourceMetadata(app, options.authorization);
  mountMcp(app, handler, options.authorization);

  return createLifecycle(app, handler, services, options.config);
}

/**
 * Compose the Hono app and listen on the configured interface and port.
 * @param {McpRuntimeOptions} options - Runtime and lifecycle configuration.
 * @returns {Promise<McpRuntime>} Running Hono MCP app.
 */
export async function startMcpRuntime(
  options: McpRuntimeOptions,
): Promise<McpRuntime> {
  const runtime = createMcpRuntime(options);

  try {
    await runtime.listen();
  } catch {
    await runtime.shutdown();
    throw new Error("MCP runtime startup failed.");
  }

  if (options.onStopped) {
    const stop = () => {
      void runtime.shutdown().then(
        () => options.onStopped?.(0),
        () => options.onStopped?.(1),
      );
    };

    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }

  return runtime;
}
