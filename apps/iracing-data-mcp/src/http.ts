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
 * Uploads are bounded before parsing or SDK construction; protocol failures use
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
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { toNodeHandler } from "@modelcontextprotocol/node";
import {
  WebStandardStreamableHTTPServerTransport,
  type JSONRPCMessage,
} from "@modelcontextprotocol/server";
import {
  ApplicationFailure,
  ErrorEnvelopeSchema,
  createRequestContext,
  toolError,
} from "./diagnostics/errors.js";
import {
  createDiagnosticLogger,
  healthDiagnostics,
} from "./diagnostics/logging.js";
import { createMcpServer, type McpToolRegistrar } from "./mcp.js";
import type { McpApplicationConfig } from "./config.js";
import type { McpServices } from "./services.js";

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

  /** Long-lived OAuth and Data API dependencies shared across all MCP lifetimes. */
  readonly services: McpServices;

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

// Bound uploads before parsing or SDK construction; pause oversize input so
// the fixed 413 response can be flushed before closing the connection.
function readBoundedBody(req: IncomingMessage, signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    let bytes = 0;

    const cleanup = () => {
      req.off("data", data);
      req.off("end", end);
      req.off("error", fail);
      signal.removeEventListener("abort", abort);
    };

    const fail = () => {
      cleanup();
      reject(new Error("Request failed."));
    };

    const abort = () => {
      req.pause();
      fail();
    };

    const end = () => {
      cleanup();
      resolve(Buffer.concat(chunks).toString("utf8"));
    };

    const data = (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > transportLimits.bodyBytes) {
        cleanup();
        req.pause();
        const error = new Error("Request body too large.");

        error.name = "RequestBodyTooLargeError";
        reject(error);
      } else {
        chunks.push(chunk);
      }
    };

    req.on("data", data);
    req.once("end", end);
    req.once("error", fail);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
    }
  });
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
type Reply = (status: number, message: string) => void;

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
  readonly requests: Map<JsonRpcId, RequestBinding>;
  readonly tools: Map<JsonRpcId, ToolOperation>;
  readonly stateful: boolean;
  id?: string;
  closing?: Promise<void>;
}

interface ResolvedMcpRequest {
  readonly session: McpSession;
  readonly closeAfterRequest: boolean;
  readonly body?: unknown;
  readonly requestId?: JsonRpcId;
}

function jsonRpcId(body: unknown): JsonRpcId | undefined {
  if (!body || typeof body !== "object" || !("id" in body)) {
    return undefined;
  }

  const id = (body as { id?: unknown }).id;

  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

function requestSessionId(req: IncomingMessage): string | undefined {
  const value = req.headers["mcp-session-id"];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

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

async function createMcpSession(
  options: HttpApplicationOptions,
  admission: Admission,
  clock: Schedule,
  logger: DiagnosticLogger,
  sessions: Map<string, McpSession>,
  stateful: boolean,
) {
  const mcp = createMcpServer({
    ...options,
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
    requests: new Map(),
    tools: new Map(),
    stateful,
  };

  mcp.server.onerror = (error) => logger.failure(createRequestContext(), error);
  await mcp.connect(transport);
  installTransportLifecycle(session, admission, clock, logger);

  return session;
}

async function resolvePostRequest(
  req: IncomingMessage,
  res: ServerResponse,
  controller: AbortController,
  admission: Admission,
  reply: Reply,
  options: HttpApplicationOptions,
  clock: Schedule,
  logger: DiagnosticLogger,
  sessions: Map<string, McpSession>,
): Promise<ResolvedMcpRequest | undefined> {
  const text = await readBoundedBody(req, controller.signal);

  if (controller.signal.aborted || admission.stopping) {
    if (!res.destroyed) {
      reply(503, "Server is shutting down.");
    }

    return undefined;
  }

  let body: unknown;

  try {
    body = JSON.parse(text);
  } catch {
    reply(400, "Invalid JSON.");

    return undefined;
  }

  if (Array.isArray(body)) {
    reply(400, "Batch requests are unsupported.");

    return undefined;
  }

  const sessionId = requestSessionId(req);

  if (sessionId) {
    const session = sessions.get(sessionId);

    if (!session) {
      reply(404, "Session not found.");

      return undefined;
    }

    return {
      session,
      closeAfterRequest: false,
      body,
      requestId: jsonRpcId(body),
    };
  }

  const stateful = options.sessionIdGenerator !== undefined;

  const session = await createMcpSession(
    options,
    admission,
    clock,
    logger,
    sessions,
    stateful,
  );

  return {
    session,
    closeAfterRequest: !stateful,
    body,
    requestId: jsonRpcId(body),
  };
}

function resolveSessionRequest(
  req: IncomingMessage,
  reply: Reply,
  sessions: Map<string, McpSession>,
): ResolvedMcpRequest | undefined {
  const sessionId = requestSessionId(req);

  if (!sessionId) {
    reply(400, "Mcp-Session-Id header is required.");

    return undefined;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    reply(404, "Session not found.");

    return undefined;
  }

  return { session, closeAfterRequest: false };
}

async function forwardMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  controller: AbortController,
  resolved: ResolvedMcpRequest,
  logger: DiagnosticLogger,
  context: RequestContext,
) {
  const handler = toNodeHandler(
    {
      fetch: async (request) => {
        const signal = AbortSignal.any([request.signal, controller.signal]);

        const scopedRequest = new Request(request, { signal });

        const response = await resolved.session.transport.handleRequest(
          scopedRequest,
          resolved.body === undefined
            ? undefined
            : { parsedBody: resolved.body },
        );

        // SDK HTTP failures may echo protocol headers or exception data.
        // Preserve the SDK-owned status, discard its free-form error body.
        if (response.status >= 400) {
          logger.log("info", context, { status: response.status });
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
      onerror: (error) => logger.failure(context, error),
    },
  );

  await Promise.race([
    handler(req, res, resolved.body),
    new Promise<void>((resolve) => {
      controller.signal.addEventListener("abort", () => resolve(), {
        once: true,
      });
    }),
  ]);
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

  const server = createServer((req, res) => {
    const context = createRequestContext();

    res.once("finish", () => {
      if (admission.stopping) {
        server.closeIdleConnections();
      }
    });

    const reply = (status: number, message: string) => {
      logger.log("info", context, { status });
      res.writeHead(status, {
        "Content-Type": "text/plain",
        Connection: "close",
        ...(status === 405
          ? {
              Allow:
                req.url === "/healthz"
                  ? "GET"
                  : options.sessionIdGenerator === undefined
                    ? "POST"
                    : "POST, GET, DELETE",
            }
          : {}),
      });
      res.end(message);
    };

    const hostCount = req.rawHeaders.filter(
      (header, index) => index % 2 === 0 && header.toLowerCase() === "host",
    ).length;

    if (
      hostCount !== 1 ||
      !(options.allowedHosts ?? ["127.0.0.1:3000", "localhost:3000"]).includes(
        req.headers.host ?? "",
      )
    ) {
      return reply(403, "Host rejected.");
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
      return reply(403, "Origin rejected.");
    }

    if (admission.stopping) {
      return reply(503, "Server is shutting down.");
    }

    if (req.url === "/healthz") {
      if (req.method !== "GET") {
        return reply(405, "Method not allowed.");
      }

      res.writeHead(200, { "Content-Type": "application/json" });

      // Read cached local state only; never restore or refresh from health.
      return res.end(
        JSON.stringify({
          name: "iracing-data-mcp",
          version: "0.0.0",
          live: true,
          ...healthDiagnostics({
            auth_state: options.services.authorizationState?.(),
          }),
        }),
      );
    }

    if (req.url !== "/mcp") {
      return reply(404, "Not found.");
    }

    if (!req.method || !["POST", "GET", "DELETE"].includes(req.method)) {
      return reply(405, "Method not allowed.");
    }

    if (
      options.sessionIdGenerator === undefined &&
      (req.method === "GET" || req.method === "DELETE")
    ) {
      return reply(405, "Method not allowed.");
    }

    const controller = new AbortController();

    const cancel = () => controller.abort();

    active.add(cancel);

    const disconnected = () => {
      if (!res.writableFinished) {
        cancel();
      }
    };

    res.on("close", disconnected);
    req.on("aborted", cancel);

    void (async () => {
      let resolved: ResolvedMcpRequest | undefined;

      try {
        resolved =
          req.method === "POST"
            ? await resolvePostRequest(
                req,
                res,
                controller,
                admission,
                reply,
                options,
                clock,
                logger,
                sessions,
              )
            : resolveSessionRequest(req, reply, sessions);

        if (!resolved) {
          return;
        }

        if (resolved.requestId !== undefined) {
          resolved.session.requests.set(resolved.requestId, {
            context,
            cancel,
            signal: controller.signal,
          });
        }

        await forwardMcpRequest(
          req,
          res,
          controller,
          resolved,
          logger,
          context,
        );
      } catch (error) {
        const oversized =
          error instanceof Error && error.name === "RequestBodyTooLargeError";

        logger.log("error", context, { status: oversized ? 413 : 500 });
        if (!res.headersSent && !res.destroyed) {
          reply(
            oversized ? 413 : 500,
            oversized ? "Request body too large." : "Request failed.",
          );
        }
      } finally {
        if (resolved?.requestId !== undefined) {
          resolved.session.requests.delete(resolved.requestId);
        }

        if (
          resolved &&
          (resolved.closeAfterRequest ||
            (resolved.session.stateful && resolved.session.id === undefined))
        ) {
          await closeMcpSession(resolved.session, sessions);
        }

        active.delete(cancel);
        res.off("close", disconnected);
        req.off("aborted", cancel);
      }
    })();
  });

  // Bound slow/incomplete HTTP bodies independently of tool execution.
  server.requestTimeout = transportLimits.toolMs;
  server.headersTimeout = transportLimits.toolMs;
  server.on("clientError", (_error, socket) =>
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n"),
  );

  return {
    server,
    get admittedTools() {
      return admission.admitted;
    },
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
