const assert = require("node:assert/strict");
const test = require("node:test");

function requestBody() {
  return {
    method: "POST",
    headers: {
      host: "localhost",
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "get_my_driver", arguments: {} },
    }),
  };
}

test("standalone router isolates overlapping protocol requests", async () => {
  const { createMcpRouter, createMcpServices } =
    await import("./fixtures/runtime.mjs");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  let selections = 0;
  const app = createMcpRouter({
    services: createMcpServices(() => {
      selections++;
      return capabilities("success");
    }),
  });
  const responses = await Promise.all(
    Array.from({ length: 8 }, () =>
      app.request("http://localhost/mcp", requestBody()),
    ),
  );
  for (const response of responses) {
    assert.equal(response.status, 200);
    assert.match(await response.text(), /cust_id/);
  }
  assert.equal(selections, 8);
});

test("public HTTP handler can be mounted at any exact path", async () => {
  const { Hono } = await import("hono");
  const { createHttpTransport, createMcpServices } =
    await import("./fixtures/runtime.mjs");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  for (const path of ["/", "/mcp", "/integrations/iracing"]) {
    const handler = createHttpTransport({
      services: createMcpServices(() => capabilities("success")),
      serveOptions: {},
    });
    const app = new Hono();
    app.all(path, (c) => handler.fetch(c.req.raw));
    const response = await app.request(
      `http://localhost${path}`,
      requestBody(),
    );
    assert.equal(response.status, 200);
    assert.match(await response.text(), /cust_id/);
  }
});

test("standalone router rejects nonlocal Host and Origin before selecting services", async () => {
  const { createMcpRouter } = await import("./fixtures/runtime.mjs");
  const { createMcpServices } = await import("../dist/index.js");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  let selections = 0;
  const app = createMcpRouter({
    services: createMcpServices(() => {
      selections++;
      return capabilities("success");
    }),
  });
  for (const headers of [
    { host: "attacker.example" },
    { host: "localhost.attacker.example" },
    { host: "localhost", origin: "https://attacker.example" },
    { host: "localhost", origin: "null" },
  ]) {
    const init = requestBody();
    Object.assign(init.headers, headers);
    const response = await app.request("http://localhost/mcp", init);
    assert.equal(response.status, 403);
  }
  assert.equal(selections, 0);
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    for (const origin of [undefined, `http://${host}:6274`]) {
      const init = requestBody();
      init.headers.host = `${host}:3000`;
      if (origin) init.headers.origin = origin;
      const response = await app.request(`http://${host}:3000/mcp`, init);
      assert.equal(response.status, 200, await response.text());
    }
  }
  assert.equal(selections, 6);
});

test("standalone app serves only /mcp and returns empty 404 elsewhere", async () => {
  const { createMcpRouter } = await import("./fixtures/runtime.mjs");
  const { createMcpServices } = await import("../dist/index.js");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  const app = createMcpRouter({
    services: createMcpServices(() => capabilities("success")),
  });
  assert.equal(
    (await app.request("http://localhost/mcp", requestBody())).status,
    200,
  );
  for (const path of ["/", "/mcp/mcp", "/health", "/other"]) {
    for (const method of ["GET", "POST"]) {
      const response = await app.request(`http://localhost${path}`, { method });
      assert.equal(response.status, 404);
      assert.equal(await response.text(), "");
    }
  }
});

test("HTTP reference lookup stays host-selected and rejects foreign origins before reading catalogs", async () => {
  const { createMcpRouter } = await import("./fixtures/runtime.mjs");
  const { createMcpServices } = await import("../dist/index.js");
  const { capabilities } = await import("./fixtures/capabilities.mjs");
  let reads = 0;
  const app = createMcpRouter({
    services: createMcpServices(() => capabilities("success"), {
      list: async () => {
        reads++;
        return {
          entries: [{ id: 120, name: "Selected host's series" }],
          metadata_available: false,
          assets_available: false,
        };
      },
    }),
  });
  const init = requestBody();
  init.body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "find_reference",
      arguments: { kind: "series", query: "120" },
    },
  });
  init.headers.origin = "https://attacker.example";
  assert.equal((await app.request("http://localhost/mcp", init)).status, 403);
  assert.equal(reads, 0);
  delete init.headers.origin;
  const response = await app.request("http://localhost/mcp", init);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Selected host's series/);
  assert.equal(reads, 1);
});
