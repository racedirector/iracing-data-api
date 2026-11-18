const assert = require("node:assert/strict");
const test = require("node:test");

const unexpected = () => {
  throw new Error("No tool selection expected");
};

function schemaRoot(document) {
  if (!document.$ref) return document;
  assert.match(document.$ref, /^#\/\$defs\//);
  const root = document.$defs[document.$ref.split("/").at(-1)];
  assert.ok(root, "The standalone schema must include its root reference");
  return root;
}

async function connect(t, options) {
  const { createIracingMcpServer } = await import("../dist/index.js");
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  const server = createIracingMcpServer({
    serverInfo: { name: "reference-documents-test", version: "1" },
    services: {
      getDriverQueries: unexpected,
      getRecentRaceQueries: unexpected,
      getRaceSearchQueries: unexpected,
    },
    ...options,
  });
  const client = new Client({
    name: "reference-documents-client",
    version: "1",
  });
  const [left, right] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await server.connect(left);
  await client.connect(right);
  return client;
}

test("small reference documents return raw payloads and expose separate schemas without loading data", async (t) => {
  const { ReferenceDocuments, createReferenceDocumentResource } =
    await import("../dist/index.js");
  let reads = 0;
  const payloads = {
    categories: [{ label: "Example", value: 5, extra: true }],
    "event-types": [{ label: "Race", value: 5 }],
    divisions: [
      { label: "ALL", value: -1 },
      { label: "Division 1", value: 0 },
    ],
    licenses: [
      { license_group: 1, group_name: "Example", levels: [{ license_id: 4 }] },
    ],
  };
  const documents = Object.values(ReferenceDocuments).map((definition) =>
    createReferenceDocumentResource(definition, async () => {
      reads++;
      return payloads[definition.name];
    }),
  );
  const client = await connect(t, { documents });
  const resources = (await client.listResources()).resources;
  assert.equal(resources.length, 8);
  assert.equal(reads, 0);
  for (const document of documents) {
    const schema = await client.readResource({
      uri: `iracing://schemas/${document.name}`,
    });
    assert.equal(schema.contents[0].mimeType, "application/schema+json");
    const body = JSON.parse(schema.contents[0].text);
    assert.ok(body.$schema);
    assert.equal(schemaRoot(body).type, "array");
    assert.equal(body.data, undefined);
    assert.equal(reads, 0);
  }
  for (const document of documents) {
    const result = await client.readResource({
      uri: `iracing://${document.name}`,
    });
    assert.deepEqual(
      JSON.parse(result.contents[0].text),
      payloads[document.name],
    );
  }
  assert.equal(reads, 4);
});

test("catalog and asset schemas are standalone, lazy and limited to host-selected resources", async (t) => {
  const {
    SeriesCatalog,
    createReferenceResource,
    AssetDefinitions,
    createAssetResource,
  } = await import("../dist/index.js");
  const noRead = async () => {
    assert.fail("Schema reads must not load data");
  };
  const catalog = createReferenceResource(SeriesCatalog, {
    all: noRead,
    get: noRead,
  });
  const asset = createAssetResource(AssetDefinitions.series, {
    all: noRead,
    get: noRead,
  });
  const client = await connect(t, {
    catalogs: [catalog],
    assets: { catalogs: [asset], readMedia: noRead },
  });
  const resources = (await client.listResources()).resources;
  const schemas = resources.filter(
    (resource) => resource.mimeType === "application/schema+json",
  );
  assert.deepEqual(
    schemas.map((resource) => resource.uri),
    [
      "iracing://schemas/series",
      "iracing://schemas/series/entity",
      "iracing://schemas/assets/series",
      "iracing://schemas/assets/series/entity",
      "iracing://schemas/assets/series/media",
    ],
  );
  for (const schema of schemas) {
    assert.match(schema.description, /not an exhaustive upstream contract/);
    const result = await client.readResource({ uri: schema.uri });
    const body = JSON.parse(result.contents[0].text);
    assert.ok(body.$schema);
    assert.ok(schemaRoot(body).type);
  }
  assert.equal(
    resources.some((resource) => resource.uri.includes("cars")),
    false,
  );
});

test("document loader errors are sanitized without leaking credentials or disk paths", async (t) => {
  const client = await connect(t, {
    documents: [
      {
        name: "categories",
        title: "Categories",
        description: "Reference",
        read: async () => {
          throw new Error("secret token /private/credentials.json");
        },
      },
    ],
  });
  await assert.rejects(
    client.readResource({ uri: "iracing://categories" }),
    (error) => {
      assert.equal(error.code, -32603);
      assert.match(error.message, /Unable to load reference document/);
      assert.doesNotMatch(error.message, /secret|private|credentials/);
      return true;
    },
  );
});

test("media indexes enumerate only safe selectors as MCP URIs without downloading media", async () => {
  const { createAssetMediaIndex, AssetMediaIndexSchema } =
    await import("../dist/index.js");
  const catalog = { kind: "tracks", idField: "track_id" };
  const index = createAssetMediaIndex(catalog, 21, {
    track_id: 21,
    small_image: "/img/tracks/small.png",
    large_image: null,
    logo: "https://evil.test/logo.png",
    track_map: "https://members-assets.iracing.com/public/track-maps/example/",
    track_map_layers: {
      turns: "turns.svg",
      active: "active.svg",
      escape: "../escape.svg",
    },
  });
  assert.deepEqual(AssetMediaIndexSchema.parse(index), {
    kind: "tracks",
    id: 21,
    images: [
      { field: "small_image", uri: "iracing://images/tracks/21/small_image" },
    ],
    track_maps: [
      {
        layer: "active",
        uri: "iracing://track-maps/21/active",
        mimeType: "image/svg+xml",
      },
      {
        layer: "turns",
        uri: "iracing://track-maps/21/turns",
        mimeType: "image/svg+xml",
      },
    ],
  });
  assert.deepEqual(
    createAssetMediaIndex({ kind: "cars", idField: "car_id" }, 1, {
      car_id: 1,
    }),
    {
      kind: "cars",
      id: 1,
      images: [],
      track_maps: [],
    },
  );
});
