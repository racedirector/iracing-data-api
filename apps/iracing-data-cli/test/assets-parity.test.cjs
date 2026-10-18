const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const YAML = require("yaml");

const diagnostics = { info() {}, warn() {}, error() {} };
const openApiPath = path.resolve(__dirname, "../../../openapi/iracing.yaml");

function discoverRuntimeAssetServices(document) {
  return Object.keys(document.paths ?? {})
    .filter(
      (route) =>
        route.startsWith("/data/") &&
        route.endsWith("/assets") &&
        !route.startsWith("/data/doc/"),
    )
    .map((route) => route.slice("/data/".length, -"/assets".length))
    .filter((service) => service.length > 0 && !service.includes("/"))
    .sort();
}

function assertAssetParity(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((name) => !actualSet.has(name));
  const extra = actual.filter((name) => !expectedSet.has(name));

  assert.deepEqual(
    { missing, extra },
    { missing: [], extra: [] },
    [
      "Asset command parity drift detected.",
      missing.length
        ? `Missing CLI leaves: ${missing.join(", ")}. Add matching authored assets commands using the generated client operations.`
        : "No missing CLI leaves.",
      extra.length
        ? `Stale CLI leaves: ${extra.join(", ")}. Remove or reconcile commands whose modeled runtime asset endpoints no longer exist.`
        : "No stale CLI leaves.",
      "Do not add /data/doc/**/assets routes or weaken the matcher to resolve this failure.",
    ].join(" "),
  );
}

test("canonical OpenAPI runtime asset services match authored assets leaves", async () => {
  const document = YAML.parse(fs.readFileSync(openApiPath, "utf8"));
  const discovered = discoverRuntimeAssetServices(document);
  assert.deepEqual(discovered, ["car", "series", "track"]);

  const { createAssetsCommand } =
    await import("../dist/commands/assets/index.js");
  const authored = createAssetsCommand({ diagnostics, carService: { async execute() { throw new Error("unexpected car execution"); } }, })
    .commands.map((command) => command.name())
    .sort();

  assertAssetParity(discovered, authored);
});

test("documentation asset routes are excluded", () => {
  const document = {
    paths: {
      "/data/car/assets": {},
      "/data/doc/car/assets": {},
      "/data/doc/series/assets": {},
      "/data/doc/track/assets": {},
    },
  };

  assert.deepEqual(discoverRuntimeAssetServices(document), ["car"]);
});

test("parity reports a newly modeled runtime asset service as missing", () => {
  assert.throws(
    () =>
      assertAssetParity(
        ["car", "series", "track", "helmet"],
        ["car", "series", "track"],
      ),
    /Missing CLI leaves: helmet/,
  );
});

test("parity reports a stale authored leaf as extra", () => {
  assert.throws(
    () =>
      assertAssetParity(
        ["car", "series", "track"],
        ["car", "legacy", "series", "track"],
      ),
    /Stale CLI leaves: legacy/,
  );
});
