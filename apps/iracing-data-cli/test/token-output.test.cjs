const assert = require("node:assert/strict");
const { mkdtemp, readFile, stat, writeFile, readdir } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const TOKEN = {
  access_token: "synthetic-access",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "synthetic-refresh",
  refresh_token_expires_in: 7200,
  scope: "iracing.auth",
};

test("selects formats deterministically", async () => {
  const { resolveTokenFormat } = await import("../dist/token-output.js");
  assert.equal(resolveTokenFormat(undefined, undefined), "json");
  assert.equal(resolveTokenFormat("credentials.json", undefined), "json");
  assert.equal(resolveTokenFormat("credentials.yaml", undefined), "yaml");
  assert.equal(resolveTokenFormat("credentials.yml", undefined), "yaml");
  assert.equal(resolveTokenFormat("credentials.yaml", "json"), "json");
  assert.throws(() => resolveTokenFormat(undefined, "toml"), /Unsupported output format/);
});

test("serializes complete wire fields without CLI metadata", async () => {
  const { serializeToken } = await import("../dist/token-output.js");
  const json = serializeToken(TOKEN, "json");
  assert.equal(json.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(json), TOKEN);

  const { parse } = await import("yaml");
  assert.deepEqual(parse(serializeToken(TOKEN, "yaml")), TOKEN);
});

test("omits optional fields when absent", async () => {
  const { serializeToken } = await import("../dist/token-output.js");
  const minimal = {
    access_token: "synthetic-access",
    token_type: "Bearer",
    expires_in: 3600,
  };
  const parsed = JSON.parse(serializeToken(minimal, "json"));
  assert.equal("refresh_token" in parsed, false);
  assert.equal("refresh_token_expires_in" in parsed, false);
  assert.equal("scope" in parsed, false);
});

test("writes stdout only when no output path is supplied", async () => {
  const { writeTokenOutput } = await import("../dist/token-output.js");
  let stdout = "";
  await writeTokenOutput(TOKEN, {
    writeStdout: (value) => {
      stdout += value;
    },
  });
  assert.deepEqual(JSON.parse(stdout), TOKEN);
});

test("resolves files from cwd, protects overwrites, and supports --force", async () => {
  const { writeTokenOutput } = await import("../dist/token-output.js");
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-"));
  const destination = path.join(cwd, "nested", "credentials.json");

  await writeTokenOutput(TOKEN, { output: "nested/credentials.json", cwd });
  assert.deepEqual(JSON.parse(await readFile(destination, "utf8")), TOKEN);
  if (process.platform !== "win32") {
    assert.equal((await stat(destination)).mode & 0o777, 0o600);
  }

  await assert.rejects(
    writeTokenOutput(TOKEN, { output: "nested/credentials.json", cwd }),
    /Pass --force/,
  );

  const replacement = { ...TOKEN, expires_in: 123 };
  await writeTokenOutput(replacement, {
    output: "nested/credentials.json",
    cwd,
    force: true,
  });
  assert.deepEqual(JSON.parse(await readFile(destination, "utf8")), replacement);
  assert.equal((await readdir(path.dirname(destination))).some((name) => name.endsWith(".tmp")), false);
});

test("rejects directory destinations without changing them", async () => {
  const { writeTokenOutput } = await import("../dist/token-output.js");
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-dir-"));
  await assert.rejects(
    writeTokenOutput(TOKEN, { output: ".", cwd }),
    /destination is a directory/,
  );
  await writeFile(path.join(cwd, "sentinel"), "ok");
  assert.equal(await readFile(path.join(cwd, "sentinel"), "utf8"), "ok");
});
