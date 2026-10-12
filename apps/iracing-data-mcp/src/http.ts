/** Host-owned Express routing, legacy MCP sessions, cancellation and shutdown. */
import { createServer, type IncomingMessage } from "node:http";
import {
  ApplicationFailure,
  ErrorEnvelopeSchema,
  createRequestContext,
  toolError,
  registerIracingTools,
} from "@iracing-data/mcp-tools";
import { toNodeHandler } from "@modelcontextprotocol/node";
import {
  McpServer,
  WebStandardStreamableHTTPServerTransport,
  type JSONRPCMessage,
} from "@modelcontextprotocol/server";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import {
  createDiagnosticLogger,
  healthDiagnostics,
} from "./diagnostics/logging.js";
import type { McpAuthorizationBoundary } from "./authorization.js";
import type { McpApplicationConfig } from "./config.js";
import type { McpServices, McpToolRegistrar } from "./services.js";

export const transportLimits = Object.freeze({
  bodyBytes: 64 * 1024,
  drainMs: 10_000,
});

/** Schedules a lifecycle callback and returns a cancellation function. */
export type Schedule = (
  callback: () => void,
  milliseconds: number,
) => () => void;
const schedule: Schedule = (callback, milliseconds) => {
  const timer = setTimeout(callback, milliseconds);

  return () => clearTimeout(timer);
};

/**
 * Dependencies and test seams used to construct the MCP HTTP application.
 */
export interface HttpApplicationOptions {
  /** Stable application identity advertised by MCP session/exchange servers. */
  readonly config: McpApplicationConfig;

  /** Long-lived upstream services shared across MCP sessions. */
  readonly services: McpServices;

  /** Optional bearer boundary; absence preserves trusted-local behavior. */
  readonly authorization?: McpAuthorizationBoundary;

  /** Optional registrar used by tests or later slices to add tools. */
  readonly registerTools?: McpToolRegistrar;

  /** Exact authorities/origins; production validates configuration before composition. */
  readonly allowedHosts?: readonly string[];
  readonly allowedOrigins?: readonly string[];

  /** Sanitizing logger used for transport and tool diagnostics. */
  readonly logger?: ReturnType<typeof createDiagnosticLogger>;

  /** Deterministic lifecycle clock seam; production uses real timers. */
  readonly schedule?: Schedule;

  /**
   * Enables logical MCP sessions and generates their opaque identifiers.
   * Omit this only for explicitly stateless embeddings/tests.
   */
  readonly sessionIdGenerator?: () => string;
}

type JsonRpcId = string | number;

type RequestContext = ReturnType<typeof createRequestContext>;
type DiagnosticLogger = ReturnType<typeof createDiagnosticLogger>;

interface RequestBinding {
  readonly context: RequestContext;
  readonly cancel: () => void;
  readonly signal: AbortSignal;
}

interface ToolOperation extends RequestBinding {
  settled: boolean;
  release: () => void;
}

interface McpSession {
  readonly mcp: McpServer;
  readonly transport: WebStandardStreamableHTTPServerTransport;
  readonly handleRequest: ReturnType<typeof toNodeHandler>;
  readonly requests: Map<JsonRpcId, RequestBinding>;
  readonly tools: Map<JsonRpcId, ToolOperation>;
  readonly stateful: boolean;
  id?: string;
  closing?: Promise<void>;
}

/** Returns a string or numeric ID, or undefined, without validating the RPC message. */
function jsonRpcId(body: unknown): JsonRpcId | undefined {
  if (!body || typeof body !== "object" || !("id" in body)) {
    return undefined;
  }

  const id = (body as { id?: unknown }).id;

  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

/** Returns a nonempty string session header verbatim, or undefined otherwise. */
function requestSessionId(req: IncomingMessage): string | undefined {
  const value = req.headers["mcp-session-id"];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Bridges HTTP disconnects to SDK cancellation and sanitizes protocol/tool failures. */
function installTransportLifecycle(
  session: McpSession,
  logger: DiagnosticLogger,
) {
  const failure = (context: RequestContext) => {
    const error = new ApplicationFailure("INTERNAL_ERROR");

    logger.failure(context, error, {
      operation: "tool_call",
      stage: "failed",
    });

    return toolError(error, context);
  };

  const send = session.transport.send.bind(session.transport);

  session.transport.send = async (message, extra) => {
    let safe: JSONRPCMessage = message;

    const id = "id" in message ? message.id : undefined;

    const operation =
      typeof id === "string" || typeof id === "number"
        ? session.tools.get(id)
        : undefined;

    if ("error" in message) {
      operation?.release();
      if (operation && (typeof id === "string" || typeof id === "number")) {
        session.tools.delete(id);
      }

      safe = {
        ...message,
        error: {
          code: message.error.code,
          message: "Protocol request rejected.",
        },
      };
    }

    if ("result" in message && operation) {
      if (operation.settled) {
        return;
      }

      operation.settled = true;

      const result = message.result;

      if (result.isError) {
        const parsed = ErrorEnvelopeSchema.safeParse(result.structuredContent);

        safe = {
          ...message,
          result: parsed.success
            ? toolError(
                new ApplicationFailure(
                  parsed.data.error.code,
                  parsed.data.error,
                ),
                operation.context,
              )
            : failure(operation.context),
        };
      }

      operation.release();
      if (typeof id === "string" || typeof id === "number") {
        session.tools.delete(id);
      }
    }

    await send(safe, extra);
  };

  const receive = session.transport.onmessage!;

  session.transport.onmessage = (message, extra) => {
    if (
      "method" in message &&
      "id" in message &&
      message.method === "tools/call" &&
      (typeof message.id === "string" || typeof message.id === "number")
    ) {
      const binding = session.requests.get(message.id) ?? {
        context: createRequestContext(),
        cancel: () => {},
        signal: new AbortController().signal,
      };

      let released = false;

      const operation: ToolOperation = {
        ...binding,
        settled: false,
        release: () => {
          if (!released) {
            released = true;
            binding.signal.removeEventListener("abort", cancelOperation);
          }
        },
      };

      session.tools.set(message.id, operation);
      const cancelOperation = () => {
        receive({
          jsonrpc: "2.0",
          method: "notifications/cancelled",
          params: {
            requestId: message.id,
            reason: "HTTP request aborted.",
          },
        });
        operation.release();
        session.tools.delete(message.id);
        logger.failure(
          binding.context,
          new ApplicationFailure("INTERNAL_ERROR"),
          { operation: "tool_call", stage: "failed" },
        );
      };

      if (binding.signal.aborted) {
        cancelOperation();
      } else {
        binding.signal.addEventListener("abort", cancelOperation, {
          once: true,
        });
      }
    }

    receive(message, extra);
  };
}

/**
 * Removes the session from the registry, releases and cancels its active tools,
 * clears request bindings, and closes its SDK server and transport.
 * Repeated calls await the same cleanup attempt, including any rejection;
 * SDK close failures propagate without retrying cleanup.
 */
async function closeMcpSession(
  session: McpSession,
  sessions: Map<string, McpSession>,
) {
  session.closing ??= (async () => {
    if (session.id) {
      sessions.delete(session.id);
    }

    for (const operation of session.tools.values()) {
      operation.release();
      operation.cancel();
    }

    session.tools.clear();
    session.requests.clear();
    await session.mcp.close();
  })();

  return session.closing;
}

/**
 * Creates and connects an SDK server/transport using the shared services.
 * Stateful sessions enter the registry on protocol initialization and are removed
 * and closed on protocol termination; stateless instances belong to one exchange.
 * Returns the connected session with cancellation handling installed.
 * Construction, tool registration, and connection errors propagate.
 */
async function createMcpSession(
  options: HttpApplicationOptions,
  logger: DiagnosticLogger,
  sessions: Map<string, McpSession>,
  stateful: boolean,
) {
  const mcp = new McpServer(
    { name: options.config.name, version: options.config.version },
    { supportedProtocolVersions: ["2025-11-25", "2025-06-18", "2025-03-26"] },
  );

  registerIracingTools(mcp, options.services);
  options.registerTools?.(mcp, options.services);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: stateful ? options.sessionIdGenerator : undefined,
    onsessioninitialized: stateful
      ? (sessionId) => {
          session.id = sessionId;
          sessions.set(sessionId, session);
        }
      : undefined,
    onsessionclosed: stateful
      ? async (sessionId) => {
          const current = sessions.get(sessionId);

          sessions.delete(sessionId);
          if (current) {
            await closeMcpSession(current, sessions);
          }
        }
      : undefined,
    enableJsonResponse: true,
    maxRequestBodySize: transportLimits.bodyBytes,
  });

  const session: McpSession = {
    mcp,
    transport,
    handleRequest: toNodeHandler(
      {
        async fetch(request, requestOptions) {
          const response = await transport.handleRequest(
            request,
            requestOptions,
          );

          // SDK errors can echo untrusted headers; retain status without exposing them.
          if (response.status >= 400) {
            await response.body?.cancel();

            return new Response("Protocol request rejected.", {
              status: response.status,
              headers: { "Content-Type": "text/plain" },
            });
          }

          return response;
        },
      },
      {
        maxRequestBodySize: transportLimits.bodyBytes,
        onerror: (error) => logger.failure(createRequestContext(), error),
      },
    ),
    requests: new Map(),
    tools: new Map(),
    stateful,
  };

  mcp.server.onerror = (error) => logger.failure(createRequestContext(), error);
  await mcp.connect(transport);
  installTransportLifecycle(session, logger);

  return session;
}

/**
 * Creates the process-scoped HTTP application serving health and MCP endpoints.
 *
 * The returned application owns shared shutdown state and, when enabled,
 * a registry of logical MCP sessions. initialize creates a session-scoped SDK
 * server/transport; subsequent POST/GET/DELETE exchanges route by Mcp-Session-Id.
 * Explicit stateless composition retains one server/transport per POST. Host/origin
 * validation, body limits, cancellation, and bounded shutdown are
 * enforced before request work can escape this boundary.
 *
 * Host/origin allowlists replace their defaults and are matched verbatim. Defaults
 * allow localhost:3000 and 127.0.0.1:3000 with their HTTP origins. Every route
 * requires exactly one allowed Host header; Origin may be absent, but must be
 * allowed when present. Rejected hosts or origins receive HTTP 403.
 */
export function createHttpApplication(options: HttpApplicationOptions) {
  const logger = options.logger ?? createDiagnosticLogger();

  const clock = options.schedule ?? schedule;

  const active = new Set<() => void>();

  const sessions = new Map<string, McpSession>();

  let stopping = false;

  let shutdownPromise: Promise<void> | undefined;

  const app = express();

  const server = createServer(app);

  app.disable("x-powered-by");

  // SDK Host/Origin middleware is port-agnostic. Keep the established exact
  // authority/origin policy (including duplicate Host rejection) for this host.
  app.use((req, res, next) => {
    const hostCount = req.rawHeaders.filter(
      (header, index) => index % 2 === 0 && header.toLowerCase() === "host",
    ).length;

    if (
      hostCount !== 1 ||
      !(options.allowedHosts ?? ["127.0.0.1:3000", "localhost:3000"]).includes(
        req.headers.host ?? "",
      )
    ) {
      res.status(403).type("text").send("Host rejected.");

      return;
    }

    if (
      req.headers.origin !== undefined &&
      !(
        options.allowedOrigins ?? [
          "http://127.0.0.1:3000",
          "http://localhost:3000",
        ]
      ).includes(req.headers.origin)
    ) {
      res.status(403).type("text").send("Origin rejected.");

      return;
    }

    res.once("finish", () => {
      if (stopping) {
        server.closeIdleConnections();
      }
    });
    if (stopping) {
      res.status(503).type("text").send("Server is shutting down.");

      return;
    }

    next();
  });

  app.get("/healthz", (_req, res) => {
    // Cached local state only; health never restores or refreshes credentials.
    res.json({
      name: "iracing-data-mcp",
      version: "0.0.0",
      live: true,
      ...healthDiagnostics({
        auth_state: options.services.authorizationState?.(),
      }),
    });
  });
  if (options.authorization) {
    app.use(options.authorization.metadataRouter);
    app.all("/mcp", options.authorization.middleware);
  }

  // Authentication precedes parsing. Express owns buffering, byte limits and JSON
  // errors; compressed uploads are disabled so they cannot bypass the wire bound.
  app.all(
    "/mcp",
    express.json({ limit: transportLimits.bodyBytes, inflate: false }),
  );
  const handleMcpRequest: RequestHandler = async (req, res) => {
    if (stopping) {
      res.status(503).type("text").send("Server is shutting down.");

      return;
    }

    // One RPC operation binds to one HTTP cancellation scope.
    // The legacy SDK accepts batches, but this host has never admitted them.
    if (Array.isArray(req.body)) {
      res.status(400).type("text").send("Batch requests are unsupported.");

      return;
    }

    const context = createRequestContext();

    const controller = new AbortController();

    const cancel = () => controller.abort();

    const disconnected = () => {
      if (!res.writableFinished) {
        cancel();
      }
    };

    active.add(cancel);
    res.on("close", disconnected);
    req.on("aborted", cancel);
    let session: McpSession | undefined;

    const requestId = jsonRpcId(req.body);

    try {
      const sessionId = requestSessionId(req);

      session = sessionId ? sessions.get(sessionId) : undefined;

      if (sessionId && !session) {
        res.status(404).type("text").send("Session not found.");

        return;
      }

      if (!session && req.method !== "POST") {
        res.status(400).type("text").send("Mcp-Session-Id header is required.");

        return;
      }

      session ??= await createMcpSession(
        options,
        logger,
        sessions,
        options.sessionIdGenerator !== undefined,
      );
      if (requestId !== undefined) {
        session.requests.set(requestId, {
          context,
          cancel,
          signal: controller.signal,
        });
      }

      await Promise.race([
        session.handleRequest(req, res, req.body),
        new Promise<void>((resolve) => {
          controller.signal.addEventListener("abort", () => resolve(), {
            once: true,
          });
        }),
      ]);
    } finally {
      if (requestId !== undefined) {
        session?.requests.delete(requestId);
      }

      active.delete(cancel);
      res.off("close", disconnected);
      req.off("aborted", cancel);
      if (session && (!session.stateful || session.id === undefined)) {
        await closeMcpSession(session, sessions);
      }
    }
  };

  app.post("/mcp", handleMcpRequest);
  if (options.sessionIdGenerator) {
    app.get("/mcp", handleMcpRequest);
    app.delete("/mcp", handleMcpRequest);
  }

  // Keep parser/async failures sanitized; Express 5 forwards rejected handlers here.
  const errors: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number" &&
      Number.isInteger(error.status) &&
      error.status >= 400 &&
      error.status <= 599
        ? error.status
        : 500;

    logger.log("error", createRequestContext(), { status });
    if (res.headersSent) {
      next(new Error("Request failed."));

      return;
    }

    res.status(status).type("text").send("Request failed.");
  };

  app.use(errors);

  // Node owns ordinary HTTP header/upload timeouts; no tool deadline is imposed.

  return {
    server,

    /** Counts initialized sessions still registered, excluding stateless exchanges. */
    get activeSessions() {
      return sessions.size;
    },
    get stopping() {
      return stopping;
    },
    listen(port = 3000, host = "127.0.0.1") {
      return new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => {
          server.off("error", reject);
          resolve();
        });
      });
    },

    /**
     * Stops new HTTP work and drains active exchanges, canceling remaining requests and
     * connections after 10 seconds. Closes registered MCP sessions before invoking
     * the authorization owner's shutdown hook. Returns the same promise on repeat
     * calls; cleanup failures reject it, and session close failure skips the hook.
     */
    shutdown() {
      if (shutdownPromise) {
        return shutdownPromise;
      }

      stopping = true;
      shutdownPromise = new Promise<void>((resolve) => {
        const clear = clock(() => {
          for (const abort of active) {
            abort();
          }

          server.closeAllConnections();
        }, transportLimits.drainMs);

        server.close(() => {
          clear();
          resolve();
        });
        server.closeIdleConnections();
      })
        .then(async () => {
          await Promise.all(
            [...sessions.values()].map((session) =>
              closeMcpSession(session, sessions),
            ),
          );
        })
        .then(() => options.services.shutdownAuthorizationOwner?.());

      return shutdownPromise;
    },
  };
}

/**
 * Installs SIGTERM/SIGINT handlers that initiate application shutdown.
 *
 * Importing this module has no process-level side effects; callers explicitly opt into signal
 * handling and receive an unsubscribe function for tests or embedding scenarios.
 */
export function installTerminationHandlers(
  app: ReturnType<typeof createHttpApplication>,
  onStopped?: (exitCode: 0 | 1) => void,
) {
  let terminating = false;

  const terminate = () => {
    if (terminating) {
      return;
    }

    terminating = true;
    void app.shutdown().then(
      () => onStopped?.(0),
      () => {
        console.error(
          "MCP shutdown failed. Keep the server stopped and replace credentials with host login before restarting.",
        );
        onStopped?.(1);
      },
    );
  };

  process.on("SIGTERM", terminate);
  process.on("SIGINT", terminate);

  return () => {
    process.off("SIGTERM", terminate);
    process.off("SIGINT", terminate);
  };
}
