const assert = require("node:assert/strict");
const test = require("node:test");
const { iracingClientMiddleware } = require("../dist/middleware.js");

test("middleware still requires headers after widening input options", async () => {
  await assert.rejects(iracingClientMiddleware({}), /Headers is required/);
});

test("middleware constructs clients with the supplied bearer token offline", async () => {
  const result = await iracingClientMiddleware({
    headers: new Headers({ "X-IRACING-ACCESS-TOKEN": "test-token" }),
  });
  assert.equal(
    await result.iracing.car.configuration.accessToken(),
    "test-token",
  );
});
