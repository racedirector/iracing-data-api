const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

async function connect(t, catalogs) {
  const { registerReferenceResources } = await import("@iracing-data/mcp");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");
  const server = new McpServer({ name: "catalog-test", version: "1" });
  registerReferenceResources(server, catalogs);
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

const datasets = [
  { name: "cars", endpoint: "/data/car/get", id: "car_id", title: "car_name" },
  {
    name: "tracks",
    endpoint: "/data/track/get",
    id: "track_id",
    title: "track_name",
  },
  {
    name: "car-classes",
    endpoint: "/data/carclass/get",
    id: "car_class_id",
    title: "name",
  },
];

test("HTTP exposes the same lazy reference collections and templates", async (t) => {
  const { createHttpTransport, createMcpServices, createReferenceCatalogs } =
    await import("../dist/index.js");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-http-catalog-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const catalogs = createReferenceCatalogs(directory, async () => {
    throw new Error("Discovery and snapshot reads must not authenticate");
  });
  const handler = createHttpTransport({
    services: createMcpServices(() => capabilities("success")),
    catalogs,
    serveOptions: {},
  });
  async function rpc(method, params) {
    const response = await handler.fetch(
      new Request("http://localhost/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      }),
    );
    assert.equal(response.status, 200);
    const text = await response.text();
    const message = JSON.parse(
      text.startsWith("event:") || text.startsWith("data:")
        ? text
            .split("\n")
            .find((line) => line.startsWith("data:"))
            .slice(5)
        : text,
    );
    assert.equal(message.error, undefined);
    return message.result;
  }
  assert.deepEqual(
    (await rpc("resources/list")).resources.map((entry) => entry.uri),
    datasets.map((entry) => `iracing://${entry.name}`),
  );
  assert.deepEqual(
    (await rpc("resources/templates/list")).resourceTemplates.map(
      (entry) => entry.uriTemplate,
    ),
    datasets.map((entry) => `iracing://${entry.name}/{${entry.id}}`),
  );
  for (const dataset of datasets) {
    const entity = { [dataset.id]: 17, [dataset.title]: "Example" };
    await fs.writeFile(
      path.join(directory, `${dataset.name}.json`),
      JSON.stringify([entity]),
    );
    const completion = await rpc("completion/complete", {
      ref: {
        type: "ref/resource",
        uri: `iracing://${dataset.name}/{${dataset.id}}`,
      },
      argument: { name: dataset.id, value: "1" },
    });
    assert.deepEqual(completion.completion.values, ["17"]);
    for (const suffix of ["", "/17"]) {
      const result = await rpc("resources/read", {
        uri: `iracing://${dataset.name}${suffix}`,
      });
      assert.deepEqual(
        JSON.parse(result.contents[0].text),
        suffix ? entity : [entity],
      );
    }
  }
});

test("all reference catalogs share discovery, hydration, indexing and restart reuse", async (t) => {
  const { createReferenceCatalogs } =
    await import("../dist/adapters/catalog.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const requests = [];
  const payloads = Object.fromEntries(
    datasets.map((dataset) => [
      dataset.name,
      [1, 2, 3].map((id) => ({
        [dataset.id]: id,
        [dataset.title]: `${dataset.name} ${id}`,
        upstream_extra: { preserved: true },
      })),
    ]),
  );
  const fetchApi = async (input, init) => {
    const url = new URL(input);
    const authorization = new Headers(init.headers).get("authorization");
    requests.push(url.href);
    if (url.host === "members-ng.iracing.com") {
      assert.equal(authorization, "Bearer TEST_TOKEN");
      const dataset = datasets.find((entry) => entry.endpoint === url.pathname);
      assert.ok(dataset);
      return Response.json({
        link: `https://cache.example.test/${dataset.name}`,
        expires: new Date(Date.now() + 900000).toISOString(),
      });
    }
    assert.equal(authorization, null);
    assert.equal(init.redirect, "error");
    return Response.json(payloads[url.pathname.slice(1)]);
  };
  const createCatalogs = () =>
    createReferenceCatalogs(directory, async () => "TEST_TOKEN", fetchApi);
  const client = await connect(t, createCatalogs());
  const resources = (await client.listResources()).resources;
  assert.deepEqual(
    resources.map((resource) => resource.uri),
    datasets.map((entry) => `iracing://${entry.name}`),
  );
  assert.ok(
    resources.every((resource) => resource.description.includes("Resolve")),
  );
  assert.deepEqual(
    (await client.listResourceTemplates()).resourceTemplates.map(
      (entry) => entry.uriTemplate,
    ),
    datasets.map((entry) => `iracing://${entry.name}/{${entry.id}}`),
  );
  assert.equal(
    requests.length,
    0,
    "discovery never requires authentication or hydration",
  );
  for (const dataset of datasets) {
    const results = await Promise.all([
      client.readResource({ uri: `iracing://${dataset.name}` }),
      ...[1, 2, 3].map((id) =>
        client.readResource({ uri: `iracing://${dataset.name}/${id}` }),
      ),
    ]);
    assert.deepEqual(
      JSON.parse(results[0].contents[0].text),
      payloads[dataset.name],
    );
    for (let i = 1; i <= 3; i++) {
      assert.deepEqual(
        JSON.parse(results[i].contents[0].text),
        payloads[dataset.name][i - 1],
      );
    }
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(path.join(directory, `${dataset.name}.json`), "utf8"),
      ),
      payloads[dataset.name],
    );
    for (const id of ["0", "abc", "9007199254740992", "999"]) {
      await assert.rejects(
        client.readResource({ uri: `iracing://${dataset.name}/${id}` }),
      );
    }
  }
  assert.equal(
    requests.length,
    6,
    "one API call and one signed download per catalog",
  );
  const restarted = await connect(t, createCatalogs());
  for (const dataset of datasets) {
    const result = await restarted.readResource({
      uri: `iracing://${dataset.name}/2`,
    });
    assert.deepEqual(
      JSON.parse(result.contents[0].text),
      payloads[dataset.name][1],
    );
  }
  assert.equal(requests.length, 6, "restart uses snapshots, not the API");
});

test("invalid hydration is not persisted and can be retried", async (t) => {
  const { createReferenceCatalogs } =
    await import("../dist/adapters/catalog.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  for (const dataset of datasets) {
    let downloads = 0;
    const catalogs = createReferenceCatalogs(
      directory,
      async () => "TEST_TOKEN",
      async (input) => {
        if (new URL(input).host === "members-ng.iracing.com") {
          return Response.json({
            link: "https://cache.example.test/data",
            expires: new Date(Date.now() + 900000).toISOString(),
          });
        }
        downloads++;
        return Response.json(
          downloads === 1
            ? [{ [dataset.id]: 1 }]
            : [{ [dataset.id]: 1, [dataset.title]: "Example" }],
        );
      },
    );
    const catalog = catalogs.find((entry) => entry.name === dataset.name);
    await assert.rejects(catalog.resolver.all());
    await assert.rejects(
      fs.access(path.join(directory, `${dataset.name}.json`)),
      { code: "ENOENT" },
    );
    assert.ok(await catalog.resolver.get(1));
    assert.equal(downloads, 2);
  }
});

test("shared index rejects duplicate or invalid IDs and retries", async () => {
  const { createCatalogResolver } = await import("../dist/catalog.js");
  let attempts = 0;
  const resolver = createCatalogResolver(
    async () => {
      attempts++;
      return attempts === 1 ? [{ id: 1 }, { id: 1 }] : [{ id: 2 }];
    },
    (entry) => entry.id,
  );
  await assert.rejects(resolver.all(), /duplicate catalog ID/);
  assert.deepEqual(await resolver.get(2), { id: 2 });
  assert.equal(await resolver.get(999), null);
});

test("car class zero is a valid upstream entity ID", async (t) => {
  const { createReferenceCatalogs } =
    await import("../dist/adapters/catalog.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(
    path.join(directory, "car-classes.json"),
    JSON.stringify([{ car_class_id: 0, name: "All Cars" }]),
  );
  const catalogs = createReferenceCatalogs(directory, async () => {
    throw new Error("No auth expected");
  });
  const client = await connect(t, catalogs);
  assert.deepEqual(
    JSON.parse(
      (await client.readResource({ uri: "iracing://car-classes/0" }))
        .contents[0].text,
    ),
    { car_class_id: 0, name: "All Cars" },
  );
});

test("actual stdio entrypoint loads snapshots lazily and caches parsed JSON across requests", async (t) => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const { localSession } = require("./fixtures/local-session.cjs");
  const { directory, file, env } = await localSession(t);
  const reference = path.join(directory, "reference");
  await fs.mkdir(reference);
  for (const dataset of datasets) {
    await fs.writeFile(
      path.join(reference, `${dataset.name}.json`),
      JSON.stringify([
        { [dataset.id]: 1, [dataset.title]: "Not read during discovery" },
      ]),
    );
  }
  const client = new Client({ name: "stdio-catalog-test", version: "1" });
  t.after(() => client.close());
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [
        path.resolve(__dirname, "../dist/main.js"),
        "serve",
        "--credentials",
        file,
      ],
      stderr: "inherit",
      env,
    }),
  );
  assert.equal((await client.listResources()).resources.length, 3);
  assert.equal(
    (await client.listResourceTemplates()).resourceTemplates.length,
    3,
  );
  // Files changed after discovery must be observed on the first read.
  for (const dataset of datasets) {
    await fs.writeFile(
      path.join(reference, `${dataset.name}.json`),
      JSON.stringify([{ [dataset.id]: 17, [dataset.title]: "Example" }]),
    );
  }
  for (const dataset of datasets) {
    const collectionResponse = JSON.parse(
      (await client.readResource({ uri: `iracing://${dataset.name}` }))
        .contents[0].text,
    );
    // Independent requests reuse parsed memory rather than rereading disk.
    await fs.writeFile(
      path.join(reference, `${dataset.name}.json`),
      "invalid JSON",
    );
    const entityResponse = JSON.parse(
      (await client.readResource({ uri: `iracing://${dataset.name}/17` }))
        .contents[0].text,
    );
    assert.deepEqual(collectionResponse, [entityResponse]);
    assert.deepEqual(entityResponse, {
      [dataset.id]: 17,
      [dataset.title]: "Example",
    });
  }
});
