const assert = require("node:assert/strict");
const test = require("node:test");

const payload = {
  tracks: [{ track_id: 1, logo: "/img/tracks/1.png", unknown: ["preserved"] }],
};
const dist = "../dist/commands/assets/track";

function requestFailure(status) {
  const error = new Error("private upstream body and token");
  error.name = "ResponseError";
  error.response = { status };

  return error;
}

test("track schema fixes JSON output and accepts only credentials", async () => {
  const { OptionsSchema } = await import(`${dist}/schema.js`);

  assert.deepEqual(OptionsSchema.parse({}), { format: "json" });
  assert.deepEqual(OptionsSchema.parse({ credentials: "auth.json" }), {
    credentials: "auth.json",
    format: "json",
  });
  assert.throws(() => OptionsSchema.parse({ output: "target.json" }));
});

test("assets help exposes track without registration I/O", async () => {
  const { createAssetsCommand } =
    await import("../dist/commands/assets/index.js");
  const never = {
    async execute() {
      assert.fail("unexpected invocation");
    },
  };
  const command = createAssetsCommand({
    carService: never,
    seriesService: never,
    trackService: never,
  });

  assert.match(command.helpInformation(), /\btrack\b/);
  assert.deepEqual(
    command.commands.map((leaf) => leaf.name()),
    ["car", "series", "track"],
  );
});

test("track Commander validates and delegates", async () => {
  const { createTrackAssetsCommand } = await import(`${dist}/command.js`);
  const calls = [];
  const command = createTrackAssetsCommand({
    async execute(options) {
      calls.push(options);
    },
  });

  assert.equal(calls.length, 0);
  await command.parseAsync(["--credentials", "auth.json"], {
    from: "user",
  });
  assert.deepEqual(calls, [{ credentials: "auth.json", format: "json" }]);

  const invalid = createTrackAssetsCommand({
    execute: async () => assert.fail("unexpected execution"),
  }).exitOverride();

  await assert.rejects(
    invalid.parseAsync(["--format", "yaml"], { from: "user" }),
  );
});

test("track method runs once, link materializes once, output retains JSON", async (t) => {
  const { makeTrackAssetsService } = await import(`${dist}/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { TrackApi } = await import("@iracing-data/api-client-fetch");
  const link = "https://assets.example.test/track.json?opaque=signed";
  const events = [];
  const method = t.mock.method(
    TrackApi.prototype,
    "getTrackAssets",
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
      events.push(["token", options.credentials]);

      return "synthetic";
    },
    async writeDocumentOutput(value, options) {
      events.push(["stdout", JSON.stringify(value, null, 2) + "\n", options]);
    },
  });
  let materializations = 0;
  const service = makeTrackAssetsService(requests, async (received) => {
    materializations++;
    assert.equal(received, link);

    return payload;
  });

  await service.execute({ credentials: "auth.json", format: "json" });
  assert.equal(method.mock.callCount(), 1);
  assert.equal(materializations, 1);
  assert.deepEqual(events, [
    ["token", "auth.json"],
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
    ["diagnostics", "Track assets fetched."],
  ]);
});

test("track generated failures map safely, linked-data failures do not", async (t) => {
  const { makeTrackAssetsService } = await import(`${dist}/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { DataApiRequestError } = await import("../dist/errors.js");
  const { TrackApi } = await import("@iracing-data/api-client-fetch");
  let upstream;
  const method = t.mock.method(
    TrackApi.prototype,
    "getTrackAssets",
    async () => {
      throw upstream;
    },
  );
  const requests = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => "synthetic",
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  const service = makeTrackAssetsService(requests, async () =>
    assert.fail("unexpected materialization"),
  );

  for (const error of [
    requestFailure(401),
    requestFailure(403),
    requestFailure(429),
    requestFailure(503),
    new Error("private network failure"),
  ]) {
    upstream = error;
    await assert.rejects(service.execute({ format: "json" }), (mapped) => {
      assert.ok(mapped instanceof DataApiRequestError);
      assert.equal(mapped.cause, error);
      assert.match(mapped.message, /track assets request failed/);
      assert.doesNotMatch(mapped.message, /private|upstream body/);

      return true;
    });
  }
  assert.equal(method.mock.callCount(), 5);
  method.mock.restore();

  const safeFailure = new Error(
    "Asset payload request failed with HTTP 502. Retry the command to obtain a fresh link.",
  );
  const successfulMethod = t.mock.method(TrackApi.prototype, "getTrackAssets", async () => ({
    link: "https://assets.example.test/track",
    expires: new Date("2030-01-01"),
  }));
  const materializer = makeTrackAssetsService(requests, async () => {
    throw safeFailure;
  });

  await assert.rejects(
    materializer.execute({ format: "json" }),
    (error) => error === safeFailure,
  );
  assert.equal(successfulMethod.mock.callCount(), 1);
});

test("track invalid credentials fail before the generated API request", async (t) => {
  const { makeTrackAssetsService } = await import(`${dist}/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { TrackApi } = await import("@iracing-data/api-client-fetch");
  const method = t.mock.method(
    TrackApi.prototype,
    "getTrackAssets",
    async () => assert.fail("unexpected request"),
  );
  const failure = new Error("invalid credentials");
  const requests = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    async resolveAccessToken() {
      throw failure;
    },
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  const service = makeTrackAssetsService(
    requests,
    async () => assert.fail("unexpected materialization"),
  );

  await assert.rejects(
    service.execute({ format: "json" }),
    (error) => error === failure,
  );
  assert.equal(method.mock.callCount(), 0);
});
