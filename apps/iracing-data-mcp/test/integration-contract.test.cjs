const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawn } = require("node:child_process");
const path = require("node:path");

test(
  "independent composed MCP contracts run offline in an isolated process",
  { timeout: 15000 },
  async (t) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, "fixtures/composed.cjs")],
      {
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
    t.after(() => child.kill());
    let stdout = "",
      stderr = "",
      report;
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("message", (message) => (report = message));
    const status = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", resolve);
    });
    assert.doesNotMatch(
      stdout + stderr,
      /SECRET|Bearer|scorpio-assets|credentials\.json/,
    );
    assert.equal(status, 0, stderr);
    assert.ok(report?.checks >= 50);
    assert.equal(stdout, "", "server must reserve stdout");
  },
);
