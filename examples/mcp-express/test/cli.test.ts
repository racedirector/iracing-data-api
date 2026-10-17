import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../", import.meta.url));

function run(args: string[], environment: Record<string, string> = {}) {
  const env = { ...process.env };

  delete env.IRACING_AUTH_CLIENT;
  delete env.IRACING_AUTH_SECRET;
  delete env.IRACING_CREDENTIALS_PATH;

  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "src/cli.ts", ...args],
    {
      cwd: directory,
      env: { ...env, ...environment },
      input: "",
      encoding: "utf8",
      timeout: 10_000,
    },
  );

  assert.ifError(result.error);

  return { status: result.status, output: result.stdout + result.stderr };
}

test("help works without credentials and hides OAuth options", () => {
  for (const args of [
    ["--help"],
    ["express", "--help"],
    ["http", "--help"],
    ["stdio", "--help"],
  ]) {
    const result = run(args);

    assert.equal(result.status, 0);
    assert.doesNotMatch(
      result.output,
      /--client-id|--client-secret|--error-details/,
    );
    assert.doesNotMatch(result.output, /Starting/);
  }
});

test("missing and blank environment configuration fails before startup", () => {
  for (const args of [[], ["stdio"], ["http"], ["express"]]) {
    const result = run(args);

    assert.notEqual(result.status, 0);
    assert.match(result.output, /IRACING_AUTH_CLIENT/);
    assert.doesNotMatch(result.output, /Starting/);
  }

  for (const environment of [
    { IRACING_AUTH_CLIENT: "   " },
    { IRACING_AUTH_CLIENT: "synthetic-client", IRACING_AUTH_SECRET: "   " },
    { IRACING_AUTH_CLIENT: "synthetic-client", IRACING_AUTH_SECRET: "" },
  ]) {
    const result = run(["stdio"], environment);

    assert.notEqual(result.status, 0);
    assert.match(result.output, /nonempty/);
    assert.doesNotMatch(result.output, /Starting/);
  }
});

test("command-line OAuth values are rejected without echoing them", () => {
  const value = "synthetic-sensitive-value";

  for (const args of [
    ["--client-id", value, "stdio"],
    ["express", "--client-secret", value],
    ["http", `--client-secret=${value}`],
    ["--client-secret", value],
  ]) {
    const result = run(args, {
      IRACING_AUTH_CLIENT: "synthetic-client",
      IRACING_AUTH_SECRET: "synthetic-environment-secret",
    });

    assert.notEqual(result.status, 0);
    assert.match(result.output, /through the environment only/);
    assert.doesNotMatch(result.output, /Starting/);
    assert.ok(!result.output.includes(value));
    assert.ok(!result.output.includes("synthetic-environment-secret"));
  }
});

test("environment configuration starts stdio with an optional client secret", () => {
  for (const environment of [
    { IRACING_AUTH_CLIENT: "synthetic-client" },
    {
      IRACING_AUTH_CLIENT: "synthetic-client",
      IRACING_AUTH_SECRET: "synthetic-secret",
    },
  ]) {
    const result = run(["stdio"], environment);

    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Stdio MCP server started/);
    assert.doesNotMatch(result.output, /synthetic-client|synthetic-secret/);
  }
});
