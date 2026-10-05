import { createServer } from "node:http";
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
  /** Stable application identity advertised by request-scoped MCP servers. */
  readonly config: McpApplicationConfig;
  /** Long-lived OAuth and Data API dependencies shared across requests. */
  readonly services: McpServices;
  /** Optional registrar used by tests or later slices to add tools. */
  readonly registerTools?: McpToolRegistrar;
  /** Sanitizing logger used for transport and tool diagnostics. */
  readonly logger?: ReturnType<typeof createDiagnosticLogger>;
  /** Deterministic lifecycle clock seam; production uses real timers. */
  readonly schedule?: Schedule;
}

/**
 * Creates the process-scoped HTTP application serving health and MCP endpoints.
 *
 * The returned application owns shared admission/shutdown state while every MCP POST creates
 * a fresh SDK server and transport. Host/origin validation, body limits, cancellation, tool
 * admission, and bounded shutdown are enforced before request work can escape this boundary.
 */
export function createHttpApplication(options: HttpApplicationOptions) {
  const logger = options.logger ?? createDiagnosticLogger();
  const clock = options.schedule ?? schedule;
  const active = new Set<() => void>();
  let admitted = 0;
  let stopping = false;
  let shutdownPromise: Promise<void> | undefined;
  const server = createServer((req, res) => {
    const context = createRequestContext();
    res.once("finish", () => {
      if (stopping) server.closeIdleConnections();
    });
    const reply = (status: number, message: string) => {
      logger.log("info", context, { status });
      res.writeHead(status, {
        "Content-Type": "text/plain",
        Connection: "close",
        ...(status === 405
          ? { Allow: req.url === "/healthz" ? "GET" : "POST" }
          : {}),
      });
      res.end(message);
    };
    const hostCount = req.rawHeaders.filter(
      (header, index) => index % 2 === 0 && header.toLowerCase() === "host",
    ).length;
    if (
      hostCount !== 1 ||
      !["127.0.0.1:3000", "localhost:3000"].includes(req.headers.host ?? "")
    )
      return reply(403, "Host rejected.");
    if (
      req.headers.origin !== undefined &&
      !["http://127.0.0.1:3000", "http://localhost:3000"].includes(
        req.headers.origin,
      )
    )
      return reply(403, "Origin rejected.");
    if (stopping) return reply(503, "Server is shutting down.");
    if (req.url === "/healthz") {
      if (req.method !== "GET") return reply(405, "Method not allowed.");
      res.writeHead(200, { "Content-Type": "application/json" });
      // No durable auth source exists until #352. Fixed app identity avoids raw config.
      return res.end(
        JSON.stringify({
          name: "iracing-data-mcp",
          version: "0.0.0",
          live: true,
          ...healthDiagnostics(undefined),
        }),
      );
    }
    if (req.url !== "/mcp") return reply(404, "Not found.");
    if (req.method !== "POST") return reply(405, "Method not allowed.");
    const controller = new AbortController();
    const cancel = () => controller.abort();
    active.add(cancel);
    const disconnected = () => {
      if (!res.writableFinished) cancel();
    };
    res.on("close", disconnected);
    req.on("aborted", cancel);
    void (async () => {
      let mcp: ReturnType<typeof createMcpServer> | undefined;
      let release = () => {};
      try {
        // Bound uploads before parsing or SDK construction; pause oversize input so
        // the fixed 413 response can be flushed before closing the connection.
        const text = await new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          let bytes = 0;
          const cleanup = () => {
            req.off("data", data);
            req.off("end", end);
            req.off("error", fail);
            controller.signal.removeEventListener("abort", abort);
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
            } else chunks.push(chunk);
          };
          req.on("data", data);
          req.once("end", end);
          req.once("error", fail);
          controller.signal.addEventListener("abort", abort, { once: true });
          if (controller.signal.aborted) abort();
        });
        if (controller.signal.aborted || stopping) {
          if (!res.destroyed) reply(503, "Server is shutting down.");
          return;
        }
        let body: unknown;
        try {
          body = JSON.parse(text);
        } catch {
          reply(400, "Invalid JSON.");
          return;
        }
        if (Array.isArray(body)) {
          reply(400, "Batch requests are unsupported.");
          return;
        }
        mcp = createMcpServer({
          ...options,
          registerTools: options.registerTools,
        });
        const transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
          maxRequestBodySize: transportLimits.bodyBytes,
        });
        mcp.server.onerror = (error) => logger.failure(context, error);
        await mcp.connect(transport);
        const send = transport.send.bind(transport);
        let toolId: string | number | undefined;
        let settled = false;
        const failure = (code: "INTERNAL_ERROR" | "RATE_LIMITED") => {
          const error = new ApplicationFailure(code);
          logger.failure(context, error, {
            operation: "tool_call",
            stage: "failed",
          });
          return toolError(error, context);
        };
        transport.send = async (message, extra) => {
          let safe: JSONRPCMessage = message;
          if ("error" in message) {
            release();
            safe = {
              ...message,
              error: {
                code: message.error.code,
                message: "Protocol request rejected.",
              },
            };
          }
          if ("result" in message && message.id === toolId) {
            if (settled) return;
            settled = true;
            const result = message.result;
            if (result.isError) {
              const parsed = ErrorEnvelopeSchema.safeParse(
                result.structuredContent,
              );
              safe = {
                ...message,
                result: parsed.success
                  ? toolError(
                      new ApplicationFailure(
                        parsed.data.error.code,
                        parsed.data.error,
                      ),
                      context,
                    )
                  : failure("INTERNAL_ERROR"),
              };
            }
            release();
          }
          await send(safe, extra);
        };
        const receive = transport.onmessage!;
        transport.onmessage = (message, extra) => {
          if (
            "method" in message &&
            "id" in message &&
            message.method === "tools/call"
          ) {
            toolId = message.id;
            if (stopping || admitted >= transportLimits.admittedTools) {
              void transport
                .send({
                  jsonrpc: "2.0",
                  id: message.id,
                  result: failure("RATE_LIMITED"),
                })
                .catch((error) => logger.failure(context, error));
              return;
            }
            admitted++;
            let released = false;
            const clear = clock(() => {
              void transport
                .send({
                  jsonrpc: "2.0",
                  id: message.id,
                  result: failure("INTERNAL_ERROR"),
                })
                .finally(cancel)
                .catch((error) => logger.failure(context, error));
            }, transportLimits.toolMs);
            release = () => {
              if (!released) {
                released = true;
                admitted--;
                clear();
              }
            };
          }
          receive(message, extra);
        };
        controller.signal.addEventListener(
          "abort",
          () => {
            release();
            logger.failure(context, new ApplicationFailure("INTERNAL_ERROR"), {
              operation: "tool_call",
              stage: "failed",
            });
            void mcp?.close();
          },
          { once: true },
        );
        if (controller.signal.aborted) {
          await mcp.close();
          return;
        }
        await Promise.race([
          toNodeHandler(
            {
              fetch: async (request) => {
                const response = await transport.handleRequest(request, {
                  parsedBody: body,
                });
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
          )(req, res, body),
          new Promise<void>((resolve) => {
            controller.signal.addEventListener("abort", () => resolve(), {
              once: true,
            });
          }),
        ]);
      } catch (error) {
        const oversized =
          error instanceof Error && error.name === "RequestBodyTooLargeError";
        logger.log("error", context, { status: oversized ? 413 : 500 });
        if (!res.headersSent && !res.destroyed)
          reply(
            oversized ? 413 : 500,
            oversized ? "Request body too large." : "Request failed.",
          );
      } finally {
        release();
        await mcp?.close();
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
      return admitted;
    },
    get stopping() {
      return stopping;
    },
    listen(port = 3000, host = "0.0.0.0") {
      return new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => {
          server.off("error", reject);
          resolve();
        });
      });
    },
    shutdown() {
      if (shutdownPromise) return shutdownPromise;
      stopping = true;
      shutdownPromise = new Promise<void>((resolve) => {
        const clear = clock(() => {
          for (const abort of active) abort();
          server.closeAllConnections();
        }, transportLimits.drainMs);
        server.close(() => {
          clear();
          resolve();
        });
        server.closeIdleConnections();
      });
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
) {
  const terminate = () => {
    void app.shutdown();
  };
  process.on("SIGTERM", terminate);
  process.on("SIGINT", terminate);
  return () => {
    process.off("SIGTERM", terminate);
    process.off("SIGINT", terminate);
  };
}
