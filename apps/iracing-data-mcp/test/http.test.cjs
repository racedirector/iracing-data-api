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

test("public HTTP handler can be mounted at any exact path", async () => {
  const { Hono } = await import("hono");
  const { createHttpTransport, createMcpServices } =
    await import("../dist/index.js");
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
  const { createMcpRouter } = await import("../dist/cli/router.js");
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
  const { createMcpRouter } = await import("../dist/cli/router.js");
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
