const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

test("injected account-scoped token providers remain isolated and resolve on demand", async (t) => {
  const { createFetchQueries, composeMcpServices } =
    await import("../dist/index.js");
  const calls = [];
  const authorizations = [];
  const tokens = new Map([
    ["alice", "alice-first"],
    ["bob", "bob-first"],
  ]);
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    if (url.hostname === "members-ng.iracing.com") {
      const token = new Headers(init.headers).get("authorization");
      authorizations.push(token);
      return Response.json({
        link: `https://cache.example.test/${token.endsWith("bob-first") ? "bob" : "alice"}`,
        expires: new Date(Date.now() + 60000).toISOString(),
      });
    }
    return Response.json({
      cust_id: url.pathname === "/bob" ? 2 : 1,
      display_name: url.pathname.slice(1),
    });
  };
  const owners = new Map();
  const resolveCapabilities = (actor) => {
    if (owners.has(actor.id)) return owners.get(actor.id);
    const queries = createFetchQueries(async () => {
      calls.push(actor.id);
      assert.ok(tokens.has(actor.id), "Only linked accounts may supply tokens");
      return tokens.get(actor.id);
    });
    owners.set(actor.id, queries);
    return queries;
  };
  const context = { signal: new AbortController().signal };
  const alice = composeMcpServices(
    { id: "alice", provider: "fixture" },
    resolveCapabilities,
  );
  const bob = composeMcpServices(
    { id: "bob", provider: "fixture" },
    resolveCapabilities,
  );
  const [aliceQueries, bobQueries] = await Promise.all([
    alice.getDriverQueries(context),
    bob.getDriverQueries(context),
  ]);
  assert.deepEqual(calls, []);
  assert.equal(await alice.getDriverQueries(context), aliceQueries);
  assert.equal(await bob.getDriverQueries(context), bobQueries);
  assert.notEqual(aliceQueries, bobQueries);
  const [a, b] = await Promise.all([
    aliceQueries.getCurrent(context),
    bobQueries.getCurrent(context),
  ]);
  assert.equal(a.cust_id, 1);
  assert.equal(b.cust_id, 2);
  tokens.set("alice", "alice-second");
  await aliceQueries.getCurrent(context);
  assert.deepEqual(calls, ["alice", "bob", "alice"]);
  assert.deepEqual(authorizations, [
    "Bearer alice-first",
    "Bearer bob-first",
    "Bearer alice-second",
  ]);
});

test("switching an injected token strategy applies equally to stdio and HTTP", async (t) => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const { createMcpRouter } = await import("../dist/cli/router.js");
  const { createMcpServices } = await import("../dist/index.js");
  const { fixtureFetch, resolveLinkedCapabilities } =
    await import("./fixtures/linked-account.mjs");
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = fixtureFetch;
  for (const [strategy, expected] of [
    ["primary", 1],
    ["alternate", 2],
  ]) {
    const client = new Client({ name: "strategy-test", version: "1" });
    const env = { ...process.env, MCP_TEST_STRATEGY: strategy };
    delete env.IRACING_AUTH_CLIENT;
    delete env.IRACING_AUTH_SECRET;
    env.IRACING_CREDENTIALS = "/must-not-read-local-credentials.json";
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.resolve(__dirname, "fixtures/linked-stdio.mjs")],
      env,
    });
    const router = createMcpRouter({
      services: createMcpServices(
        resolveLinkedCapabilities(strategy)({
          id: "linked-user",
          provider: "fixture",
        }),
      ),
    });
    try {
      await client.connect(transport);
      const stdio = await client.callTool({
        name: "get_my_driver",
        arguments: {},
      });
      const response = await router.request("http://localhost/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: { name: "get_my_driver", arguments: {} },
        }),
      });
      assert.equal(response.status, 200);
      const text = await response.text();
      const http = JSON.parse(
        response.headers.get("content-type").includes("text/event-stream")
          ? text
              .split("\n")
              .find((line) => line.startsWith("data:"))
              .slice(5)
          : text,
      ).result;
      assert.equal(stdio.structuredContent.cust_id, expected);
      assert.deepEqual(http.structuredContent, stdio.structuredContent);
    } finally {
      await client.close();
    }
  }
});
