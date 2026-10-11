const assert = require("node:assert/strict");
const test = require("node:test");

const ASSETS = {
  1: {
    logo: "/img/cars/example/logo.png",
    retained_unknown_field: ["preserve", "as-is"],
  },
};
const diagnostics = { info() {}, warn() {}, error() {} };

const loadCommand = () => import("../dist/commands/assets/car/command.js");
const loadScope = () => import("../dist/commands/assets/car/scope.js");
const loadMaterializer = () =>
  import("../dist/commands/assets/returned-data-api-link.js");

function scopeDependencies({
  accessToken = "resolved-token",
  getCarAssets = async () => ({
    link: "https://assets.example.test/car.json?signature=opaque",
    expires: new Date("2030-01-01T00:00:00.000Z"),
  }),
  materialize = async () => ASSETS,
  writeStdout = () => {},
  onOptions,
  onToken,
} = {}) {
  return {
    async resolveAccessToken(options) {
      onOptions?.(options);
      return accessToken;
    },
    createCarAssetsClient(token) {
      onToken?.(token);
      return { getCarAssets };
    },
    materializeReturnedDataApiLink: materialize,
    writeStdout,
  };
}

function responseError(status) {
  const error = new Error("synthetic secret upstream body");
  error.name = "ResponseError";
  error.response = new Response("synthetic secret upstream body", { status });
  return error;
}

test("assets is a structural parent and exposes the car leaf", async () => {
  const { createAssetsCommand } = await import("../dist/commands/assets/index.js");
  const assets = createAssetsCommand({
    diagnostics,
    carDependencies: {
      async resolveAccessToken() {
        assert.fail("registration must not resolve credentials");
      },
      createCarAssetsClient() {
        assert.fail("registration must not create the client");
      },
      async materializeReturnedDataApiLink() {
        assert.fail("registration must not materialize links");
      },
      writeStdout() {
        assert.fail("registration must not write output");
      },
    },
  });

  assert.equal(assets.name(), "assets");
  assert.ok(assets.commands.some((command) => command.name() === "car"));
});

test("top-level program registers assets car", async () => {
  const { createProgram } = await import("../dist/program.js");
  const program = createProgram(diagnostics);
  const assets = program.commands.find(
    (command) => command.name() === "assets",
  );
  assert.ok(assets);
  assert.ok(assets.commands.some((command) => command.name() === "car"));
});

test(
  "car command resolves one invocation scope and preserves stdout/stderr separation",
  async () => {
    const { createCarAssetsCommand } = await loadCommand();
    const events = [];
    const command = createCarAssetsCommand({
      async createScope(options) {
        events.push("scope");
        assert.equal(options.credentials, "credentials.json");
        return {
          assets: {
            async get() {
              events.push("get");
              return ASSETS;
            },
          },
          output: {
            write(payload) {
              events.push(["stdout", payload]);
            },
          },
          diagnostics: {
            ...diagnostics,
            info(message) {
              events.push(["stderr", message]);
            },
          },
        };
      },
    });

    await command.parseAsync(["--credentials", "credentials.json"], {
      from: "user",
    });

    assert.deepEqual(events, [
      "scope",
      "get",
      ["stdout", ASSETS],
      ["stderr", "Car assets fetched."],
    ]);
  },
);

test(
  "scope uses existing credentials, calls generated operation once, materializes once, and writes JSON",
  async () => {
    const { createCarAssetsCommandScopeFactory } = await loadScope();
    let apiCalls = 0;
    let materializations = 0;
    let stdout = "";
    const link = "https://assets.example.test/car.json?signature=opaque";
    const createScope = createCarAssetsCommandScopeFactory(
      diagnostics,
      scopeDependencies({
        onOptions(options) {
          assert.equal(options.credentials, "credentials.json");
        },
        onToken(token) {
          assert.equal(token, "resolved-token");
        },
        async getCarAssets() {
          apiCalls++;
          return { link, expires: new Date("2030-01-01T00:00:00.000Z") };
        },
        async materialize(receivedLink) {
          materializations++;
          assert.equal(receivedLink, link);
          return ASSETS;
        },
        writeStdout(value) {
          stdout += value;
        },
      }),
    );

    const scope = await createScope({ credentials: "credentials.json" });
    const payload = await scope.assets.get();
    scope.output.write(payload);

    assert.equal(apiCalls, 1);
    assert.equal(materializations, 1);
    assert.equal(stdout, `${JSON.stringify(ASSETS, null, 2)}\n`);
  },
);

test(
  "returned-link materializer uses the exact HTTPS link without bearer credentials",
  async () => {
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
  },
);

test(
  "returned-link materializer rejects invalid and non-HTTPS URLs before fetching",
  async () => {
    const { materializeReturnedDataApiLink } = await loadMaterializer();
    const dependencies = {
      timeoutMs: 1_000,
      async fetch() {
        assert.fail("invalid links must not be fetched");
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
  },
);

test(
  "returned-link materializer safely rejects HTTP and non-JSON responses",
  async () => {
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
  },
);

test("generated-client failures map to safe actionable errors", async () => {
  const { createCarAssetsCommandScopeFactory } = await loadScope();

  for (const [error, expected] of [
    [responseError(401), /HTTP 401.*auth login/],
    [responseError(429), /HTTP 429.*retry later/],
    [responseError(503), /HTTP 503.*maintenance/],
    [new Error("synthetic secret token"), /network connectivity/],
  ]) {
    const createScope = createCarAssetsCommandScopeFactory(
      diagnostics,
      scopeDependencies({
        async getCarAssets() {
          throw error;
        },
        async materialize() {
          assert.fail("failed modeled requests must not materialize a link");
        },
      }),
    );
    const scope = await createScope({});

    await assert.rejects(scope.assets.get(), (mapped) => {
      assert.match(mapped.message, expected);
      assert.doesNotMatch(mapped.message, /synthetic secret/);
      return true;
    });
  }
});
