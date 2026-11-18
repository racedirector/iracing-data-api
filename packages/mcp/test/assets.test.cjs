const assert = require("node:assert/strict");
const test = require("node:test");

test("factory registers injected assets lazily without host or transport dependencies", async (t) => {
  const { createIracingMcpServer, AssetDefinitions } =
    await import("../dist/index.js");
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  let reads = 0;
  const entry = { car_id: 17, logo: "/img/logos/example.png" };
  const server = createIracingMcpServer({
    serverInfo: { name: "asset-factory-test", version: "1" },
    services: {
      getDriverQueries() {
        throw new Error("No tool selection expected");
      },
      getRecentRaceQueries() {
        throw new Error("No tool selection expected");
      },
      getRaceSearchQueries() {
        throw new Error("No tool selection expected");
      },
    },
    assets: {
      catalogs: [
        {
          kind: AssetDefinitions.cars.kind,
          idField: AssetDefinitions.cars.idField,
          resolver: {
            all: async () => {
              reads++;
              return [entry];
            },
            get: async (id) => {
              reads++;
              return id === 17 ? entry : null;
            },
          },
        },
      ],
      readMedia: async (url) => {
        assert.equal(
          url.href,
          "https://images-static.iracing.com/img/logos/example.png",
        );
        return { mimeType: "image/png", blob: "AQID" };
      },
    },
  });
  const client = new Client({ name: "asset-factory-client", version: "1" });
  const [left, right] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await server.connect(left);
  await client.connect(right);
  assert.equal((await client.listResources()).resources.length, 1);
  assert.equal(
    (await client.listResourceTemplates()).resourceTemplates.length,
    3,
  );
  assert.equal(reads, 0);
  const metadata = await client.readResource({
    uri: "iracing://assets/cars/17",
  });
  assert.deepEqual(JSON.parse(metadata.contents[0].text), entry);
  const image = await client.readResource({
    uri: "iracing://images/cars/17/logo",
  });
  assert.equal(image.contents[0].mimeType, "image/png");
  assert.equal(image.contents[0].blob, "AQID");
  assert.equal(reads, 2);
});

test("asset resolver failures are sanitized and reads can retry, including encoded map layers", async (t) => {
  const { createIracingMcpServer } = await import("../dist/index.js");
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  let failing = true;
  const entry = {
    track_id: 17,
    logo: "/img/logos/example.png",
    track_map: "https://members-assets.iracing.com/public/track-maps/example/",
    track_map_layers: {
      active: "active.svg",
      "start/finish": "start-finish.svg",
    },
  };
  const load = async () => {
    if (failing) throw new Error("private resolver diagnostic");
    return entry;
  };
  const urls = [];
  const server = createIracingMcpServer({
    serverInfo: { name: "asset-errors", version: "1" },
    services: {
      getDriverQueries() {
        throw new Error("Unexpected tool");
      },
      getRecentRaceQueries() {
        throw new Error("Unexpected tool");
      },
      getRaceSearchQueries() {
        throw new Error("Unexpected tool");
      },
    },
    assets: {
      catalogs: [
        {
          kind: "tracks",
          idField: "track_id",
          resolver: { all: async () => [await load()], get: load },
        },
      ],
      readMedia: async (url) => {
        urls.push(url.href);
        return { mimeType: "image/svg+xml", blob: "AQID" };
      },
    },
  });
  const client = new Client({ name: "asset-errors-client", version: "1" });
  const [left, right] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await server.connect(left);
  await client.connect(right);
  for (const uri of [
    "iracing://assets/tracks",
    "iracing://assets/tracks/17",
    "iracing://assets/tracks/17/media",
    "iracing://images/tracks/17/logo",
    "iracing://track-maps/17/active",
  ]) {
    await assert.rejects(client.readResource({ uri }), (error) => {
      assert.match(error.message, /Unable to load asset metadata/);
      assert.doesNotMatch(error.message, /private resolver diagnostic/);
      return true;
    });
  }
  failing = false;
  assert.deepEqual(
    JSON.parse(
      (await client.readResource({ uri: "iracing://assets/tracks" }))
        .contents[0].text,
    ),
    { 17: entry },
  );
  const index = JSON.parse(
    (
      await client.readResource({
        uri: "iracing://assets/tracks/17/media",
      })
    ).contents[0].text,
  );
  assert.deepEqual(
    index.track_maps.map(({ layer }) => layer),
    ["active", "start/finish"],
  );
  assert.match(index.track_maps[1].uri, /start%2Ffinish$/);
  for (const { uri } of index.track_maps) {
    assert.equal((await client.readResource({ uri })).contents[0].blob, "AQID");
  }
  assert.deepEqual(
    urls.map((url) => new URL(url).pathname),
    [
      "/public/track-maps/example/active.svg",
      "/public/track-maps/example/start-finish.svg",
    ],
  );
});
