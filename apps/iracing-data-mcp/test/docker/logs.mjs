import assert from "node:assert/strict";

/** Docker multiplexes application stderr into the CLI's stderr; verify both streams. */
export function assertSafeDockerLogs(result) {
  assert.equal(result.status, 0, "Docker log collection failed");
  const logs = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  assert.doesNotMatch(
    logs,
    /SYNTHETIC_SECRET|SYNTHETIC_REFRESH|signature=|credentials.json|Bearer /,
  );

  return logs;
}
