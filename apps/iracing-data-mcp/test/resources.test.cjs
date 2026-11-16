const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("MCP lists cars and reads the same file-backed catalog across restarts", async (t) => {
  const { createFileBackedResolver, registerReferenceResources } =
    await import("../dist/resources.js");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");

  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "reference", "cars.json");
  let fetches = 0;
  const load = async () => {
    fetches++;
    return [{ car_id: 1 }];
  };
  const resolve = createFileBackedResolver(file, load);
  const server = new McpServer({ name: "catalog-test", version: "1" });
  registerReferenceResources(server, new Map([["cars", resolve]]));

  const client = new Client({ name: "catalog-client", version: "1" });
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const listed = await client.listResources();
  assert.deepEqual(listed.resources.map((resource) => resource.uri), [
    "iracing://reference/cars",
  ]);
  assert.equal(fetches, 0);

  const read = () => client.readResource({ uri: "iracing://reference/cars" });
  const [first, concurrent] = await Promise.all([read(), read()]);
  assert.deepEqual(JSON.parse(first.contents[0].text), [{ car_id: 1 }]);
  assert.deepEqual(concurrent, first);
  assert.equal(fetches, 1);
  assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), [{ car_id: 1 }]);

  const reopened = createFileBackedResolver(file, load);
  assert.deepEqual(await reopened(), [{ car_id: 1 }]);
  assert.equal(fetches, 1);
});

test("failed hydration leaves no snapshot and may be retried", async (t) => {
  const { createFileBackedResolver } = await import("../dist/resources.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  let attempts = 0;
  const resolve = createFileBackedResolver(file, async () => {
    attempts++;

    if (attempts === 1) {
      throw new Error("upstream unavailable");
    }

    return [{ car_id: 2 }];
  });

  await assert.rejects(resolve(), /upstream unavailable/);
  await assert.rejects(fs.access(file), { code: "ENOENT" });
  assert.deepEqual(await resolve(), [{ car_id: 2 }]);
});

test("car resolver materializes the linked payload without forwarding credentials", async () => {
  const { createCarCatalogLoader } = await import("../dist/adapters/catalog.js");
  const calls = [];
  const load = createCarCatalogLoader(
    async () => "TEST_TOKEN",
    async (input, init) => {
      const url = new URL(input);
      calls.push({ host: url.host, auth: new Headers(init.headers).get("authorization") });

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
