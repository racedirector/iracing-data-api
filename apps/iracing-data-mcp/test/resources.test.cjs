const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

async function connect(t, cars) {
  const { registerReferenceResources } = await import("../dist/resources.js");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");

  const server = new McpServer({ name: "catalog-test", version: "1" });
  registerReferenceResources(server, { cars });

  const client = new Client({ name: "catalog-client", version: "1" });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  return client;
}

test("collection and entity resources reuse one hydrated catalog across restarts", async (t) => {
  const { CarCatalogSchema, createCarCatalogResolver } =
    await import("../dist/catalog.js");
  const { createFileBackedResolver } = await import("../dist/resources.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "reference", "cars.json");
  const cars = [
    { car_id: 1, car_name: "Car One" },
    { car_id: 2, car_name: "Car Two" },
    { car_id: 3, car_name: "Car Three" },
  ];
  let fetches = 0;
  const load = async () => {
    fetches++;
    return cars;
  };
  const createCatalog = () =>
    createCarCatalogResolver(
      createFileBackedResolver(file, load, (data) => CarCatalogSchema.parse(data)),
    );

  const client = await connect(t, createCatalog());
  assert.deepEqual(
    (await client.listResources()).resources.map((resource) => resource.uri),
    ["iracing://cars"],
  );
  assert.deepEqual(
    (await client.listResourceTemplates()).resourceTemplates.map(
      (resource) => resource.uriTemplate,
    ),
    ["iracing://cars/{carId}"],
  );
  assert.equal(fetches, 0);

  const read = (uri) => client.readResource({ uri });
  const [list, first, second, third] = await Promise.all([
    read("iracing://cars"),
    read("iracing://cars/1"),
    read("iracing://cars/2"),
    read("iracing://cars/3"),
  ]);

  assert.deepEqual(JSON.parse(list.contents[0].text), cars);
  assert.deepEqual(JSON.parse(first.contents[0].text), cars[0]);
  assert.deepEqual(JSON.parse(second.contents[0].text), cars[1]);
  assert.deepEqual(JSON.parse(third.contents[0].text), cars[2]);
  assert.equal(fetches, 1);
  assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), cars);

  const restartedClient = await connect(t, createCatalog());
  const restarted = await restartedClient.readResource({
    uri: "iracing://cars/2",
  });
  assert.deepEqual(JSON.parse(restarted.contents[0].text), cars[1]);
  assert.equal(fetches, 1);
});

test("invalid and missing car IDs fail without a second API request", async (t) => {
  const { CarCatalogSchema, createCarCatalogResolver } =
    await import("../dist/catalog.js");
  let loads = 0;
  const cars = createCarCatalogResolver(async () => {
    loads++;
    return CarCatalogSchema.parse([{ car_id: 1, car_name: "Car One" }]);
  });
  const client = await connect(t, cars);

  for (const uri of [
    "iracing://cars/0",
    "iracing://cars/abc",
    "iracing://cars/9007199254740992",
    "iracing://cars/999",
  ]) {
    await assert.rejects(client.readResource({ uri }));
  }

  assert.equal(loads, 1);
  assert.deepEqual(await cars.get(1), { car_id: 1, car_name: "Car One" });
});

test("invalid hydration never persists a snapshot and may be retried", async (t) => {
  const { CarCatalogSchema, createCarCatalogResolver } =
    await import("../dist/catalog.js");
  const { createFileBackedResolver } = await import("../dist/resources.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  let attempts = 0;
  const cars = createCarCatalogResolver(
    createFileBackedResolver(
      file,
      async () => {
        attempts++;
        return attempts === 1
          ? [{ car_id: 1 }]
          : [{ car_id: 1, car_name: "Car One" }];
      },
      (data) => CarCatalogSchema.parse(data),
    ),
  );

  await assert.rejects(cars.all());
  await assert.rejects(fs.access(file), { code: "ENOENT" });
  assert.deepEqual(await cars.get(1), { car_id: 1, car_name: "Car One" });
  assert.equal(attempts, 2);
});

test("car fetch materializes linked payload without forwarding credentials", async () => {
  const { createCarCatalogLoader } =
    await import("../dist/adapters/catalog.js");
  const calls = [];
  const load = createCarCatalogLoader(
    async () => "TEST_TOKEN",
    async (input, init) => {
      const url = new URL(input);
      const auth = new Headers(init.headers).get("authorization");
      calls.push({ host: url.host, auth });

      if (url.host === "members-ng.iracing.com") {
        assert.equal(url.pathname, "/data/car/get");
        return Response.json({
          link: "https://cache.example.test/cars",
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      }

      assert.equal(init.redirect, "error");
      return Response.json([{ car_id: 17, car_name: "Example car" }]);
    },
  );

  assert.deepEqual(await load(), [{ car_id: 17, car_name: "Example car" }]);
  assert.deepEqual(calls, [
    { host: "members-ng.iracing.com", auth: "Bearer TEST_TOKEN" },
    { host: "cache.example.test", auth: null },
  ]);
});
