const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

async function registerStaticCacheRefresh(server, catalogs, assets) {
  const { registerIracingTools } = await import("@iracing-data/mcp");
  const { createStaticCacheRefresh } =
    await import("../dist/adapters/static-cache-refresh.js");
  registerIracingTools(
    {
      registerTool(name, options, handler) {
        if (name === "refresh_static_cache") {
          return server.registerTool(name, options, handler);
        }
      },
    },
    {
      getDriverQueries() {},
      getRecentRaceQueries() {},
      getRaceSearchQueries() {},
      getStaticCacheRefresh: () => createStaticCacheRefresh(catalogs, assets),
    },
  );
}

test("refresh coalesces, replaces persisted/live entries, and retains last-good state", async (t) => {
  const { createFileBackedResolver } = await import("../dist/snapshots.js");
  const { createCatalogResolver } = await import("../dist/catalog.js");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-static-refresh-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  await fs.writeFile(file, JSON.stringify([{ id: 1 }]));
  let calls = 0;
  let invalid = false;
  const read = createFileBackedResolver(
    file,
    async () => {
      calls++;
      if (invalid) throw new Error("upstream failed");
      return [{ id: 2 }];
    },
    (raw) => raw,
  );
  const resolver = createCatalogResolver(read, (entry) => entry.id);
  assert.deepEqual(await resolver.get(1), { id: 1 });
  await Promise.all([resolver.refresh(), resolver.refresh()]);
  assert.equal(calls, 1);
  assert.equal(await resolver.get(1), null);
  assert.deepEqual(await resolver.get(2), { id: 2 });
  assert.deepEqual(JSON.parse(await fs.readFile(file)), [{ id: 2 }]);
  invalid = true;
  await assert.rejects(resolver.refresh(), /upstream failed/);
  assert.deepEqual(await resolver.get(2), { id: 2 });
  assert.deepEqual(JSON.parse(await fs.readFile(file)), [{ id: 2 }]);
});

test("refresh waits for an initial read without publishing stale indexes", async () => {
  const { createCatalogResolver } = await import("../dist/catalog.js");
  let release;
  const initial = new Promise((resolve) => {
    release = resolve;
  });
  const resolver = createCatalogResolver(
    () => initial,
    (entry) => entry.id,
    async () => [{ id: 2 }],
  );
  const first = resolver.all();
  const refresh = resolver.refresh();
  release([{ id: 1 }]);
  await first;
  await refresh;
  assert.equal(await resolver.get(1), null);
  assert.deepEqual(await resolver.get(2), { id: 2 });
});

test("failed atomic replacement retains the live index, cleans temporary files and can retry", async (t) => {
  const { createFileBackedResolver } = await import("../dist/snapshots.js");
  const { createCatalogResolver } = await import("../dist/catalog.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  // A directory at the target forces rename to fail on every supported platform.
  await fs.mkdir(file);
  const read = createFileBackedResolver(
    file,
    async () => [{ id: 2 }],
    (raw) => raw,
  );
  const resolver = createCatalogResolver(
    async () => [{ id: 1 }],
    (entry) => entry.id,
    read.refresh,
  );
  await resolver.all();
  await assert.rejects(resolver.refresh());
  assert.deepEqual(await resolver.get(1), { id: 1 });
  assert.equal(await resolver.get(2), null);
  assert.deepEqual(await fs.readdir(directory), ["cars.json"]);
  await fs.rmdir(file);
  await resolver.refresh();
  assert.equal(await resolver.get(1), null);
  assert.deepEqual(await resolver.get(2), { id: 2 });
  assert.deepEqual(JSON.parse(await fs.readFile(file)), [{ id: 2 }]);
});

test("local refresh selects one dataset and rejects invalid selectors before effects", async (t) => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const calls = [];
  const server = new McpServer({ name: "refresh-test", version: "1" });
  await registerStaticCacheRefresh(
    server,
    [
      {
        name: "tracks",
        resolver: {
          refresh: async () => {
            calls.push("tracks");
            return [{ track_id: 1 }];
          },
        },
      },
    ],
    [
      {
        kind: "cars",
        resolver: {
          refresh: async () => {
            calls.push("cars");
            return [{ car_id: 2 }];
          },
        },
      },
    ],
  );
  const client = new Client({ name: "refresh-test-client", version: "1" });
  const [left, right] = InMemoryTransport.createLinkedPair();
  await server.connect(left);
  await client.connect(right);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  const result = await client.callTool({
    name: "refresh_static_cache",
    arguments: { dataset: "car-assets" },
  });
  assert.deepEqual(result.structuredContent, {
    dataset: "car-assets",
    resource_uri: "iracing://assets/cars",
    count: 1,
  });
  assert.deepEqual(calls, ["cars"]);
  const invalid = await client.callTool({
    name: "refresh_static_cache",
    arguments: { dataset: "all" },
  });
  assert.equal(invalid.isError, true);
  assert.deepEqual(calls, ["cars"]);
  for (const args of [
    { dataset: "series" },
    { dataset: "cars", endpoint: "/data/member/info" },
    {},
  ]) {
    const invalid = await client.callTool({
      name: "refresh_static_cache",
      arguments: args,
    });
    assert.equal(invalid.isError, true);
    assert.deepEqual(calls, ["cars"]);
  }
});

test("reference refresh validates before persistence and updates the shared resource index", async (t) => {
  const { createReferenceCatalog } = await import("../dist/catalog.js");
  const { CarsCatalog } = await import("@iracing-data/mcp");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  const original = [{ car_id: 1, car_name: "Original" }];
  await fs.writeFile(file, JSON.stringify(original));
  let entries;
  const catalog = createReferenceCatalog(directory, {
    ...CarsCatalog,
    load: async () => entries,
  });
  assert.deepEqual(await catalog.resolver.all(), original);
  for (const invalid of [
    [{ car_id: -1 }],
    [{ car_id: 2 }, { car_id: 2 }],
    { cars: [] },
  ]) {
    entries = invalid;
    await assert.rejects(catalog.resolver.refresh());
    assert.deepEqual(await catalog.resolver.all(), original);
    assert.deepEqual(JSON.parse(await fs.readFile(file)), original);
  }
  entries = [{ car_id: 2, car_name: "Replacement", unknown_field: true }];
  await catalog.resolver.refresh();
  assert.equal(await catalog.resolver.get(1), null);
  assert.deepEqual(await catalog.resolver.get(2), entries[0]);
  assert.deepEqual(JSON.parse(await fs.readFile(file)), entries);
  assert.deepEqual(await fs.readdir(directory), ["cars.json"]);
});

test("asset refresh uses the plural snapshot and publishes new metadata to media resolution", async (t) => {
  const { createAssetCatalogs } = await import("../dist/adapters/assets.js");
  const { imageUrl } = await import("@iracing-data/mcp");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars-assets.json");
  const original = { 1: { car_id: 1, logo: "/img/old.png" } };
  await fs.writeFile(file, JSON.stringify(original));
  let document = { 1: { car_id: 1, logo: "/img/new.png" } };
  let tokens = 0;
  const requests = [];
  const [cars] = createAssetCatalogs(
    directory,
    async () => {
      tokens++;
      return "TEST_TOKEN";
    },
    async (input, init) => {
      const url = new URL(input);
      requests.push(url.href);
      if (url.host === "members-ng.iracing.com") {
        assert.equal(url.pathname, "/data/car/assets");
        assert.equal(
          new Headers(init.headers).get("authorization"),
          "Bearer TEST_TOKEN",
        );
        return Response.json({
          link: "https://cache.example.test/cars",
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      }
      assert.equal(url.href, "https://cache.example.test/cars");
      assert.equal(new Headers(init.headers).get("authorization"), null);
      assert.equal(init.redirect, "error");
      return Response.json(document);
    },
  );
  assert.equal((await cars.resolver.get(1)).logo, "/img/old.png");
  assert.equal(tokens, 0);
  await Promise.all([cars.resolver.refresh(), cars.resolver.refresh()]);
  const fresh = await cars.resolver.get(1);
  assert.equal(fresh.logo, "/img/new.png");
  assert.equal(imageUrl("cars", fresh, "logo").pathname, "/img/new.png");
  assert.equal(tokens, 1);
  assert.equal(requests.length, 2);
  assert.deepEqual(JSON.parse(await fs.readFile(file)), document);
  for (const invalid of [{ 2: { car_id: 1 } }, { 1: { car_id: -1 } }]) {
    document = invalid;
    await assert.rejects(cars.resolver.refresh());
    assert.deepEqual(await cars.resolver.get(1), fresh);
    assert.deepEqual(JSON.parse(await fs.readFile(file)), { 1: fresh });
  }
  assert.deepEqual(await fs.readdir(directory), ["cars-assets.json"]);
});

test("every selector routes to exactly one configured resolver and failures stay sanitized", async (t) => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const server = new McpServer({ name: "refresh-test", version: "1" });
  const calls = [];
  const resolver = (name) => ({
    refresh: async () => {
      calls.push(name);
      return [{}];
    },
  });
  await registerStaticCacheRefresh(
    server,
    ["cars", "tracks", "car-classes"].map((name) => ({
      name,
      resolver: resolver(name),
    })),
    ["cars", "tracks", "series"].map((kind) => ({
      kind,
      resolver: resolver(`${kind}-assets`),
    })),
  );
  const client = new Client({ name: "refresh-test-client", version: "1" });
  const [left, right] = InMemoryTransport.createLinkedPair();
  await server.connect(left);
  await client.connect(right);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  for (const [dataset, target, resource_uri] of [
    ["cars", "cars", "iracing://cars"],
    ["tracks", "tracks", "iracing://tracks"],
    ["car-classes", "car-classes", "iracing://car-classes"],
    ["car-assets", "cars-assets", "iracing://assets/cars"],
    ["track-assets", "tracks-assets", "iracing://assets/tracks"],
    ["series-assets", "series-assets", "iracing://assets/series"],
  ]) {
    const before = calls.length;
    const response = await client.callTool({
      name: "refresh_static_cache",
      arguments: { dataset },
    });
    assert.deepEqual(calls.slice(before), [target]);
    assert.deepEqual(response.structuredContent, {
      dataset,
      resource_uri,
      count: 1,
    });
  }
  // No configured resolver and upstream exception text must never leak.
  let handler;
  await registerStaticCacheRefresh(
    {
      registerTool: (_name, _options, callback) => {
        handler = callback;
      },
    },
    [],
    [],
  );
  const request = { mcpReq: { signal: new AbortController().signal } };
  const missing = await handler({ dataset: "cars" }, request);
  assert.equal(missing.structuredContent.error.code, "NOT_FOUND");
  await registerStaticCacheRefresh(
    {
      registerTool: (_name, _options, callback) => {
        handler = callback;
      },
    },
    [
      {
        name: "cars",
        resolver: {
          refresh: async () => {
            throw new Error("SECRET signed URL");
          },
        },
      },
    ],
    [],
  );
  const failed = await handler({ dataset: "cars" }, request);
  assert.equal(failed.isError, true);
  assert.equal(JSON.stringify(failed).includes("SECRET"), false);
});

test("pre-cancelled refresh has no effects and caller cancellation does not abort a shared replacement", async () => {
  let handler;
  let calls = 0;
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await registerStaticCacheRefresh(
    {
      registerTool: (_name, _options, callback) => {
        handler = callback;
      },
    },
    [
      {
        name: "cars",
        resolver: {
          refresh: async () => {
            calls++;
            return held;
          },
        },
      },
    ],
    [],
  );
  const controller = new AbortController();
  const request = { mcpReq: { signal: controller.signal } };
  const pending = handler({ dataset: "cars" }, request);
  // Input parsing and capability selection are asynchronous core boundaries.
  while (calls === 0) await new Promise((resolve) => setImmediate(resolve));
  controller.abort();
  release([{ car_id: 1 }]);
  await assert.rejects(pending, { name: "AbortError" });
  await assert.rejects(handler({ dataset: "cars" }, request), {
    name: "AbortError",
  });
  assert.equal(calls, 1);
});

test("actual stdio executable advertises local refresh without reading credentials or hydrating snapshots", async (t) => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-refresh-stdio-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const client = new Client({ name: "refresh-stdio-test", version: "1" });
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key, value]) => value !== undefined && !key.startsWith("IRACING_"),
    ),
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      path.resolve(__dirname, "../dist/main.js"),
      "serve",
      "--credentials",
      path.join(directory, "missing.json"),
    ],
    env: { ...env, IRACING_ACCESS_TOKEN: "TEST_TOKEN" },
  });
  t.after(() => client.close());
  await client.connect(transport);
  assert.deepEqual(
    (await client.listTools()).tools.map((tool) => tool.name),
    [
      "get_my_driver",
      "get_recent_races",
      "search_race_results",
      "find_reference",
      "refresh_static_cache",
    ],
  );
  const invalid = await client.callTool({
    name: "refresh_static_cache",
    arguments: { dataset: "all" },
  });
  assert.equal(invalid.isError, true);
  assert.deepEqual(await fs.readdir(directory), []);
});
