const assert = require("node:assert/strict");
const test = require("node:test");

function factories(calls) {
  return {
    driverQueries: () => {
      calls.push("driver");
      return {
        getCurrent: async () => ({ cust_id: 1, display_name: "Fixture" }),
      };
    },
    recentRaceQueries: () => {
      calls.push("recent");
      return { getRecent: async () => ({ cust_id: 1, races: [] }) };
    },
    raceSearchQueries: () => {
      calls.push("search");
      return { search: async () => ({}) };
    },
  };
}

test("query getters construct only the selected adapter, once per owner", async () => {
  const { McpServices, createMcpServices } = await import("../dist/index.js");
  const calls = [];
  const owner = new McpServices(factories(calls));
  const services = createMcpServices(owner);
  const context = { signal: new AbortController().signal };
  assert.deepEqual(calls, []);

  const drivers = await Promise.all(
    Array.from({ length: 8 }, () => services.getDriverQueries(context)),
  );
  assert.ok(drivers.every((driver) => driver === owner.driverQueries));
  assert.deepEqual(calls, ["driver"]);

  const recent = await services.getRecentRaceQueries(context);
  assert.equal(recent, await services.getRecentRaceQueries(context));
  assert.deepEqual(calls, ["driver", "recent"]);

  const search = await services.getRaceSearchQueries(context);
  assert.equal(search, await services.getRaceSearchQueries(context));
  assert.deepEqual(calls, ["driver", "recent", "search"]);

  const other = new McpServices(factories(calls));
  assert.notEqual(other.driverQueries, owner.driverQueries);
  assert.notEqual(other.recentRaceQueries, recent);
  assert.notEqual(other.raceSearchQueries, search);
});

test("pre-cancelled selection never constructs an adapter", async () => {
  const { McpServices, createMcpServices } = await import("../dist/index.js");
  const calls = [];
  const services = createMcpServices(new McpServices(factories(calls)));
  const context = { signal: AbortSignal.abort() };
  for (const select of [
    services.getDriverQueries,
    services.getRecentRaceQueries,
    services.getRaceSearchQueries,
  ]) {
    await assert.rejects(select(context), { name: "AbortError" });
  }
  assert.deepEqual(calls, []);
});

test("failed construction does not publish a cached adapter", async () => {
  const { McpServices } = await import("../dist/index.js");
  let attempts = 0;
  const expected = { getCurrent: async () => ({ cust_id: 1 }) };
  const owner = new McpServices({
    ...factories([]),
    driverQueries: () => {
      if (++attempts === 1) throw new Error("Construction failed");
      return expected;
    },
  });
  assert.throws(() => owner.driverQueries, /Construction failed/);
  assert.equal(owner.driverQueries, expected);
  assert.equal(owner.driverQueries, expected);
  assert.equal(attempts, 2);
});

test("request-local resolvers are not cached across requests", async () => {
  const { createMcpServices } = await import("../dist/index.js");
  const selected = [];
  const services = createMcpServices((context) => {
    selected.push(context);
    return {
      driverQueries: { getCurrent: async () => ({ cust_id: selected.length }) },
    };
  });
  const first = { signal: new AbortController().signal };
  const second = { signal: new AbortController().signal };
  assert.notEqual(
    await services.getDriverQueries(first),
    await services.getDriverQueries(second),
  );
  assert.deepEqual(selected, [first, second]);
});

test("HTTP requests reuse owner adapters without constructing them for tools/list", async () => {
  const { McpServices, createMcpServices, createHttpTransport } =
    await import("./fixtures/runtime.mjs");
  const calls = [];
  const handler = createHttpTransport({
    services: createMcpServices(new McpServices(factories(calls))),
    serveOptions: {},
  });
  try {
    for (const message of [
      { method: "tools/list" },
      {
        method: "tools/call",
        params: { name: "get_my_driver", arguments: {} },
      },
      {
        method: "tools/call",
        params: { name: "get_my_driver", arguments: {} },
      },
    ]) {
      const response = await handler.fetch(
        new Request("http://localhost/any-path", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json, text/event-stream",
          },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, ...message }),
        }),
      );
      assert.equal(response.status, 200);
      assert.doesNotMatch(await response.text(), /"isError":true/);
      assert.deepEqual(
        calls,
        message.method === "tools/list" ? [] : ["driver"],
      );
    }
  } finally {
    await handler.close();
  }
});
