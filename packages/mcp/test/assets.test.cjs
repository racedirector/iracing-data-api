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
    2,
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
