const assert = require("node:assert/strict");
const test = require("node:test");

test("static refresh is optional, lazy and uses the shared validation boundary", async (t) => {
  const plain = await fixture(t);
  assert.equal(
    (await plain.client.listTools()).tools.some(
      (tool) => tool.name === "refresh_static_cache",
    ),
    false,
  );
  let selections = 0;
  const calls = [];
  const configured = await fixture(t, {
    getStaticCacheRefresh(context) {
      selections++;
      return {
        async refresh(dataset, options) {
          assert.equal(options.signal, context.signal);
          calls.push(dataset);
          return dataset === "tracks" ? null : 2;
        },
      };
    },
  });
  await configured.client.listTools();
  assert.equal(selections, 0);
  const invalid = await configured.call("refresh_static_cache", {
    dataset: "all",
  });
  assert.equal(invalid.structuredContent.error.code, "INVALID_INPUT");
  assert.equal(selections, 0);
  const result = await configured.call("refresh_static_cache", {
    dataset: "car-assets",
  });
  assert.deepEqual(result.structuredContent, {
    dataset: "car-assets",
    resource_uri: "iracing://assets/cars",
    count: 2,
  });
  assert.deepEqual(calls, ["car-assets"]);
  const missing = await configured.call("refresh_static_cache", {
    dataset: "tracks",
  });
  assert.equal(missing.structuredContent.error.code, "NOT_FOUND");
});

test("static refresh rejects malformed capabilities and replacement counts safely", async (t) => {
  for (const capability of [
    {},
    { refresh: async () => -1 },
    { refresh: async () => "SECRET" },
    {
      refresh: async () => {
        throw new Error("SECRET");
      },
    },
  ]) {
    const configured = await fixture(t, {
      getStaticCacheRefresh: () => capability,
    });
    const result = await configured.call("refresh_static_cache", {
      dataset: "cars",
    });
    assert.equal(result.isError, true);
    assert.equal(JSON.stringify(result).includes("SECRET"), false);
  }
});

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
    getRaceSearchQueries: () => ({
      search: async () => ({
        source: "hosted",
        criteria: {},
        total_matches: 0,
        total_chunks: 0,
        chunk_index: 0,
        returned_count: 0,
        query_complete: true,
        results: [],
        position_basis: "upstream",
      }),
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

test("caller-owned server exposes explicit tools and accepts neighboring registrations", async (t) => {
  const f = await fixture(t);
  const tools = (await f.client.listTools()).tools;
  assert.deepEqual(
    tools.map((tool) => tool.name),
    [
      "before",
      "get_my_driver",
      "get_recent_races",
      "search_race_results",
      "after",
    ],
  );
  for (const tool of tools.slice(1, 4)) {
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

test("optional reference lookup uses the same strict, bounded caller-owned tool boundary", async (t) => {
  let selected = 0;
  const f = await fixture(t, {
    getReferenceQueries: () => {
      selected++;
      return {
        list: async () => ({
          entries: [{ id: 120, name: "Example Series", secret: "SECRET" }],
          metadata_available: false,
          assets_available: false,
        }),
      };
    },
  });
  const tool = (await f.client.listTools()).tools.find(
    (entry) => entry.name === "find_reference",
  );
  assert.equal(tool.inputSchema.type, "object");
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.equal(selected, 0);
  const invalid = await f.call("find_reference", {
    kind: "series",
    query: "120",
    credentials: "SECRET",
  });
  assert.equal(invalid.structuredContent.error.code, "INVALID_INPUT");
  assert.equal(selected, 0);
  const result = await f.call("find_reference", {
    kind: "series",
    query: "120",
  });
  assert.deepEqual(result.structuredContent.matches, [
    { id: 120, name: "Example Series" },
  ]);
  assert.deepEqual(
    JSON.parse(result.content[0].text),
    result.structuredContent,
  );
  assert.doesNotMatch(JSON.stringify(result), /SECRET/);
});

test("historical search selects per request, forwards criteria and projects output", async (t) => {
  let selected = 0;
  const f = await fixture(t, {
    getRaceSearchQueries: () => {
      selected++;
      return {
        search: async (input, { signal }) => {
          assert.ok(signal instanceof AbortSignal);
          assert.equal(input.cust_id, 99);
          assert.equal(input.league_id, 8579);
          return {
            source: "hosted",
            criteria: { cust_id: 99, league_id: 8579 },
            total_matches: 0,
            total_chunks: 0,
            chunk_index: 0,
            returned_count: 0,
            query_complete: true,
            results: [],
            position_basis: "upstream",
            secret: "SECRET",
          };
        },
      };
    },
  });
  const args = {
    source: "hosted",
    cust_id: 99,
    league_id: 8579,
    start_range_begin: "2026-11-01T00:00:00Z",
    start_range_end: "2026-11-02T00:00:00Z",
  };
  const result = await f.call("search_race_results", args);
  assert.equal(result.structuredContent.query_complete, true);
  assert.doesNotMatch(JSON.stringify(result), /SECRET/);
  const invalid = await f.call("search_race_results", {
    ...args,
    series_id: 3,
  });
  assert.equal(invalid.structuredContent.error.code, "INVALID_INPUT");
  assert.equal(selected, 1);
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
    getRaceSearchQueries: () => {
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
    [
      "search_race_results",
      {
        source: "series",
        series_id: 491,
        start_range_begin: "2019-01-01T00:00:00Z",
        start_range_end: "2026-11-17T00:00:00Z",
      },
    ],
    [
      "search_race_results",
      {
        source: "series",
        finish_range_begin: "2019-01-01T00:00:00Z",
      },
    ],
    [
      "search_race_results",
      {
        source: "hosted",
        start_range_begin: "2019-01-01T00:00:00Z",
        start_range_end: "2026-11-17T00:00:00Z",
      },
    ],
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

test("missing selectors fail before publishing any tools", async () => {
  const { registerIracingTools } = await import("../dist/index.js");
  for (const services of [
    {},
    { getDriverQueries() {} },
    { getRecentRaceQueries() {} },
    { getRaceSearchQueries() {} },
    { getDriverQueries() {}, getRecentRaceQueries() {} },
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
      /All iRacing capability selectors are required/,
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

test("cancellation during capability selection prevents domain queries", async () => {
  const { registerIracingTools } = await import("../dist/index.js");
  for (const name of [
    "get_my_driver",
    "get_recent_races",
    "search_race_results",
  ]) {
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
      search: async () => {
        queried++;
        return { source: "hosted", total_matches: 0 };
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
      {
        getDriverQueries: select,
        getRecentRaceQueries: select,
        getRaceSearchQueries: select,
      },
    );
    const pending = callbacks.get(name)(
      name === "search_race_results"
        ? {
            source: "hosted",
            cust_id: 1,
            start_range_begin: "2026-11-01T00:00:00Z",
            start_range_end: "2026-11-02T00:00:00Z",
          }
        : {},
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

test("historical search refuses inconsistent injected chunk totals", async (t) => {
  const f = await fixture(t, {
    getRaceSearchQueries: () => ({
      search: async () => ({
        source: "hosted",
        criteria: {},
        total_matches: 1,
        total_chunks: 1,
        chunk_index: 0,
        returned_count: 0,
        query_complete: false,
        results: [],
        position_basis: "upstream",
      }),
    }),
  });
  const result = await f.call("search_race_results", {
    source: "hosted",
    cust_id: 1,
    start_range_begin: "2026-11-01T00:00:00Z",
    start_range_end: "2026-11-02T00:00:00Z",
  });
  assert.equal(result.structuredContent.error.code, "DATA_RESOLUTION_FAILED");
});

test("historical search refuses oversized projected chunks", async (t) => {
  const f = await fixture(t, {
    getRaceSearchQueries: () => ({
      search: async () => ({
        source: "hosted",
        criteria: {},
        total_matches: 1,
        total_chunks: 1,
        chunk_index: 0,
        returned_count: 1,
        query_complete: true,
        results: [
          {
            subsession_id: 1,
            start_time: "2026-11-01T00:00:00Z",
            series_name: "X".repeat(40000),
          },
        ],
        position_basis: "upstream",
      }),
    }),
  });
  const result = await f.call("search_race_results", {
    source: "hosted",
    cust_id: 1,
    start_range_begin: "2026-11-01T00:00:00Z",
    start_range_end: "2026-11-02T00:00:00Z",
  });
  assert.equal(result.structuredContent.error.code, "RESPONSE_LIMIT_EXCEEDED");
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 64 * 1024);
});
