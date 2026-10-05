const assert = require("node:assert/strict");
const test = require("node:test");

async function moduleUnderTest() {
  return import("../dist/index.js");
}

test("application config has stable private-app defaults", async () => {
  const { parseMcpApplicationConfig } = await moduleUnderTest();

  assert.deepEqual(parseMcpApplicationConfig(), {
    name: "iracing-data-mcp",
    version: "0.0.0",
  });
  assert.throws(() =>
    parseMcpApplicationConfig({ name: "", version: "0.0.0" }),
  );
});

test("server factory keeps MCP servers request scoped", async () => {
  const { createMcpServer, parseMcpApplicationConfig } =
    await moduleUnderTest();
  const services = {
    oauthClient: {},
    dataApiConfiguration: {},
  };
  const options = {
    config: parseMcpApplicationConfig(),
    services,
  };

  const first = createMcpServer(options);
  const second = createMcpServer(options);

  assert.notStrictEqual(first, second);
});
