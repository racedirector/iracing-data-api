const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

test("stdin credential import validates and durably writes a secure token document", async (t) => {
  const oauth = require("@iracing-data/oauth-client");
  const { importCredentialsJson } =
    await import("../dist/import-credentials.js");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-import-json-"),
  );

  t.after(() => fs.rm(directory, { force: true, recursive: true }));
  await fs.chmod(directory, 0o700);

  const destination = path.join(directory, "credentials.json");
  const token = {
    access_token: "synthetic",
    refresh_token: "synthetic-refresh",
    expires_in: 3600,
    token_type: "Bearer",
    scope: "iracing.auth",
  };

  await assert.rejects(importCredentialsJson('{"invalid":true}', destination));
  await importCredentialsJson(JSON.stringify(token), destination);
  assert.deepEqual(await oauth.readOAuthTokenDocument(destination), token);
  assert.equal((await fs.stat(destination)).mode & 0o777, 0o600);
});

test("stdin client-secret import writes only a secure file in the owned data directory", async (t) => {
  const { importClientSecret } = await import("../dist/import-credentials.js");
  const { readProductionSecret } = await import("../dist/production.js");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-import-secret-"),
  );

  t.after(() => fs.rm(directory, { force: true, recursive: true }));
  await fs.chmod(directory, 0o700);

  const destination = path.join(directory, "client-secret");

  await assert.rejects(importClientSecret("\n", destination));
  await assert.rejects(importClientSecret("line-one\nline-two", destination));
  await importClientSecret("synthetic-secret", destination);
  assert.equal(await readProductionSecret(destination), "synthetic-secret");
  assert.equal((await fs.stat(destination)).mode & 0o777, 0o600);
});
