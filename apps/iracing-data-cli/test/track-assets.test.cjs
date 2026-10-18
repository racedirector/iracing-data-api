const assert = require("node:assert/strict");
const test = require("node:test");

const diagnostics = { info() {}, warn() {}, error() {} };
const payload = { tracks: [{ track_id: 1, logo: "/img/tracks/1.png" }] };
const loadScope = () => import("../dist/commands/assets/track/scope.js");

function dependencies(overrides = {}) {
  return {
    async resolveAccessToken(options) {
      assert.equal(options.credentials, "credentials.json");
      return "synthetic-track-token";
    },
    createTrackAssetsClient(token) {
      assert.equal(token, "synthetic-track-token");
      return {
        async getTrackAssets() {
          return {
            link: "https://assets.example.test/track.json?opaque=1",
            expires: new Date("2030-01-01T00:00:00.000Z"),
          };
        },
      };
    },
    async materializeReturnedDataApiLink() {
      return payload;
    },
    writeStdout() {},
    ...overrides,
  };
}

function responseError(status) {
  const error = new Error("synthetic upstream body synthetic-track-token");
  error.name = "ResponseError";
  error.response = new Response("synthetic upstream body", { status });
  return error;
}

test("assets help exposes track", async () => {
  const { createAssetsCommand } =
    await import("../dist/commands/assets/index.js");
  const command = createAssetsCommand({ diagnostics, carService: { async execute() { throw new Error("unexpected car execution"); } }, });
  assert.match(command.helpInformation(), /\btrack\b/);
});

test("track scope calls generated operation and shared materializer exactly once", async () => {
  const { createTrackAssetsCommandScopeFactory } = await loadScope();
  let apiCalls = 0;
  let materializations = 0;
  let stdout = "";
  const link = "https://assets.example.test/track.json?opaque=1";
  const createScope = createTrackAssetsCommandScopeFactory(
    diagnostics,
    dependencies({
      createTrackAssetsClient(token) {
        assert.equal(token, "synthetic-track-token");
        return {
          async getTrackAssets() {
            apiCalls++;
            return {
              link,
              expires: new Date("2030-01-01T00:00:00.000Z"),
            };
          },
        };
      },
      async materializeReturnedDataApiLink(receivedLink) {
        materializations++;
        assert.equal(receivedLink, link);
        return payload;
      },
      writeStdout(value) {
        stdout += value;
      },
    }),
  );

  const scope = await createScope({ credentials: "credentials.json" });
  const value = await scope.assets.get();
  scope.output.write(value);

  assert.equal(apiCalls, 1);
  assert.equal(materializations, 1);
  assert.equal(stdout, `${JSON.stringify(payload, null, 2)}\n`);
});

test("track generated-client failures are normalized without leaking sensitive text", async () => {
  const { createTrackAssetsCommandScopeFactory } = await loadScope();
  const cases = [
    [responseError(401), /HTTP 401.*auth login/],
    [responseError(429), /HTTP 429.*retry later/],
    [responseError(503), /HTTP 503.*maintenance/],
    [new Error("synthetic-track-token"), /network connectivity/],
  ];

  for (const [error, expected] of cases) {
    const createScope = createTrackAssetsCommandScopeFactory(
      diagnostics,
      dependencies({
        createTrackAssetsClient() {
          return {
            async getTrackAssets() {
              throw error;
            },
          };
        },
        async materializeReturnedDataApiLink() {
          assert.fail("failed modeled requests must not materialize links");
        },
      }),
    );
    const scope = await createScope({ credentials: "credentials.json" });

    await assert.rejects(scope.assets.get(), (mapped) => {
      assert.match(mapped.message, expected);
      assert.doesNotMatch(mapped.message, /synthetic-track-token/);
      assert.doesNotMatch(mapped.message, /synthetic upstream body/);
      return true;
    });
  }
});
