const assert = require("node:assert/strict");
const test = require("node:test");

async function fixture(t, services = {}) {
  const api = await import("../dist/index.js");
  const { McpServer, InMemoryTransport } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");

  const server = new McpServer({ name: "consumer", version: "1" });
  server.registerTool("before", {}, async () => ({
    content: [{ type: "text", text: "before" }],
  }));
  api.registerIracingTools(server, {
    getDriverQueries: () => ({
      getCurrent: async () => ({ cust_id: 1, display_name: "Fixture" }),
    }),
    getRecentRaceQueries: () => ({
      getRecent: async () => ({ cust_id: 1, races: [] }),
    }),
    ...services,
  });
  server.registerTool("after", {}, async () => ({
    content: [{ type: "text", text: "after" }],
  }));

  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "1" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  return {
    api,
    client,
    call: (name, args = {}) => client.callTool({ name, arguments: args }),
  };
}

test("caller-owned server exposes exactly two tools and accepts neighboring registrations", async (t) => {
  const f = await fixture(t);
  const tools = (await f.client.listTools()).tools;
  assert.deepEqual(
    tools.map((tool) => tool.name),
    ["before", "get_my_driver", "get_recent_races", "after"],
  );
  for (const tool of tools.slice(1, 3)) {
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.ok(tool.annotations.title.length > 0);
  }
  assert.equal(tools[1].annotations.title, "Get my driver");
  assert.equal(tools[2].annotations.title, "Get recent races");
  const properties = tools[2].inputSchema.properties;
  assert.match(properties.cust_id.description, /authenticated driver/);
  assert.match(properties.limit.description, /Defaults to 10/);
  assert.equal(properties.limit.default, 10);
  assert.equal((await f.call("before")).content[0].text, "before");
  assert.equal((await f.call("after")).content[0].text, "after");
  assert.equal(typeof f.api.createIracingMcpServer, "function");
});

test("input validation happens before resolving any dependencies", async (t) => {
  let selected = 0;
  const f = await fixture(t, {
    getDriverQueries: () => {
      selected++;
      return {};
    },
    getRecentRaceQueries: () => {
      selected++;
      return {};
    },
  });
  const cases = [
    ["get_my_driver", { token: "SECRET" }],
    ["get_my_driver", { cust_id: 1 }],
    ["get_recent_races", { cust_id: "1" }],
    ["get_recent_races", { cust_id: -1 }],
    ["get_recent_races", { limit: 11 }],
    ["get_recent_races", { limit: 0 }],
    ["get_recent_races", { access_token: "SECRET" }],
  ];
  for (const [name, args] of cases) {
    const result = await f.call(name, args);
    assert.equal(result.structuredContent.error.code, "INVALID_INPUT");
    assert.doesNotMatch(JSON.stringify(result), /SECRET|stack|cause/);
  }
  assert.equal(selected, 0);
});

test("custom driver and recent-race implementations are selected per request", async (t) => {
  const calls = [];
  const f = await fixture(t, {
    getDriverQueries: (context) => {
      assert.ok(context.signal instanceof AbortSignal);
      calls.push("driver-selected");
      return {
        getCurrent: async ({ signal }) => {
          assert.ok(signal instanceof AbortSignal);
          calls.push("driver-called");
          return {
            cust_id: 42,
            display_name: "Fixture Driver",
            secret: "SECRET",
          };
        },
      };
    },
    getRecentRaceQueries: (context) => {
      assert.ok(context.signal instanceof AbortSignal);
      calls.push("recent-selected");
      return {
        getRecent: async ({ custId, signal }) => {
          assert.ok(signal instanceof AbortSignal);
          assert.equal(custId, 42);
          calls.push("recent-called");
          return {
            cust_id: 42,
            races: [
              {
                subsession_id: 100,
                series_name: "Series",
                points: 3,
                private: "SECRET",
              },
              { subsession_id: 101 },
            ],
          };
        },
      };
    },
  });
  const driver = await f.call("get_my_driver");
  assert.deepEqual(driver.structuredContent, {
    cust_id: 42,
    display_name: "Fixture Driver",
  });
  const recent = await f.call("get_recent_races", { cust_id: 42, limit: 1 });
  assert.equal(recent.structuredContent.races.length, 1);
  assert.equal(recent.structuredContent.races[0].subsession_id, 100);
  assert.equal(recent.structuredContent.returned_count, 1);
  assert.equal(recent.structuredContent.complete, false);
  assert.equal(recent.structuredContent.position_basis, "upstream");
  assert.deepEqual(calls, [
    "driver-selected",
    "driver-called",
    "recent-selected",
    "recent-called",
  ]);
  for (const result of [driver, recent]) {
    assert.equal(
      result.content[0].text,
      JSON.stringify(result.structuredContent),
    );
    assert.doesNotMatch(JSON.stringify(result), /SECRET|private/);
  }
});

test("missing selectors fail before publishing either tool", async () => {
  const { registerIracingTools } = await import("../dist/index.js");
  for (const services of [
    {},
    { getDriverQueries() {} },
    { getRecentRaceQueries() {} },
  ]) {
    let registered = 0;
    assert.throws(
      () =>
        registerIracingTools(
          {
            registerTool() {
              registered++;
            },
          },
          services,
        ),
      /Both iRacing capability selectors are required/,
    );
    assert.equal(registered, 0);
  }
});

test("short upstream windows are complete only relative to that window", async (t) => {
  const f = await fixture(t);
  assert.equal(
    (await f.call("get_recent_races")).structuredContent.complete,
    true,
  );
});

test("mismatched identity and malformed results are sanitized", async (t) => {
  const invalid = await fixture(t, {
    getDriverQueries: () => ({
      getCurrent: async () => ({ cust_id: "SECRET", display_name: "Name" }),
    }),
    getRecentRaceQueries: () => ({
      getRecent: async () => ({ cust_id: 1, races: [] }),
    }),
  });
  assert.equal(
    (await invalid.call("get_my_driver")).structuredContent.error.code,
    "DATA_RESOLUTION_FAILED",
  );
  assert.equal(
    (await invalid.call("get_recent_races", { cust_id: 2 })).structuredContent
      .error.code,
    "DATA_RESOLUTION_FAILED",
  );
});

test("the 64 KiB result cap rejects oversized injected data", async (t) => {
  const f = await fixture(t, {
    getDriverQueries: () => ({
      getCurrent: async () => ({
        cust_id: 1,
        display_name: "x".repeat(40000),
      }),
    }),
  });
  assert.equal(
    (await f.call("get_my_driver")).structuredContent.error.code,
    "RESPONSE_LIMIT_EXCEEDED",
  );
});

test("cancellation during capability selection prevents either domain query", async () => {
  const { registerIracingTools } = await import("../dist/index.js");
  for (const name of ["get_my_driver", "get_recent_races"]) {
    const selected = Promise.withResolvers();
    const release = Promise.withResolvers();
    const control = new AbortController();
    const callbacks = new Map();
    let queried = 0;
    const queries = {
      getCurrent: async () => {
        queried++;
        return { cust_id: 1, display_name: "Fixture" };
      },
      getRecent: async () => {
        queried++;
        return { cust_id: 1, races: [] };
      },
    };
    const select = async (context) => {
      assert.equal(context.signal, control.signal);
      assert.ok(context.request.request_id);
      selected.resolve();
      await release.promise;
      return queries;
    };
    registerIracingTools(
      {
        registerTool(toolName, _config, callback) {
          callbacks.set(toolName, callback);
        },
      },
      { getDriverQueries: select, getRecentRaceQueries: select },
    );
    const pending = callbacks.get(name)(
      {},
      { mcpReq: { signal: control.signal } },
    );
    const rejected = assert.rejects(pending, {
      name: "AbortError",
      message: "Request cancelled.",
    });
    await selected.promise;
    control.abort("TOKEN_SECRET");
    release.resolve();
    await rejected;
    assert.equal(queried, 0);
  }
});
