const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("MCP refresh tool selects one static dataset and updates subsequent resource reads", async (t) => {
  const { CarCatalogSchema, createCarCatalogResolver } =
    await import("../dist/catalog.js");
  const { AssetCatalogSchema, createAssetCatalogResolver } =
    await import("../dist/assets.js");
  const { createFileBackedResolver, registerReferenceResources } =
    await import("../dist/resources.js");
  const { registerRefreshStaticCacheTool } =
    await import("../dist/refresh.js");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");

  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  let version = 1;
  const requests = { cars: 0, car: 0, track: 0, series: 0 };
  const cars = createCarCatalogResolver(createFileBackedResolver(
    path.join(directory, "cars.json"),
    async () => {
      requests.cars++;
      return [{ car_id: 1, car_name: "Car " + version }];
    },
    (value) => CarCatalogSchema.parse(value),
  ));
  const asset = (kind) => createAssetCatalogResolver(createFileBackedResolver(
    path.join(directory, kind + "-assets.json"),
    async () => {
      requests[kind]++;
      return { "1": { [kind + "_id"]: 1 } };
    },
    (value) => AssetCatalogSchema.parse(value),
  ));
  const assets = {
    car: asset("car"),
    track: asset("track"),
    series: asset("series"),
  };
  const server = new McpServer({ name: "refresh-test", version: "1" });
  registerReferenceResources(server, { cars, assets });
  registerRefreshStaticCacheTool(server, {
    cars: () => cars.refresh(),
    "car-assets": () => assets.car.refresh(),
    "track-assets": () => assets.track.refresh(),
    "series-assets": () => assets.series.refresh(),
  });

  const client = new Client({ name: "refresh-client", version: "1" });
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const tools = (await client.listTools()).tools;
  const definition = tools.find((item) => item.name === "refresh_static_cache");
  assert.ok(definition);
  assert.deepEqual(definition.inputSchema.properties.dataset.enum, [
    "cars", "car-assets", "track-assets", "series-assets",
  ]);

  const read = (uri) => client.readResource({ uri });
  const before = await read("iracing://cars/1");
  assert.equal(JSON.parse(before.contents[0].text).car_name, "Car 1");

  version = 2;
  const refreshed = await client.callTool({
    name: "refresh_static_cache",
    arguments: { dataset: "cars" },
  });
  assert.equal(refreshed.isError, undefined);
  assert.deepEqual(refreshed.structuredContent, {
    dataset: "cars",
    status: "refreshed",
    resourceUri: "iracing://cars",
    records: 1,
  });
  const after = await read("iracing://cars/1");
  assert.equal(JSON.parse(after.contents[0].text).car_name, "Car 2");
  assert.deepEqual(requests, { cars: 2, car: 0, track: 0, series: 0 });
  assert.equal(
    JSON.parse(await fs.readFile(path.join(directory, "cars.json"), "utf8"))[0].car_name,
    "Car 2",
  );

  const track = await client.callTool({
    name: "refresh_static_cache",
    arguments: { dataset: "track-assets" },
  });
  assert.equal(track.structuredContent.resourceUri, "iracing://assets/tracks");
  assert.deepEqual(requests, { cars: 2, car: 0, track: 1, series: 0 });
  const trackResource = await read("iracing://assets/tracks");
  assert.deepEqual(JSON.parse(trackResource.contents[0].text), {
    "1": { track_id: 1 },
  });

  const rejected = await client.callTool({
    name: "refresh_static_cache",
    arguments: { dataset: "results" },
  });
  assert.equal(rejected.isError, true);
  assert.deepEqual(requests, { cars: 2, car: 0, track: 1, series: 0 });
});

test("a failed forced refresh preserves the last good snapshot and lookup index", async (t) => {
  const { CarCatalogSchema, createCarCatalogResolver } =
    await import("../dist/catalog.js");
  const { createFileBackedResolver } = await import("../dist/resources.js");

  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  let fail = false;
  let fetches = 0;
  const cars = createCarCatalogResolver(createFileBackedResolver(
    file,
    async () => {
      fetches++;

      if (fail) {
        throw new Error("secret upstream details");
      }

      return [{ car_id: 1, car_name: "Car One" }];
    },
    (value) => CarCatalogSchema.parse(value),
  ));

  assert.equal((await cars.get(1)).car_name, "Car One");
  const previous = await fs.readFile(file, "utf8");
  fail = true;
  await assert.rejects(cars.refresh(), /secret upstream details/);
  assert.equal((await cars.get(1)).car_name, "Car One");
  assert.equal(await fs.readFile(file, "utf8"), previous);
  assert.equal(fetches, 2);
});

test("concurrent refresh requests coalesce to one upstream request", async (t) => {
  const { createFileBackedResolver } = await import("../dist/resources.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "assets.json");
  let fetches = 0;
  const resolver = createFileBackedResolver(
    file,
    async () => {
      fetches++;
      await Promise.resolve();
      return { "1": { car_id: 1 } };
    },
    (value) => value,
  );

  const [first, second] = await Promise.all([
    resolver.refresh(),
    resolver.refresh(),
  ]);
  assert.deepEqual(first, second);
  assert.equal(fetches, 1);
});

test("all static asset fetchers materialize signed links without bearer leakage", async () => {
  const { createAssetCatalogLoader } =
    await import("../dist/adapters/assets.js");
  for (const [kind, endpoint] of [
    ["car", "/data/car/assets"],
    ["track", "/data/track/assets"],
    ["series", "/data/series/assets"],
  ]) {
    const calls = [];
    const load = createAssetCatalogLoader(
      kind,
      async () => "PRIVATE_TOKEN",
      async (input, init) => {
        const url = new URL(input);
        const auth = new Headers(init.headers).get("authorization");
        calls.push({ host: url.hostname, auth });

        if (url.hostname === "members-ng.iracing.com") {
          assert.equal(url.pathname, endpoint);
          return Response.json({
            link: "https://cache.example.test/assets",
            expires: new Date(Date.now() + 900000).toISOString(),
          });
        }

        assert.equal(init.redirect, "error");
        return Response.json({ "1": { [kind + "_id"]: 1 } });
      },
    );
    assert.deepEqual(await load(), { "1": { [kind + "_id"]: 1 } });
    assert.deepEqual(calls, [
      { host: "members-ng.iracing.com", auth: "Bearer PRIVATE_TOKEN" },
      { host: "cache.example.test", auth: null },
    ]);
  }
});
