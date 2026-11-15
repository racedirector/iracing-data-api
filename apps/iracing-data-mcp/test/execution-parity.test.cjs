const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

async function httpCall(router, name, args, modern = false) {
  const response = await router.request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(modern
        ? {
            "mcp-protocol-version": "2026-07-28",
            "mcp-method": "tools/call",
            "mcp-name": name,
          }
        : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name,
        arguments: args,
        ...(modern
          ? {
              _meta: {
                "io.modelcontextprotocol/protocolVersion": "2026-07-28",
                "io.modelcontextprotocol/clientInfo": {
                  name: "parity-client",
                  version: "1",
                },
                "io.modelcontextprotocol/clientCapabilities": {},
              },
            }
          : {}),
      },
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.text();
  const payload = response.headers
    .get("content-type")
    ?.includes("text/event-stream")
    ? JSON.parse(
        body
          .split("\n")
          .find((line) => line.startsWith("data:"))
          .slice(5),
      )
    : JSON.parse(body);
  assert.equal(payload.error, undefined);
  return payload.result;
}

function applicationResult(result) {
  assert.equal(
    result.content[0].text,
    JSON.stringify(result.structuredContent),
  );
  assert.doesNotMatch(
    JSON.stringify(result),
    /TOKEN_SECRET|signature=|stack|cause/,
  );
  if (result.isError) {
    const { request_id, ...error } = result.structuredContent.error;
    assert.match(request_id, /^[\da-f-]{36}$/);
    return { isError: true, error };
  }
  return result.structuredContent;
}

test(
  "stdio and both HTTP eras preserve application results and safe failures",
  { timeout: 15000 },
  async () => {
    const { Client } = await import("@modelcontextprotocol/client");
    const { StdioClientTransport } =
      await import("@modelcontextprotocol/client/stdio");
    const { createMcpRouter } = await import("../dist/http.js");
    const { capabilities } = await import("./fixtures/capabilities.mjs");
    for (const [mode, name, args, code] of [
      ["success", "get_my_driver", {}, undefined],
      ["success", "get_recent_races", {}, undefined],
      ["success", "get_my_driver", { token: "TOKEN_SECRET" }, "INVALID_INPUT"],
      ["success", "get_recent_races", { cust_id: 9 }, "DATA_RESOLUTION_FAILED"],
      ["invalid-output", "get_my_driver", {}, "DATA_RESOLUTION_FAILED"],
      ["unexpected", "get_my_driver", {}, "INTERNAL_ERROR"],
      ["authorization", "get_my_driver", {}, "AUTHORIZATION_REQUIRED"],
    ]) {
      const client = new Client({ name: "parity-client", version: "1" });
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [path.resolve(__dirname, "fixtures/stdio.mjs")],
        env: { ...process.env, MCP_TEST_MODE: mode },
      });
      const router = createMcpRouter({
        resolveActor: () => ({ id: "fixture", provider: "test" }),
        resolveCapabilities: () => capabilities(mode),
      });
      try {
        await client.connect(transport);
        const stdio = await client.callTool({ name, arguments: args });
        assert.equal(stdio.structuredContent.error?.code, code);
        for (const modern of [false, true]) {
          const http = await httpCall(router, name, args, modern);
          assert.deepEqual(applicationResult(http), applicationResult(stdio));
        }
      } finally {
        await client.close();
      }
    }
  },
);

test("concurrent HTTP actors retain request-local capabilities and correlation", async () => {
  const { createMcpRouter } = await import("../dist/http.js");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  const requests = [];
  let actor = 0;
  const router = createMcpRouter({
    resolveActor: () => ({ id: String(++actor), provider: "test" }),
    resolveCapabilities: async (verified, context) => {
      requests.push(context.request);
      await Promise.resolve();
      return capabilities("success", Number(verified.id));
    },
  });
  const results = await Promise.all(
    Array.from({ length: 8 }, () => httpCall(router, "get_my_driver", {})),
  );
  assert.deepEqual(
    results.map((result) => result.structuredContent.cust_id).sort(),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.equal(new Set(requests.map((request) => request.request_id)).size, 8);
});

test(
  "HTTP disconnect cancels the selected capability before held work is released",
  { timeout: 5000 },
  async (t) => {
    const { once } = require("node:events");
    const { request } = require("node:http");
    const { startMcpHttpServer } = await import("../dist/http-server.js");
    const entered = Promise.withResolvers();
    const aborted = Promise.withResolvers();
    const release = Promise.withResolvers();
    const server = startMcpHttpServer({
      config: { host: "127.0.0.1", port: 0 },
      resolveActor: () => ({ id: "fixture", provider: "test" }),
      resolveCapabilities: () => ({
        driverQueries: {
          getCurrent: async ({ signal }) => {
            signal.addEventListener("abort", () => aborted.resolve(), {
              once: true,
            });
            entered.resolve();
            await release.promise;
            return { cust_id: 7, display_name: "Fixture" };
          },
        },
        recentRaceQueries: {
          getRecent: async () => ({ cust_id: 7, races: [] }),
        },
      }),
    });
    t.after(async () => {
      release.resolve();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    });
    if (!server.listening) {
      await once(server, "listening");
    }
    const pending = request(`http://127.0.0.1:${server.address().port}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
    });
    const disconnected = once(pending, "error");
    pending.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "get_my_driver", arguments: {} },
      }),
    );
    await entered.promise;
    pending.destroy(new Error("Synthetic disconnect"));
    await disconnected;
    await aborted.promise;
    release.resolve();
  },
);
