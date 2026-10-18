const assert = require("node:assert/strict");
const test = require("node:test");

const payload = {
  series: [
    { series_id: 1, logo: "/img/series/1.png", unknown: { retain: true } },
  ],
};
const dist = "../dist/commands/assets/series";

function requestFailure(status) {
  const error = new Error("private upstream body and token");
  error.name = "ResponseError";
  error.response = { status };

  return error;
}

test("series schema fixes JSON output and accepts only credentials", async () => {
  const { OptionsSchema } = await import(`${dist}/schema.js`);

  assert.deepEqual(OptionsSchema.parse({}), { format: "json" });
  assert.deepEqual(OptionsSchema.parse({ credentials: "auth.json" }), {
    credentials: "auth.json",
    format: "json",
  });
  assert.throws(() => OptionsSchema.parse({ format: "yaml" }));
});

test("series Commander delegates without registration-time I/O", async () => {
  const { createSeriesAssetsCommand } = await import(`${dist}/command.js`);
  const calls = [];
  const command = createSeriesAssetsCommand({
    async execute(options) {
      calls.push(options);
    },
  });

  assert.equal(calls.length, 0);
  await command.parseAsync(["--credentials", "auth.json"], {
    from: "user",
  });
  assert.deepEqual(calls, [{ credentials: "auth.json", format: "json" }]);

  const invalid = createSeriesAssetsCommand({
    execute: async () => assert.fail("unexpected execution"),
  }).exitOverride();

  await assert.rejects(
    invalid.parseAsync(["--output", "payload.json"], { from: "user" }),
  );
});

test("series generated method and link materialization execute exactly once", async (t) => {
  const { makeSeriesAssetsService } = await import(`${dist}/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { SeriesApi } = await import("@iracing-data/api-client-fetch");
  const link = "https://assets.example.test/series.json?opaque=signed";
  const events = [];
  const method = t.mock.method(
    SeriesApi.prototype,
    "getSeriesAssets",
    async () => {
      events.push("generated");

      return { link, expires: new Date("2030-01-01") };
    },
  );
  const requests = makeDocumentRequestService({
    diagnostics: {
      info(message) {
        events.push(["diagnostics", message]);
      },
    },
    async resolveAccessToken(options) {
      events.push(["credentials", options.credentials]);

      return "synthetic-token";
    },
    async writeDocumentOutput(value, options) {
      events.push(["stdout", JSON.stringify(value, null, 2) + "\n", options]);
    },
  });
  let materializations = 0;
  const service = makeSeriesAssetsService(requests, async (received) => {
    materializations++;
    assert.equal(received, link);

    return payload;
  });

  await service.execute({ credentials: "auth.json", format: "json" });
  assert.equal(method.mock.callCount(), 1);
  assert.equal(materializations, 1);
  assert.deepEqual(events, [
    ["credentials", "auth.json"],
    "generated",
    [
      "stdout",
      JSON.stringify(payload, null, 2) + "\n",
      {
        credentials: "auth.json",
        format: "json",
        outputLabel: "Assets",
      },
    ],
    ["diagnostics", "Series assets fetched."],
  ]);
});

test("series API errors retain causes without materialization or publication", async (t) => {
  const { makeSeriesAssetsService } = await import(`${dist}/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { DataApiRequestError } = await import("../dist/errors.js");
  const { SeriesApi } = await import("@iracing-data/api-client-fetch");
  let failure;
  const method = t.mock.method(
    SeriesApi.prototype,
    "getSeriesAssets",
    async () => {
      throw failure;
    },
  );
  const requests = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => "synthetic",
    writeDocumentOutput: async () => assert.fail("unexpected publication"),
  });
  const service = makeSeriesAssetsService(requests, async () =>
    assert.fail("unexpected materialization"),
  );

  for (const error of [
    requestFailure(401),
    requestFailure(403),
    requestFailure(429),
    requestFailure(503),
    new Error("private network detail"),
  ]) {
    failure = error;
    await assert.rejects(service.execute({ format: "json" }), (mapped) => {
      assert.ok(mapped instanceof DataApiRequestError);
      assert.equal(mapped.cause, error);
      assert.match(mapped.message, /series assets request failed/);
      assert.doesNotMatch(mapped.message, /private|upstream body/);

      return true;
    });
  }
  assert.equal(method.mock.callCount(), 5);
  method.mock.restore();

  const postFetch = new Error(
    "Asset payload response was not JSON. No response body logged.",
  );
  const success = t.mock.method(
    SeriesApi.prototype,
    "getSeriesAssets",
    async () => ({
      link: "https://assets.example.test/series",
      expires: new Date("2030-01-01"),
    }),
  );
  const materializer = makeSeriesAssetsService(requests, async () => {
    throw postFetch;
  });

  await assert.rejects(
    materializer.execute({ format: "json" }),
    (error) => error === postFetch,
  );
  assert.equal(success.mock.callCount(), 1);
});

test("series invalid credentials stop before the generated request", async (t) => {
  const { makeSeriesAssetsService } = await import(`${dist}/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { SeriesApi } = await import("@iracing-data/api-client-fetch");
  const method = t.mock.method(
    SeriesApi.prototype,
    "getSeriesAssets",
    async () => assert.fail("unexpected API call"),
  );
  const failure = new Error("invalid credential");
  const requests = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => {
      throw failure;
    },
    writeDocumentOutput: async () => assert.fail("unexpected publication"),
  });
  const service = makeSeriesAssetsService(requests, async () =>
    assert.fail("unexpected materialization"),
  );

  await assert.rejects(
    service.execute({ format: "json" }),
    (error) => error === failure,
  );
  assert.equal(method.mock.callCount(), 0);
});
