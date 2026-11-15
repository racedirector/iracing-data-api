const assert = require("node:assert/strict");
const http = require("node:http");
const { test } = require("node:test");

function request(
  port,
  { method = "GET", route = "/healthz", headers = {}, body } = {},
) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: route,
        method,
        headers: { Host: "127.0.0.1:3000", ...headers },
      },
      (res) => {
        const chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve(
            new Response(
              res.statusCode === 204 ? null : Buffer.concat(chunks),
              { status: res.statusCode, headers: res.headers },
            ),
          ),
        );
      },
    );

    req.on("error", reject);
    req.end(body);
  });
}

async function fixture(t) {
  const api = await import("../dist/index.js");
  const app = api.createMcpRuntime({
    config: api.parseRuntimeConfig({}),
    dependencies: {
      resolveActor: () => ({ id: "fixture", provider: "test" }),
      resolveDependencies: (actor) => ({
        driverQueries: {
          getCurrent: async () => ({
            cust_id: 7,
            display_name: actor.id,
            private: "SECRET",
          }),
        },
        recentRaceQueries: {
          getRecent: async () => ({ cust_id: 7, races: [] }),
        },
      }),
      authorizationState: () => "ready",
    },
  });

  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());

  return { app, port: app.server.address().port };
}

test("Hono serves a bounded host and minimal public health route", async (t) => {
  const { app, port } = await fixture(t);
  const health = await request(port);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { live: true, auth_state: "ready" });

  const forbidden = await request(port, { headers: { Host: "evil.example" } });
  assert.equal(forbidden.status, 403);
  const origin = await request(port, {
    headers: { Origin: "https://evil.example" },
  });
  assert.equal(origin.status, 403);

  assert.ok(app.app);
  assert.ok(app.server.listening);
});

test("official MCP client initializes, lists and calls both stateless tools", async (t) => {
  const { port } = await fixture(t);
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");

  const client = new Client({ name: "fixture", version: "1" });
  const transport = new StreamableHTTPClientTransport(
    new URL("http://127.0.0.1:3000/mcp"),
    {
      fetch: (_url, init) =>
        request(port, {
          method: init.method,
          route: "/mcp",
          body: init.body,
          headers: Object.fromEntries(new Headers(init.headers)),
        }),
    },
  );

  await client.connect(transport);
  t.after(() => client.close());

  assert.equal(transport.sessionId, undefined);
  assert.deepEqual(
    (await client.listTools()).tools.map((tool) => tool.name),
    ["get_my_driver", "get_recent_races"],
  );

  const driver = await client.callTool({
    name: "get_my_driver",
    arguments: {},
  });
  assert.deepEqual(driver.structuredContent, {
    cust_id: 7,
    display_name: "fixture",
  });
  assert.doesNotMatch(JSON.stringify(driver), /SECRET/);

  const recent = await client.callTool({
    name: "get_recent_races",
    arguments: { cust_id: 7, limit: 1 },
  });

  assert.equal(recent.structuredContent.cust_id, 7);
  assert.deepEqual(recent.structuredContent.races, []);
});

test("stateless MCP does not expose a session registry or DELETE lifecycle", async (t) => {
  const { port } = await fixture(t);
  for (const method of ["GET", "DELETE"]) {
    const response = await request(port, {
      method,
      route: "/mcp",
      headers: { Accept: "application/json, text/event-stream" },
    });

    assert.equal(response.status, 405);
  }
});

test("shutdown closes listener without requiring a process signal", async (t) => {
  const { app } = await fixture(t);
  assert.ok(app.server.listening);
  await app.shutdown();
  assert.equal(app.server.listening, false);
  await app.shutdown();
});
