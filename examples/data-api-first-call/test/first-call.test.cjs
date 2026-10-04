const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const root = path.resolve(__dirname, "..");

function run(mode) {
  return spawnSync(
    process.execPath,
    [
      "--require",
      path.join(__dirname, "fetch-fixture.cjs"),
      path.join(root, "dist/index.js"),
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        IRACING_ACCESS_TOKEN: mode === "missing" ? "" : "synthetic-token",
        FIXTURE_MODE: mode,
      },
    },
  );
}

test("documented source and runnable source agree", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const snippet = readme.match(/```typescript\r?\n([\s\S]*?)\r?\n```/)[1];
  const source = fs.readFileSync(path.join(root, "src/index.ts"), "utf8");
  assert.equal(
    snippet.replaceAll("\r\n", "\n").trim(),
    source.replaceAll("\r\n", "\n").trim(),
  );
});
test("first call prints cached data and never forwards bearer authorization", () => {
  const result = run("success");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [
    { car_id: 1, car_name: "Fixture car" },
  ]);
});
for (const [mode, message] of [
  ["missing", "Set IRACING_ACCESS_TOKEN"],
  ["unauthorized", "HTTP 401"],
  ["cache-error", "HTTP 503"],
]) {
  test(`${mode} fails with an actionable message`, () => {
    const result = run(mode);
    assert.equal(result.status, 1, result.stderr);
    assert.ok(result.stderr.includes(message), result.stderr);
    assert.ok(!result.stderr.includes("synthetic-token"));
  });
}
