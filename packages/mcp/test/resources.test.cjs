const assert = require("node:assert/strict");
const test = require("node:test");

const unexpectedSelection = () => {
  throw new Error("Resource requests must not select tool services");
};

test("entity reads preserve falsy values and reject only null", async () => {
  const { registerReferenceResources, createReferenceResource, CarsCatalog } =
    await import("../dist/index.js");
  const handlers = new Map();
  let entry = null;
  registerReferenceResources(
    {
      registerResource: (name, _uri, _metadata, handler) => {
        handlers.set(name, handler);
      },
    },
    [
      createReferenceResource(CarsCatalog, {
        all: async () => [],
        get: async () => entry,
      }),
    ],
  );
  const read = () =>
    handlers.get("cars-entity")(new URL("iracing://cars/1"), { car_id: "1" });
  for (const value of [0, false, ""]) {
    entry = value;
    const result = await read();
    assert.equal(JSON.parse(result.contents[0].text), value);
  }
  entry = null;
  await assert.rejects(read(), {
    code: -32602,
    data: { uri: "iracing://cars/1" },
  });
});

test("the core factory advertises resources without loading host data", async (t) => {
  const {
    createIracingMcpServer,
    createReferenceResource,
    CarsCatalog,
    TracksCatalog,
    CarClassesCatalog,
  } = await import("../dist/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");
  let reads = 0;
  let fail = false;
  let expanded = false;
  const definitions = [CarsCatalog, TracksCatalog, CarClassesCatalog];
  const catalogs = definitions.map((definition) => {
    const entity = { [definition.idField]: 1 };
    return createReferenceResource(definition, {
      all: async () => {
        reads++;
        if (fail) throw new Error("secret token and private disk path");
        if (expanded) {
          return Array.from({ length: 151 }, (_, id) => ({
            [definition.idField]: id,
          }));
        }
        return [entity];
      },
      get: async (id) => {
        reads++;
        if (fail) throw new Error("secret token and private disk path");
        return id === 1 ? entity : null;
      },
    });
  });
  const server = createIracingMcpServer({
    serverInfo: { name: "resources-test", version: "1" },
    services: {
      getDriverQueries: unexpectedSelection,
      getRecentRaceQueries: unexpectedSelection,
      getRaceSearchQueries: unexpectedSelection,
    },
    catalogs,
  });
  const client = new Client({ name: "resources-client", version: "1" });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  assert.ok(client.getServerCapabilities().resources);
  assert.ok(client.getServerCapabilities().completions);
  assert.equal((await client.listTools()).tools.length, 3);
  assert.deepEqual(
    (await client.listResources()).resources.map((entry) => entry.uri),
    definitions.map((entry) => `iracing://${entry.name}`),
  );
  assert.deepEqual(
    (await client.listResourceTemplates()).resourceTemplates.map(
      (entry) => entry.uriTemplate,
    ),
    definitions.map((entry) => `iracing://${entry.name}/{${entry.idField}}`),
  );
  assert.equal(reads, 0);
  for (const resource of (await client.listResources()).resources) {
    assert.deepEqual(resource.annotations.audience, ["user", "assistant"]);
    assert.match(resource.description, /Prefer iracing:/);
  }
  for (const definition of definitions) {
    const complete = (value) =>
      client.complete({
        ref: {
          type: "ref/resource",
          uri: `iracing://${definition.name}/{${definition.idField}}`,
        },
        argument: { name: definition.idField, value },
      });
    const beforeCompletion = reads;
    assert.deepEqual((await complete("invalid")).completion.values, []);
    assert.equal(reads, beforeCompletion);
    assert.deepEqual((await complete("1")).completion.values, ["1"]);
    assert.deepEqual((await complete("9")).completion.values, []);
    for (const suffix of ["", "/1"]) {
      const result = await client.readResource({
        uri: `iracing://${definition.name}${suffix}`,
      });
      const document = JSON.parse(result.contents[0].text);
      const entity = { [definition.idField]: 1 };
      assert.deepEqual(document, suffix ? entity : [entity]);
    }
    const before = reads;
    await assert.rejects(
      client.readResource({
        uri: `iracing://${definition.name}/invalid`,
      }),
      { code: -32602 },
    );
    assert.equal(reads, before);
    await assert.rejects(
      client.readResource({
        uri: `iracing://${definition.name}/999`,
      }),
      { code: -32602, data: { uri: `iracing://${definition.name}/999` } },
    );
  }
  expanded = true;
  const completion = await client.complete({
    ref: { type: "ref/resource", uri: "iracing://cars/{car_id}" },
    argument: { name: "car_id", value: "" },
  });
  assert.equal(completion.completion.values.length, 100);
  assert.equal(completion.completion.total, 151);
  assert.equal(completion.completion.hasMore, true);
  assert.equal(completion.completion.values[0], "0");
  assert.equal(completion.completion.values[99], "99");
  const prefix = await client.complete({
    ref: { type: "ref/resource", uri: "iracing://cars/{car_id}" },
    argument: { name: "car_id", value: "15" },
  });
  assert.deepEqual(prefix.completion.values, ["15", "150"]);
  assert.equal(prefix.completion.hasMore, false);
  fail = true;
  for (const suffix of ["", "/1"]) {
    await assert.rejects(
      client.readResource({ uri: `iracing://cars${suffix}` }),
      { code: -32603, message: /Unable to load reference catalog/ },
    );
  }
  await assert.rejects(
    client.complete({
      ref: { type: "ref/resource", uri: "iracing://cars/{car_id}" },
      argument: { name: "car_id", value: "1" },
    }),
    { code: -32603, message: /Unable to load reference catalog/ },
  );
});
