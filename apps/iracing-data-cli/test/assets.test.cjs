const assert = require("node:assert/strict");
const test = require("node:test");

const ASSETS = {
  1: {
    logo: "/img/cars/example/logo.png",
    retained_unknown_field: ["preserve", "as-is"],
  },
};
const diagnostics = { info() {}, warn() {}, error() {} };
const assetsDist = "../dist/commands/assets";
const loadMaterializer = () =>
  import(`${assetsDist}/returned-data-api-link.js`);

function responseError(status) {
  const error = new Error("synthetic secret upstream body");
  error.name = "ResponseError";
  error.response = new Response("synthetic secret upstream body", { status });
  return error;
}

test("car schema accepts credentials only with fixed JSON output", async () => {
  const { OptionsSchema } = await import(`${assetsDist}/car/schema.js`);

  assert.deepEqual(OptionsSchema.parse({}), { format: "json" });
  assert.deepEqual(OptionsSchema.parse({ credentials: "auth.json" }), {
    credentials: "auth.json",
    format: "json",
  });
  assert.throws(() => OptionsSchema.parse({ format: "yaml" }));
  assert.throws(() => OptionsSchema.parse({ credentials: 42 }));
});

test("car Commander validates and dispatches without registration I/O", async () => {
  const { createCarAssetsCommand } = await import(`${assetsDist}/car/index.js`);
  const calls = [];
  const command = createCarAssetsCommand({
    async execute(options) {
      calls.push(options);
    },
  });

  assert.deepEqual(calls, []);
  await command.parseAsync(["--credentials", "auth.json"], {
    from: "user",
  });
  assert.deepEqual(calls, [{ credentials: "auth.json", format: "json" }]);

  const invalid = createCarAssetsCommand({
    execute: async () => assert.fail("unexpected execution"),
  }).exitOverride();

  await assert.rejects(
    invalid.parseAsync(["--format", "yaml"], { from: "user" }),
  );
});

test("assets group and application register without executing car", async () => {
  const { createAssetsCommand } = await import(`${assetsDist}/index.js`);
  const { createProgram } = await import("../dist/program.js");
  const carService = {
    async execute() {
      assert.fail("registration executed a service");
    },
  };
  const assets = createAssetsCommand({ diagnostics, carService });

  assert.equal(assets.name(), "assets");
  assert.deepEqual(
    assets.commands.map((command) => command.name()),
    ["car", "series", "track"],
  );
  assert.match(assets.helpInformation(), /\bcar\b/);
  assert.ok(
    createProgram(diagnostics).commands.some(
      (command) => command.name() === "assets",
    ),
  );
});

test("car service selects generated CarApi operation, not registrar", async (t) => {
  const { makeCarAssetsService } = await import(`${assetsDist}/car/service.js`);
  const { CarApi } = await import("@iracing-data/api-client-fetch");
  const envelope = {
    link: "https://assets.example.test/car.json?signature=opaque",
    expires: new Date("2030-01-01"),
  };
  const method = t.mock.method(
    CarApi.prototype,
    "getCarAssets",
    async () => envelope,
  );
  let materializations = 0;
  const service = makeCarAssetsService(
    {
      async execute(request) {
        assert.equal(request.operation, "car assets");
        assert.equal(request.requiredScope, "iracing.auth");
        assert.equal(request.outputLabel, "Assets");
        assert.equal(request.successMessage, "Car assets fetched.");
        assert.deepEqual(request.input, {
          credentials: "file.json",
          format: "json",
        });
        assert.equal(await request.fetch("synthetic"), envelope);
        assert.deepEqual(await request.materialize(envelope), ASSETS);
      },
    },
    async (link) => {
      materializations++;
      assert.equal(link, envelope.link);

      return ASSETS;
    },
  );

  await service.execute({ credentials: "file.json", format: "json" });
  assert.equal(method.mock.callCount(), 1);
  assert.equal(materializations, 1);
});

test("car executor resolves once, materializes once, writes JSON and then logs", async (t) => {
  const { makeCarAssetsService } = await import(`${assetsDist}/car/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { CarApi } = await import("@iracing-data/api-client-fetch");
  const envelope = {
    link: "https://assets.example.test/car.json?opaque=1",
    expires: new Date("2030-01-01"),
  };
  const events = [];
  const method = t.mock.method(CarApi.prototype, "getCarAssets", async () => {
    events.push("api");

    return envelope;
  });
  const requests = makeDocumentRequestService({
    diagnostics: {
      info(message) {
        events.push(["diagnostics", message]);
      },
    },
    async resolveAccessToken(options) {
      events.push(["token", options.credentials]);

      return "fake-token";
    },
    async writeDocumentOutput(payload, options) {
      events.push(["stdout", JSON.stringify(payload, null, 2) + "\n", options]);
    },
  });
  const service = makeCarAssetsService(requests, async (link) => {
    events.push(["materialize", link]);

    return ASSETS;
  });

  await service.execute({ credentials: "auth.json", format: "json" });

  assert.equal(method.mock.callCount(), 1);
  assert.deepEqual(events, [
    ["token", "auth.json"],
    "api",
    ["materialize", envelope.link],
    [
      "stdout",
      JSON.stringify(ASSETS, null, 2) + "\n",
      {
        credentials: "auth.json",
        format: "json",
        outputLabel: "Assets",
      },
    ],
    ["diagnostics", "Car assets fetched."],
  ]);
});

test("generated request errors are safe, retain cause and stop publication", async (t) => {
  const { makeCarAssetsService } = await import(`${assetsDist}/car/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { CarApi } = await import("@iracing-data/api-client-fetch");
  const { DataApiRequestError } = await import("../dist/errors.js");
  let failure;
  const method = t.mock.method(CarApi.prototype, "getCarAssets", async () => {
    throw failure;
  });
  const executor = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => "synthetic-token",
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  const service = makeCarAssetsService(executor, async () =>
    assert.fail("unexpected materialization"),
  );

  for (const problem of [
    responseError(401),
    responseError(403),
    responseError(429),
    responseError(503),
    new Error("synthetic private network failure"),
  ]) {
    failure = problem;
    await assert.rejects(service.execute({ format: "json" }), (error) => {
      assert.ok(error instanceof DataApiRequestError);
      assert.equal(error.cause, problem);
      if (problem.response) {
        assert.equal(error.status, problem.response.status);
      }
      assert.doesNotMatch(error.message, /synthetic|secret|private/);
      assert.match(error.message, /car assets request failed/);

      return true;
    });
  }
  assert.equal(method.mock.callCount(), 5);
});

test("returned-link failures retain their own safe diagnostics", async (t) => {
  const { makeCarAssetsService } = await import(`${assetsDist}/car/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { CarApi } = await import("@iracing-data/api-client-fetch");
  const method = t.mock.method(CarApi.prototype, "getCarAssets", async () => ({
    link: "https://assets.example.test/opaque",
    expires: new Date("2030-01-01"),
  }));
  const failure = new Error(
    "Asset payload request failed with HTTP 502. Retry the command to obtain a fresh link.",
  );
  const executor = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => "synthetic",
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  const service = makeCarAssetsService(executor, async () => {
    throw failure;
  });

  await assert.rejects(
    service.execute({ format: "json" }),
    (error) => error === failure,
  );
  assert.equal(method.mock.callCount(), 1);
});

test("invalid credentials stop before the generated request", async () => {
  const { makeCarAssetsService } = await import(`${assetsDist}/car/service.js`);
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const failure = new Error("invalid credentials");
  const executor = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => {
      throw failure;
    },
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  const service = makeCarAssetsService(executor, async () =>
    assert.fail("unexpected materialization"),
  );

  await assert.rejects(
    service.execute({ format: "json" }),
    (error) => error === failure,
  );
});

test("materializer omits bearer credentials", async () => {
  const { materializeReturnedDataApiLink } = await loadMaterializer();
  const link = "https://assets.example.test/car.json?signature=opaque%2Bvalue";
  let calls = 0;

  const payload = await materializeReturnedDataApiLink(link, {
    timeoutMs: 1_000,
    async fetch(input, init) {
      calls++;
      assert.equal(input, link);
      assert.equal(init.method, "GET");
      const headers = new Headers(init.headers);
      assert.equal(headers.has("authorization"), false);
      assert.equal(headers.get("accept"), "application/json");
      assert.ok(init.signal);
      return new Response(JSON.stringify(ASSETS), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    },
  });

  assert.equal(calls, 1);
  assert.deepEqual(payload, ASSETS);
});

test("materializer rejects unsafe URLs", async () => {
  const { materializeReturnedDataApiLink } = await loadMaterializer();
  const dependencies = {
    timeoutMs: 1_000,
    async fetch() {
      assert.fail("unsafe link was fetched");
    },
  };

  await assert.rejects(
    materializeReturnedDataApiLink("not-a-url", dependencies),
    /invalid asset link/,
  );
  await assert.rejects(
    materializeReturnedDataApiLink(
      "http://example.test/assets.json",
      dependencies,
    ),
    /non-HTTPS/,
  );
  await assert.rejects(
    materializeReturnedDataApiLink(
      "https://user:password@example.test/assets.json",
      dependencies,
    ),
    /credential-bearing/,
  );
});

test("materializer safely rejects bad responses", async () => {
  const { materializeReturnedDataApiLink } = await loadMaterializer();
  const link = "https://assets.example.test/car.json";

  await assert.rejects(
    materializeReturnedDataApiLink(link, {
      timeoutMs: 1_000,
      async fetch() {
        return new Response("synthetic secret body", { status: 502 });
      },
    }),
    (error) => {
      assert.match(error.message, /HTTP 502/);
      assert.doesNotMatch(error.message, /synthetic secret/);
      return true;
    },
  );

  await assert.rejects(
    materializeReturnedDataApiLink(link, {
      timeoutMs: 1_000,
      async fetch() {
        return new Response("synthetic secret body", {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      },
    }),
    (error) => {
      assert.match(error.message, /was not JSON/);
      assert.doesNotMatch(error.message, /synthetic secret/);
      return true;
    },
  );

  await assert.rejects(
    materializeReturnedDataApiLink(link, {
      timeoutMs: 1_000,
      async fetch() {
        return new Response("{not-json", {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    }),
    (error) => {
      assert.match(error.message, /not valid JSON/);
      assert.doesNotMatch(error.message, /synthetic secret/);
      return true;
    },
  );
});
