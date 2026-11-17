const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const payloads = {
  categories: [{ label: "Example", value: 5, extra: { kept: true } }],
  "event-types": [{ label: "Race", value: 5 }],
  divisions: [
    { label: "ALL", value: -1 },
    { label: "Division 1", value: 0 },
  ],
  licenses: [
    {
      license_group: 1,
      group_name: "Example",
      levels: [{ license_id: 4, extra: true }],
    },
  ],
};

async function directory(t) {
  const value = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-reference-documents-"),
  );
  t.after(() => fs.rm(value, { recursive: true, force: true }));
  return value;
}

test("reference adapters distinguish direct constants from unsigned linked licenses and reuse snapshots", async (t) => {
  const { createReferenceDocuments } = await import("../dist/index.js");
  const folder = await directory(t);
  const requests = [];
  let tokens = 0;
  const fetchApi = async (input, init) => {
    const url = new URL(input);
    requests.push(url.href);
    const auth = new Headers(init.headers).get("authorization");
    if (url.host === "members-ng.iracing.com") {
      assert.equal(auth, "Bearer TEST_TOKEN");
      if (url.pathname === "/data/lookup/licenses") {
        return Response.json({
          link: "https://cache.example.test/licenses",
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      }
      const name = url.pathname.split("/").at(-1).replaceAll("_", "-");
      assert.ok(Object.hasOwn(payloads, name));
      return Response.json(payloads[name]);
    }
    assert.equal(url.href, "https://cache.example.test/licenses");
    assert.equal(auth, null);
    assert.equal(init.redirect, "error");
    return Response.json(payloads.licenses);
  };
  const create = () =>
    createReferenceDocuments(
      folder,
      async () => {
        tokens++;
        return "TEST_TOKEN";
      },
      fetchApi,
    );
  const documents = create();
  assert.equal(requests.length, 0);
  for (const document of documents) {
    assert.ok(document.schemas[0].document.$schema);
    const [first, second] = await Promise.all([
      document.read(),
      document.read(),
    ]);
    assert.deepEqual(first, payloads[document.name]);
    assert.strictEqual(first, second);
    await fs.writeFile(
      path.join(folder, `${document.name}.json`),
      "invalid JSON",
    );
    assert.strictEqual(await document.read(), first);
    await fs.writeFile(
      path.join(folder, `${document.name}.json`),
      JSON.stringify(first),
    );
  }
  assert.equal(tokens, 4);
  assert.equal(requests.length, 5);
  for (const document of create()) {
    assert.deepEqual(await document.read(), payloads[document.name]);
  }
  assert.equal(requests.length, 5);
});

test("invalid reference payloads are not persisted and failed loads can retry", async (t) => {
  const { createReferenceDocuments } = await import("../dist/index.js");
  const folder = await directory(t);
  let requests = 0;
  const [categories] = createReferenceDocuments(
    folder,
    async () => "TEST_TOKEN",
    async () => {
      requests++;
      return Response.json(
        requests === 1 ? [{ label: "Bad", value: "1" }] : payloads.categories,
      );
    },
  );
  await assert.rejects(categories.read());
  await assert.rejects(fs.access(path.join(folder, "categories.json")), {
    code: "ENOENT",
  });
  assert.deepEqual(await categories.read(), payloads.categories);
  assert.equal(requests, 2);
});

test("HTTP exposes injected reference documents and their schemas lazily", async (t) => {
  const { createReferenceDocuments, createHttpTransport, createMcpServices } =
    await import("../dist/index.js");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  const folder = await directory(t);
  const documents = createReferenceDocuments(folder, async () => {
    assert.fail("Snapshot and schema reads must not authenticate");
  });
  const handler = createHttpTransport({
    documents,
    services: createMcpServices(() => capabilities("success")),
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
  assert.equal((await rpc("resources/list")).resources.length, 8);
  for (const [name, payload] of Object.entries(payloads)) {
    const schema = await rpc("resources/read", {
      uri: `iracing://schemas/${name}`,
    });
    assert.equal(schema.contents[0].mimeType, "application/schema+json");
    await fs.writeFile(
      path.join(folder, `${name}.json`),
      JSON.stringify(payload),
    );
    const result = await rpc("resources/read", { uri: `iracing://${name}` });
    assert.deepEqual(JSON.parse(result.contents[0].text), payload);
  }
});
