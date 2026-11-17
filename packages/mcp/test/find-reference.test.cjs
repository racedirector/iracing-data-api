const assert = require("node:assert/strict");
const test = require("node:test");

const unexpected = () => {
  throw new Error("Reference lookup must not select race/driver capabilities");
};

async function connect(t, options = {}) {
  const { createIracingMcpServer } = await import("../dist/index.js");
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  const server = createIracingMcpServer({
    serverInfo: { name: "find-reference-test", version: "1" },
    ...options,
    services: {
      getDriverQueries: unexpected,
      getRecentRaceQueries: unexpected,
      getRaceSearchQueries: unexpected,
      ...options.services,
    },
  });
  const client = new Client({ name: "find-reference-client", version: "1" });
  const [left, right] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await server.connect(left);
  await client.connect(right);
  return client;
}

async function fixture(t) {
  const { createCatalogReferenceQueries } = await import("../dist/index.js");
  const rows = {
    cars: [
      { car_id: 2, car_name: "BMW M4 GT4", car_make: "BMW", extra: "PRIVATE" },
      { car_id: 1, car_name: "BMW M4 GT3", car_make: "BMW" },
      {
        car_id: 3,
        car_name: "Example Coupe",
        car_make: "BMW",
        car_model: "M2",
      },
      { car_id: 12, car_name: "Other Brand" },
    ],
    tracks: [
      {
        track_id: 21,
        track_name: "Example Circuit",
        config_name: "Grand Prix",
      },
    ],
    series: [
      {
        series_id: 120,
        series_name: "Example Series",
        series_short_name: "Example",
        extra: "PRIVATE",
      },
    ],
    "car-classes": [
      { car_class_id: 0, name: "Hosted All Cars Class", short_name: "ALL" },
    ],
  };
  const reads = [];
  const catalogs = Object.entries(rows).map(([name, entries]) => ({
    name,
    title: name,
    description: "Reference",
    idField: {
      cars: "car_id",
      tracks: "track_id",
      series: "series_id",
      "car-classes": "car_class_id",
    }[name],
    resolver: {
      all: async () => {
        reads.push(name);
        return entries;
      },
      get: async () => {
        assert.fail("Lookup should share the collection resolver");
      },
    },
  }));
  const assets = ["cars", "series"].map((kind) => ({
    kind,
    idField: `${kind}_id`,
    resolver: { all: unexpected, get: unexpected },
  }));
  const queries = createCatalogReferenceQueries(catalogs, assets);
  let selections = 0;
  const client = await connect(t, {
    catalogs,
    assets: { catalogs: assets, readMedia: unexpected },
    services: {
      getReferenceQueries: () => {
        selections++;
        return queries;
      },
    },
  });
  const call = (args) =>
    client.callTool({ name: "find_reference", arguments: args });
  return { client, queries, call, reads, rows, selections: () => selections };
}

test("find_reference is opt-in; invalid selectors fail before registration", async (t) => {
  const client = await connect(t);
  assert.equal(
    (await client.listTools()).tools.some(
      (tool) => tool.name === "find_reference",
    ),
    false,
  );
  const { registerIracingTools } = await import("../dist/index.js");
  assert.throws(
    () =>
      registerIracingTools(
        { registerTool: unexpected },
        {
          getDriverQueries: unexpected,
          getRecentRaceQueries: unexpected,
          getRaceSearchQueries: unexpected,
          getReferenceQueries: "invalid",
        },
      ),
    TypeError,
  );
});

test("lookup is lazy, bounded, projected and linked only to selected resources", async (t) => {
  const f = await fixture(t);
  const tools = (await f.client.listTools()).tools;
  const tool = tools.find((candidate) => candidate.name === "find_reference");
  assert.ok(tool);
  assert.match(tool.description, /logo.*image.*asset/);
  assert.equal(tool.annotations.readOnlyHint, true);
  await f.client.listResources();
  await f.client.listResourceTemplates();
  assert.deepEqual(f.reads, []);
  assert.equal(f.selections(), 0);
  const result = await f.call({ kind: "cars", query: "  bMw  ", limit: 2 });
  assert.equal(result.isError, undefined);
  assert.deepEqual(result.structuredContent, {
    kind: "cars",
    query: "bMw",
    available: true,
    total_matches: 3,
    returned_count: 2,
    has_more: true,
    matches: [1, 2].map((id) => ({
      id,
      name: `BMW M4 ${id === 1 ? "GT3" : "GT4"}`,
      metadata_uri: `iracing://cars/${id}`,
      asset_metadata_uri: `iracing://assets/cars/${id}`,
      media_index_uri: `iracing://assets/cars/${id}/media`,
    })),
  });
  assert.deepEqual(
    JSON.parse(result.content[0].text),
    result.structuredContent,
  );
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE/);
  assert.deepEqual(f.reads, ["cars"]);
  assert.equal(f.selections(), 1);
});

test("numeric IDs are exact, keywords match aliases, tracks include layouts and class zero is valid", async (t) => {
  const f = await fixture(t);
  const checks = [
    [{ kind: "cars", query: "1" }, [1]],
    [{ kind: "cars", query: "BMW M2" }, [3]],
    [{ kind: "cars", query: "BMW no-such-model" }, []],
    [{ kind: "tracks", query: "grand prix" }, [21]],
    [{ kind: "series", query: "120" }, [120]],
    [{ kind: "car-classes", query: "0" }, [0]],
  ];
  for (const [input, ids] of checks) {
    const { structuredContent: data } = await f.call(input);
    assert.deepEqual(
      data.matches.map((match) => match.id),
      ids,
    );
    assert.equal(data.available, true);
    assert.equal(data.has_more, false);
    if (input.kind === "tracks") {
      assert.equal(data.matches[0].name, "Example Circuit — Grand Prix");
      assert.equal(data.matches[0].media_index_uri, undefined);
    }
    if (input.kind === "car-classes")
      assert.equal(data.matches[0].asset_metadata_uri, undefined);
  }
});

test("unconfigured catalogs are distinct from empty selected snapshots", async (t) => {
  const f = await fixture(t);
  f.rows.series.length = 0;
  const empty = await f.call({ kind: "series", query: "120" });
  assert.equal(empty.structuredContent.available, true);
  assert.deepEqual(empty.structuredContent.matches, []);
  const { createCatalogReferenceQueries } = await import("../dist/index.js");
  const source = createCatalogReferenceQueries([]);
  const client = await connect(t, {
    services: { getReferenceQueries: () => source },
  });
  const result = await client.callTool({
    name: "find_reference",
    arguments: { kind: "series", query: "120" },
  });
  assert.deepEqual(result.structuredContent, {
    kind: "series",
    query: "120",
    available: false,
    total_matches: 0,
    returned_count: 0,
    has_more: false,
    matches: [],
  });
});

test("invalid input has no dependency effects and malformed providers fail safely", async (t) => {
  const f = await fixture(t);
  for (const input of [
    { kind: "cars", query: "" },
    { kind: "cars", query: " \t " },
    { kind: "drivers", query: "BMW" },
    { kind: "cars", query: "x".repeat(121) },
    { kind: "cars", query: "BMW", limit: 21 },
    { kind: "cars", query: "BMW", limit: 0 },
    { kind: "cars", query: "BMW", token: "SECRET" },
    { kind: "cars", query: "9007199254740992" },
  ]) {
    assert.equal(
      (await f.call(input)).structuredContent.error.code,
      "INVALID_INPUT",
    );
  }
  assert.equal(f.selections(), 0);
  assert.deepEqual(f.reads, []);
  f.rows.cars[0].car_id = "2";
  const invalid = await f.call({ kind: "cars", query: "BMW" });
  assert.equal(invalid.structuredContent.error.code, "DATA_RESOLUTION_FAILED");
});

test("selection is per request and provider-only results do not invent resource links", async (t) => {
  let name = "First";
  const client = await connect(t, {
    services: {
      getReferenceQueries: () => ({
        list: async () => ({
          entries: [{ id: 120, name, upstream_secret: "PRIVATE" }],
          metadata_available: false,
          assets_available: false,
        }),
      }),
    },
  });
  for (const value of ["First", "Second"]) {
    name = value;
    const result = await client.callTool({
      name: "find_reference",
      arguments: { kind: "series", query: "120" },
    });
    assert.deepEqual(result.structuredContent.matches, [
      { id: 120, name: value },
    ]);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE/);
  }
});

test("operation propagates cancellation before and after catalog reads", async () => {
  const { handleFindReference } =
    await import("../dist/tools/find-reference/operation.js");
  const input = { kind: "cars", query: "BMW", limit: 5 };
  const before = new AbortController();
  before.abort();
  await assert.rejects(
    handleFindReference({ list: unexpected }, input, { signal: before.signal }),
    { name: "AbortError" },
  );
  const during = new AbortController();
  await assert.rejects(
    handleFindReference(
      {
        list: async (_kind, { signal }) => {
          assert.strictEqual(signal, during.signal);
          during.abort();
          return null;
        },
      },
      input,
      { signal: during.signal },
    ),
    { name: "AbortError" },
  );
});

test("duplicate IDs, invalid identity domains and oversized projected results fail closed", async (t) => {
  let entries;
  const client = await connect(t, {
    services: {
      getReferenceQueries: () => ({
        list: async () => ({
          entries,
          metadata_available: true,
          assets_available: true,
        }),
      }),
    },
  });
  for (const invalid of [
    [{ id: 0, name: "Zero" }],
    [
      { id: 1, name: "A" },
      { id: 1, name: "B" },
    ],
  ]) {
    entries = invalid;
    const result = await client.callTool({
      name: "find_reference",
      arguments: { kind: "cars", query: "A" },
    });
    assert.equal(result.structuredContent.error.code, "DATA_RESOLUTION_FAILED");
  }
  entries = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: "\u0001".repeat(256),
  }));
  const result = await client.callTool({
    name: "find_reference",
    arguments: { kind: "cars", query: "\u0001", limit: 20 },
  });
  assert.equal(result.structuredContent.error.code, "RESPONSE_LIMIT_EXCEEDED");
});

test("initialization instructions guide resource discovery and preserve host instructions", async (t) => {
  const f = await fixture(t);
  const text = f.client.getInstructions();
  assert.match(text, /Tool-catalog search searches tools, not resources/);
  assert.match(text, /find_reference/);
  assert.match(text, /iracing:\/\/series\/120/);
  assert.match(text, /not automatically the canonical manufacturer mark/);
  assert.match(text, /does not guarantee current-season cars/);
  assert.match(text, /permission decision/);
  assert.deepEqual(f.reads, []);
  const bare = await connect(t, {
    serverOptions: {
      instructions: "Host-specific instructions remain intact.",
    },
  });
  const bareText = bare.getInstructions();
  assert.match(bareText, /configured no reference resources/);
  assert.match(bareText, /Host-specific instructions remain intact/);
  assert.doesNotMatch(
    bareText,
    /iracing:\/\/series\/120|get the BMW logo|Use find_reference/,
  );
});
