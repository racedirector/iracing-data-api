const assert = require("node:assert/strict");
const { test } = require("node:test");

test("Docker secret checks cover stderr as well as stdout", async () => {
  const { assertSafeDockerLogs } = await import("./docker/logs.mjs");
  const logs = assertSafeDockerLogs({
    status: 0,
    stdout: "safe stdout",
    stderr: '{"error_code":"TOKEN_REFRESH_FAILED"}',
  });
  assert.match(logs, /TOKEN_REFRESH_FAILED/);
  assert.throws(() =>
    assertSafeDockerLogs({
      status: 0,
      stdout: "safe",
      stderr: "SYNTHETIC_SECRET",
    }),
  );
  assert.throws(() =>
    assertSafeDockerLogs({ status: 1, stdout: "", stderr: "unavailable" }),
  );
});
