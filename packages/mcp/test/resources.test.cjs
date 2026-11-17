const assert = require("node:assert/strict");
const test = require("node:test");

const unexpectedSelection = () => {
  throw new Error("Resource requests must not select tool services");
};

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
  const definitions = [CarsCatalog, TracksCatalog, CarClassesCatalog];
  const catalogs = definitions.map((definition) => {
    const entity = { [definition.idField]: 1 };
    return createReferenceResource(definition, {
      all: async () => {
        reads++;
        return [entity];
      },
      get: async (id) => {
        reads++;
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
  for (const definition of definitions) {
    for (const suffix of ["", "/1"]) {
      const result = await client.readResource({
        uri: `iracing://${definition.name}${suffix}`,
      });
      const document = JSON.parse(result.contents[0].text);
      const entity = { [definition.idField]: 1 };
      assert.deepEqual(document.data, suffix ? entity : [entity]);
      assert.equal(
        document.schema.$schema,
        "https://json-schema.org/draft/2020-12/schema",
      );
    }
    const before = reads;
    await assert.rejects(
      client.readResource({
        uri: `iracing://${definition.name}/invalid`,
      }),
    );
    assert.equal(reads, before);
    await assert.rejects(
      client.readResource({
        uri: `iracing://${definition.name}/999`,
      }),
    );
  }
});
