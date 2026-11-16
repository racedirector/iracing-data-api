const assert = require("node:assert/strict");
const test = require("node:test");

test("mountable Hono router denies anonymous callers before constructing services", async () => {
  const { Hono } = await import("hono");
  const { createMcpRouter } = await import("../dist/http.js");
  let created = 0;
  const app = new Hono().route(
    "/mcp",
    createMcpRouter({
      resolveActor: () => null,
      resolveCapabilities: () => {
        created++;
        throw new Error("Must not resolve anonymous capabilities");
      },
    }),
  );

  const response = await app.request("http://localhost/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
  });

  assert.equal(response.status, 401);
  assert.equal(created, 0);
});

test("mountable Hono router resolves tool capabilities against the verified actor", async () => {
  const { Hono } = await import("hono");
  const { createMcpRouter } = await import("../dist/http.js");
  const actors = [];
  const app = new Hono().route(
    "/mcp",
    createMcpRouter({
      resolveActor: (request) => {
        const id = request.headers.get("x-test-actor");

        return id ? { id, provider: "test" } : null;
      },
      resolveCapabilities: (actor) => {
        actors.push(actor.id);

        return {
          driverQueries: {
            getCurrent: async () => ({
              cust_id: actor.id === "alice" ? 1 : 2,
              display_name: actor.id,
              secret: "MUST_NOT_LEAK",
            }),
          },
          recentRaceQueries: {
            getRecent: async () => ({ cust_id: 1, races: [] }),
          },
          raceSearchQueries: {
            search: async (_input, { signal }) => {
              assert.ok(signal instanceof AbortSignal);
              return {
                source: "hosted",
                criteria: { actor: actor.id },
                total_matches: 0,
                total_chunks: 0,
                chunk_index: 0,
                returned_count: 0,
                query_complete: true,
                results: [],
                position_basis: "upstream",
              };
            },
          },
        };
      },
    }),
  );

  for (const [id, expected] of [
    ["alice", 1],
    ["bob", 2],
  ]) {
    const response = await app.request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "x-test-actor": id,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "get_my_driver", arguments: {} },
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

    assert.match(body, new RegExp(id));
    assert.equal(payload.result.structuredContent.cust_id, expected);
    assert.equal(payload.result.structuredContent.display_name, id);
    assert.doesNotMatch(body, /MUST_NOT_LEAK/);
  }

  assert.deepEqual(actors, ["alice", "bob"]);
  const response = await app.request("http://localhost/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "x-test-actor": "bob",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "search_race_results",
        arguments: {
          source: "hosted",
          cust_id: 99,
          start_range_begin: "2026-11-01T00:00:00Z",
        },
      },
    }),
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /bob/);
  assert.deepEqual(actors, ["alice", "bob", "bob"]);
});

test("the HTTP router is owned by its host, not a listener or OAuth service", async () => {
  const { createMcpRouter } = await import("../dist/http.js");
  const router = createMcpRouter({
    resolveActor: () => null,
    resolveCapabilities: () => {
      throw new Error("unreachable");
    },
  });

  assert.equal(typeof router.fetch, "function");
  assert.equal(router.routes.length, 1);
});
