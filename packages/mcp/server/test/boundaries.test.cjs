const assert = require("node:assert/strict");
const test = require("node:test");

test("server factory keeps MCP servers request scoped", async () => {
  const { createMcpServer } = await import("../dist/index.js");
  const services = {
    getDataApiGateway: () => undefined,
  };
  const options = {
    config: { name: "iracing-data-mcp", version: "0.0.0" },
    services,
  };

  const first = createMcpServer(options);
  const second = createMcpServer(options);

  assert.notStrictEqual(first, second);
});
