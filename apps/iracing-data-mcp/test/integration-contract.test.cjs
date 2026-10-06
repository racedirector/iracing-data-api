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
    let deadline;
    t.after(() => {
      clearTimeout(deadline);
      child.kill("SIGKILL");
    });
    let stdout = "",
      stderr = "",
      report;
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("message", (message) => (report = message));
    const status = await new Promise((resolve, reject) => {
      deadline = setTimeout(() => {
        child.kill("SIGKILL");
        reject(
          new Error("Independent MCP child exceeded its 10 second deadline"),
        );
      }, 10000);
      child.on("error", (error) => {
        clearTimeout(deadline);
        reject(error);
      });
      child.on("exit", (status) => {
        clearTimeout(deadline);
        resolve(status);
      });
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
