const assert = require("node:assert/strict");
const { test } = require("node:test");

test("host configuration is a Zod parse and transform with defaults", async () => {
  const { RuntimeEnvironmentSchema, parseRuntimeConfig } =
    await import("../dist/index.js");

  assert.equal(typeof RuntimeEnvironmentSchema.parse, "function");

  assert.deepEqual(
    RuntimeEnvironmentSchema.parse({}),
    parseRuntimeConfig({}),
  );
  assert.equal(parseRuntimeConfig({}).host, "127.0.0.1");
  assert.equal(parseRuntimeConfig({}).port, 3000);
});
