/**
 * HTTP and Streamable HTTP boundary for the local application.
 *
 * One listener shares application admission state and process/account services.
 * When session IDs are enabled by the composition root, 2025-era Streamable HTTP
 * initialize requests create one logical MCP session whose SDK server and transport
 * survive subsequent HTTP exchanges carrying the issued Mcp-Session-Id. Stateless
 * composition retains the existing isolated server/transport per HTTP exchange.
 *
 * HTTP request abort signals, deadlines and admission leases remain request/tool
 * scoped. They are never captured by process owners, and aborting one request
 * does not tear down an established MCP session. DELETE, failed initialization,
 * and application shutdown dispose session-owned SDK servers/transports.
 *
 * Host and optional Origin are checked against exact allowlists before MCP work.
 * Express bounds JSON uploads before SDK construction; protocol failures use
 * fixed text. Tool admission, deadlines and drain limits are declared below.
 * Health/initialize/listing remain available without valid upstream credentials;
 * liveness does not establish account access. This unauthenticated loopback MCP
 * boundary assumes trusted local users and cannot protect against a malicious
 * same-user process. iRacing tokens are not MCP bearer credentials.
 *
 * Shutdown stops admission, drains or cancels bounded HTTP work, closes logical
 * MCP sessions, then invokes the credential owner's shutdown hook. Cleanup
 * failure must remain observable as a nonzero production exit; forced
 * termination cannot guarantee durable quarantine.
 */
import { createServer, type IncomingMessage } from "node:http";
import {
  ApplicationFailure,
  ErrorEnvelopeSchema,
  createRequestContext,
  toolError,
  createDiagnosticLogger,
  healthDiagnostics,
  createMcpServer,
  type McpToolRegistrar,
  type McpServices,
} from "@iracing-data/mcp-server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import {
  WebStandardStreamableHTTPServerTransport,
  type JSONRPCMessage,
} from "@modelcontextprotocol/server";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import type { McpAuthorizationBoundary } from "./authorization.js";
import type { McpApplicationConfig } from "./config.js";
import type { AuthorizationState } from "./session.js";

export const transportLimits = Object.freeze({
  bodyBytes: 64 * 1024,
  toolMs: 30_000,
  admittedTools: 8,
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

  /** Request-scoped Data API access borrowed by package tools. */
  readonly services: McpServices;

  /** Host health and process cleanup; never passed to the MCP package. */
  readonly authorizationState?: () => AuthorizationState;
  readonly shutdownAuthorizationOwner?: () => Promise<void>;

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

interface Admission {
  admitted: number;
  stopping: boolean;
}

type JsonRpcId = string | number;
type ToolFailure = (
  code: "INTERNAL_ERROR" | "RATE_LIMITED",
  context: RequestContext,
) => ReturnType<typeof toolError>;
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
  readonly mcp: ReturnType<typeof createMcpServer>;
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

/**
 * Adds tool admission, deadlines, and error sanitization to a connected transport.
 * Shared admission rejects calls with RATE_LIMITED while stopping or at capacity;
 * the tool deadline sends INTERNAL_ERROR and then cancels the bound HTTP request.
 * Request aborts cancel the corresponding SDK operation and release its admission
 * without closing the session. Replies also release admission; unrecognized tool
 * errors become INTERNAL_ERROR, and protocol errors retain only their code.
 */
function installTransportLifecycle(
  session: McpSession,
  admission: Admission,
  clock: Schedule,
  logger: DiagnosticLogger,
) {
  const failure: ToolFailure = (code, context) => {
    const error = new ApplicationFailure(code);

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
            : failure("INTERNAL_ERROR", operation.context),
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

      if (
        admission.stopping ||
        admission.admitted >= transportLimits.admittedTools
      ) {
        void session.transport
          .send({
            jsonrpc: "2.0",
            id: message.id,
            result: failure("RATE_LIMITED", binding.context),
          })
          .catch((error) => logger.failure(binding.context, error));

        return;
      }

      admission.admitted++;

      let released = false;

      const clear = clock(() => {
        void session.transport
          .send({
            jsonrpc: "2.0",
            id: message.id,
            result: failure("INTERNAL_ERROR", binding.context),
          })
          .finally(binding.cancel)
          .catch((error) => logger.failure(binding.context, error));
      }, transportLimits.toolMs);

      const operation: ToolOperation = {
        ...binding,
        settled: false,
        release: () => {
          if (!released) {
            released = true;
            admission.admitted--;
            clear();
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
 * Returns the connected session with admission and cancellation handling installed.
 * Construction, tool registration, and connection errors propagate.
 */
async function createMcpSession(
  options: HttpApplicationOptions,
  admission: Admission,
  clock: Schedule,
  logger: DiagnosticLogger,
  sessions: Map<string, McpSession>,
  stateful: boolean,
) {
  const mcp = createMcpServer({
    config: options.config,
    services: options.services,
    registerTools: options.registerTools,
  });

  let session!: McpSession;

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

  session = {
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
  installTransportLifecycle(session, admission, clock, logger);

  return session;
}

/**
 * Creates the process-scoped HTTP application serving health and MCP endpoints.
 *
 * The returned application owns shared admission/shutdown state and, when enabled,
 * a registry of logical MCP sessions. initialize creates a session-scoped SDK
 * server/transport; subsequent POST/GET/DELETE exchanges route by Mcp-Session-Id.
 * Explicit stateless composition retains one server/transport per POST. Host/origin
 * validation, body limits, cancellation, tool admission, and bounded shutdown are
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

  const admission: Admission = { admitted: 0, stopping: false };

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
      if (admission.stopping) {
        server.closeIdleConnections();
      }
    });
    if (admission.stopping) {
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
      ...healthDiagnostics({ auth_state: options.authorizationState?.() }),
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
    if (admission.stopping) {
      res.status(503).type("text").send("Server is shutting down.");

      return;
    }

    // One RPC operation binds to one HTTP cancellation/deadline scope.
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
        admission,
        clock,
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

  // Bound slow/incomplete uploads independently of tool execution.
  server.requestTimeout = transportLimits.toolMs;
  server.headersTimeout = transportLimits.toolMs;

  return {
    server,
    get admittedTools() {
      return admission.admitted;
    },

    /** Counts initialized sessions still registered, excluding stateless exchanges. */
    get activeSessions() {
      return sessions.size;
    },
    get stopping() {
      return admission.stopping;
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
     * Stops admission and drains HTTP work, canceling remaining requests and
     * connections after 10 seconds. Closes registered MCP sessions before invoking
     * the authorization owner's shutdown hook. Returns the same promise on repeat
     * calls; cleanup failures reject it, and session close failure skips the hook.
     */
    shutdown() {
      if (shutdownPromise) {
        return shutdownPromise;
      }

      admission.stopping = true;
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
        .then(() => options.shutdownAuthorizationOwner?.());

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
