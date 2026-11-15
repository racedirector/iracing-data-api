const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

test("diagnostics delegates each severity to the injected Pino logger", async () => {
  const { createDiagnostics } = await import("../dist/diagnostics.js");
  const calls = [];
  const diagnostics = createDiagnostics({
    info(message) {
      calls.push(["info", message]);
    },
    warn(message) {
      calls.push(["warn", message]);
    },
    error(message) {
      calls.push(["error", message]);
    },
  });
  diagnostics.info("complete");
  diagnostics.warn("retry");
  diagnostics.error("failed");
  assert.deepEqual(calls, [
    ["info", "complete"],
    ["warn", "retry"],
    ["error", "failed"],
  ]);
});

test("entrypoint errors are pretty diagnostics on stderr with empty stdout", () => {
  const result = spawnSync(
    process.execPath,
    [
      require.resolve("../dist/index.js"),
      "results",
      "--subsession-id",
      "123",
      "--access-token",
      "Bearer fixture",
    ],
    { encoding: "utf8", env: { ...process.env, IRACING_CREDENTIALS: "" } },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /\[[^\]]+\] ERROR: .*without a Bearer prefix/);
  assert.equal(result.stderr.includes("\u001b["), false);
  assert.doesNotMatch(result.stderr, /"pid"|"hostname"/);
  assert.doesNotMatch(result.stderr, /Bearer fixture/);
});
