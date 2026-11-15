const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

test("Zod applies environment defaults and maps directly to runtime options", async () => {
  const { parseConfig, EnvironmentSchema } = await import("../dist/config.js");
  const config = parseConfig({});
  assert.deepEqual(EnvironmentSchema.parse({}), config);
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 3000);
  assert.equal(
    config.credentialsFile,
    path.resolve(
      __dirname,
      "../../../.iracing-data/iracing-data-mcp/credentials.json",
    ),
  );
  assert.equal(parseConfig({ IRACING_MCP_PORT: "4555" }).port, 4555);
  for (const invalid of [
    { IRACING_MCP_PORT: "0" },
    { IRACING_MCP_PORT: "not-a-number" },
    { IRACING_MCP_CREDENTIAL_FILE: "" },
  ]) {
    assert.throws(() => parseConfig(invalid));
  }
});

test("local stdio capabilities are constructed lazily without network calls", async () => {
  const { createCliCapabilities } = await import("../dist/credentials.js");
  const queries = createCliCapabilities(
    "/tmp/unconfigured-iracing-mcp-test-token.json",
  );
  assert.equal(typeof queries.driverQueries.getCurrent, "function");
  assert.equal(typeof queries.recentRaceQueries.getRecent, "function");
});
