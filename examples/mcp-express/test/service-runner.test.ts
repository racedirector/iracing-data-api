import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { createNoopLogger } from "../src/logger";
import { createServiceRunner } from "../src/service-runner";
import { configureExpressTransport } from "../src/transports/express";
import { configureHttpTransport } from "../src/transports/http";
import { startHttpListener } from "../src/transports/http-listener";
import type { ProcessLifecycle } from "../src/transports/transport";
import type {
  McpRequestContext,
  McpServerFactory,
} from "@modelcontextprotocol/server";

/** Exercise signal ownership without adding listeners to the test process itself. */
function lifecycle() {
  return Object.assign(new EventEmitter(), {
    exitCode: undefined as number | undefined,
  }) as EventEmitter & ProcessLifecycle;
}

test("runner composes once and passes the exact context-aware factory to its transport", async () => {
  const context: McpRequestContext = { era: "modern" };
  const server = new McpServer({ name: "test", version: "1" });
  const composedFactory: McpServerFactory = async (receivedContext) => {
    assert.equal(receivedContext, context);

    return server;
  };
  let compositions = 0;
  const configuration = {};
  const run = createServiceRunner({
    logger: createNoopLogger(),
    lifecycle: lifecycle(),
    composeServer: (receivedConfiguration) => {
      assert.equal(receivedConfiguration, configuration);
      compositions++;

      return composedFactory;
    },
  });
  const handle = await run({
    name: "test",
    configuration,
    transport: async ({ createServer }) => {
      assert.equal(createServer, composedFactory);
      assert.equal(await createServer(context), server);

      return { close: () => server.close() };
    },
  });

  assert.equal(compositions, 1);
  await handle.close();
});

test("MCP HTTP handler forwards supplied auth info to the server factory", async () => {
  const authInfo = { token: "synthetic-token", clientId: "test", scopes: [] };
  let receivedContext: McpRequestContext | undefined;
  const handler = createMcpHandler((context) => {
    receivedContext = context;

    return new McpServer({ name: "test", version: "1" });
  });
  const request = new Request("http://localhost/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1" },
      },
    }),
  });

  try {
    const response = await handler.fetch(request, { authInfo });
    const body = await response.text();

    assert.equal(response.status, 200, body);
    assert.equal(receivedContext?.era, "legacy");
    assert.equal(receivedContext?.authInfo, authInfo);
    assert.equal(receivedContext?.requestInfo?.url, request.url);
    assert.match(body, /"serverInfo"/);
  } finally {
    await handler.close();
  }
});

test("runner shares a child logger and closes once across signals and explicit shutdown", async () => {
  const process = lifecycle();

  const child = createNoopLogger();

  const logger = { ...createNoopLogger(), child: () => child };

  let closed = 0;

  const run = createServiceRunner({
    logger,
    lifecycle: process,
    composeServer: (_config: object, context) => {
      assert.equal(context.logger, child);

      return () => new McpServer({ name: "test", version: "1" });
    },
  });

  const handle = await run({
    name: "test",
    configuration: {},
    transport: ({ logger: supplied }) => {
      assert.equal(supplied, child);

      return {
        close: async () => {
          closed++;
        },
      };
    },
  });

  assert.equal(process.listenerCount("SIGTERM"), 1);

  // Interleave signal-driven and explicit shutdown to exercise the shared close.
  process.emit("SIGTERM", "SIGTERM");
  process.emit("SIGINT", "SIGINT");
  await Promise.all([handle.close(), handle.close()]);

  assert.equal(closed, 1);
  assert.equal(process.listenerCount("SIGTERM"), 0);
  assert.equal(process.listenerCount("SIGINT"), 0);
});

test("failed startup installs no handlers; failed close removes them and sets signal exit status", async () => {
  const process = lifecycle();

  const run = createServiceRunner({
    logger: createNoopLogger(),
    lifecycle: process,
    composeServer: () => () => new McpServer({ name: "test", version: "1" }),
  });

  await assert.rejects(
    run({
      name: "test",
      configuration: {},
      transport: async () => {
        throw new Error("bind failed");
      },
    }),
    /bind failed/,
  );
  assert.equal(process.listenerCount("SIGINT"), 0);
  const handle = await run({
    name: "test",
    configuration: {},
    transport: () => ({
      close: async () => {
        throw new Error("close failed");
      },
    }),
  });

  process.emit("SIGTERM", "SIGTERM");
  await assert.rejects(handle.close(), /close failed/);

  // The signal handler reports its failure after the shared close promise rejects.
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(process.exitCode, 1);
  assert.equal(process.listenerCount("SIGTERM"), 0);
});

test("HTTP listener readiness and bind failure cleanup", async () => {
  const server = createServer((_req, res) => res.end("ready"));

  let closed = 0;

  const handle = await startHttpListener(
    server,
    {
      close: () => {
        closed++;
      },
    },
    { host: "127.0.0.1", port: 0 },
  );

  const address = server.address();

  assert.ok(address && typeof address !== "string");
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}`);

    const body = await response.text();

    assert.equal(body, "ready");

    // A second listener on the occupied port must release its MCP handler.
    let failedClosed = 0;

    await assert.rejects(
      startHttpListener(
        createServer(),
        {
          close: () => {
            failedClosed++;
          },
        },
        { host: "127.0.0.1", port: address.port },
      ),
      { code: "EADDRINUSE" },
    );
    assert.equal(failedClosed, 1);
  } finally {
    await Promise.all([handle.close(), handle.close()]);
  }

  assert.equal(closed, 1);
});

test("both configured HTTP transports reject an occupied listener", async () => {
  const blocker = createServer().listen(0, "127.0.0.1");

  await once(blocker, "listening");
  const address = blocker.address();

  assert.ok(address && typeof address !== "string");
  try {
    for (const transport of [
      configureHttpTransport({ host: "127.0.0.1", port: address.port }),
      configureExpressTransport({
        host: "127.0.0.1",
        port: address.port,
        path: "/mcp",
      }),
    ]) {
      await assert.rejects(
        Promise.resolve().then(() =>
          transport({
            logger: createNoopLogger(),
            createServer: () => new McpServer({ name: "test", version: "1" }),
          }),
        ),
        { code: "EADDRINUSE" },
      );
    }
  } finally {
    await new Promise<void>((resolve) => blocker.close(() => resolve()));
  }
});
