const assert = require("node:assert/strict");
const test = require("node:test");

function requestBody() {
  return {
    method: "POST",
    headers: {
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
