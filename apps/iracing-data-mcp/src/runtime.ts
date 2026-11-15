import { createIracingMcpServer } from "@iracing-data/mcp";
import { serve } from "@hono/node-server";
import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import {
  createMcpHandler,
  getOAuthProtectedResourceMetadataUrl,
  requireBearerAuth,
} from "@modelcontextprotocol/server";
import { composeMcpServices } from "./composition.js";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/server";
import type { McpRuntimeDependencies } from "./composition.js";
import type { RuntimeConfig } from "./runtime-config.js";

/** Optional remote OAuth protection. Actor-to-iRacing-account lookup is separate. */
export interface McpIngressAuthorization {
  /** Exact public URL for this MCP resource. */
  readonly resourceUrl: string;
  /** OAuth verification supplied by the host, not the MCP tools. */
  readonly verifier: OAuthTokenVerifier;
  /** Issuer advertised in resource metadata. */
  readonly issuer?: string;
  /** Verified token scopes required to access MCP. */
  readonly requiredScopes?: readonly string[];
}

/** All configuration needed to compose a listener-free Hono MCP app. */
export interface McpRuntimeOptions {
  /** Validated, defaulted and transformed listener configuration. */
  readonly config: RuntimeConfig;
  /** Injected identity and actor-specific query capabilities. */
  readonly dependencies: McpRuntimeDependencies;
  /** Optional OAuth ingress for remote callers. */
  readonly authorization?: McpIngressAuthorization;
  /**
   * Optional process shutdown callback, used only by the executable.
   * @param {0 | 1} exitCode - Clean shutdown or failure.
   */
  readonly onStopped?: (exitCode: 0 | 1) => void;
}

/** The Hono app and its minimal Node listener lifecycle. */
export interface McpRuntime {
  /** Fetch-standard Hono application for embedding or testing. */
  readonly app: ReturnType<typeof createMcpHonoApp>;
  /** Node listener after listen() has been called. */
  readonly server: ReturnType<typeof serve> | undefined;
  /**
   * Bind the application to the specified interface and port.
   * @param {number} port - Listening TCP port (zero for tests).
   * @param {string} host - Listening host.
   * @returns {Promise<void>} Resolves after the socket starts listening.
   */
  listen(port?: number, host?: string): Promise<void>;
  /**
   * Stop accepting requests, close MCP exchanges and release credentials.
   * @returns {Promise<void>} Completion after listener and credential shutdown.
   */
  shutdown(): Promise<void>;
}

/**
 * Compose two MCP tools into a single Hono handler. The SDK owns MCP request
 * classification and stateless transport; the host owns actor resolution.
 * @param {McpRuntimeOptions} options - Validated listener and injected providers.
 * @returns {McpRuntime} Unstarted Hono application with a small Node lifecycle.
 */
export function createMcpRuntime(options: McpRuntimeOptions): McpRuntime {
  const { config, authorization } = options;
  const services = composeMcpServices(options.dependencies);
  const app = createMcpHonoApp({
    host: config.host,
    allowedHosts: config.allowedHosts.map((host) => new URL(`http://${host}`).hostname),
    allowedOrigins: config.allowedOrigins.map((origin) => new URL(origin).hostname),
    maxRequestBodySize: 64 * 1024,
  });
  const handler = createMcpHandler(
    () => createIracingMcpServer({
      serverInfo: { name: "iracing-data-mcp", version: "0.0.0" },
      services,
    }),
    { maxRequestBodySize: 64 * 1024 },
  );

  // The SDK protects hostnames; preserve the operator's exact port/origin list.
  app.use("*", async (c, next) => {
    const host = c.req.header("host");
    const origin = c.req.header("origin");

    if (
      !host || !config.allowedHosts.includes(host) ||
      (origin !== undefined && !config.allowedOrigins.includes(origin))
    ) {
      return c.json({ jsonrpc: "2.0", error: { code: -32000, message: "Forbidden" }, id: null }, 403);
    }

    return next();
  });

  app.get("/healthz", (c) => c.json({
    live: true,
    auth_state: services.authorizationState?.() ?? "ready",
  }));

  if (authorization?.issuer) {
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
    app.get(path, (c) => c.json(resource, 200, { "Access-Control-Allow-Origin": "*" }));
    app.options(path, (c) => c.body(null, 204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version",
    }));
  }

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

  app.all("/mcp", async (c) => {
    const auth = authorize ? await authorize(c.req.raw) : undefined;
    if (auth instanceof Response) {
      return auth;
    }

    return handler.fetch(c.req.raw, {
      parsedBody: c.get("parsedBody"),
      authInfo: auth,
    });
  });

  let listener: ReturnType<typeof serve> | undefined;
  let stopped = false;

  return {
    app,
    get server() {
      return listener;
    },
    listen(port = config.port, host = config.host) {
      return new Promise<void>((resolve, reject) => {
        listener = serve({ fetch: app.fetch, port, hostname: host }, resolve);
        listener.once("error", reject);
      });
    },
    async shutdown() {
      if (stopped) {
        return;
      }
      stopped = true;
      await handler.close();
      if (listener?.listening) {
        await new Promise<void>((resolve, reject) => {
          listener!.close((error) => error ? reject(error) : resolve());
        });
      }
      await services.shutdownAuthorizationOwner?.();
    },
  };
}

/**
 * Compose Hono and start the Node listener at the configured host and port.
 * @param {McpRuntimeOptions} options - Host and dependency injection options.
 * @returns {Promise<McpRuntime>} Running MCP host.
 */
export async function startMcpRuntime(options: McpRuntimeOptions): Promise<McpRuntime> {
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
