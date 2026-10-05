const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { ...options }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve(
          new Response(Buffer.concat(chunks), { status: res.statusCode }),
        ),
      );
    });
    req.on("error", reject);
    req.end(options.body);
  });
}

test("production config requires client ID and exact Host/Origin; rejects secret env", async () => {
  const { parseProductionConfig } = await import("../dist/production.js");
  for (const env of [
    {},
    { IRACING_MCP_CLIENT_ID: " " },
    {
      IRACING_MCP_CLIENT_ID: "fixture",
      IRACING_MCP_ALLOWED_HOSTS: "*.example.com",
    },
    {
      IRACING_MCP_CLIENT_ID: "fixture",
      IRACING_MCP_ALLOWED_ORIGINS: "http://localhost:3000/path",
    },
    { IRACING_MCP_CLIENT_ID: "fixture", IRACING_MCP_ALLOWED_ORIGINS: "null" },
    { IRACING_MCP_CLIENT_ID: "fixture", IRACING_MCP_CLIENT_SECRET: "SECRET" },
    {
      IRACING_MCP_CLIENT_ID: "fixture",
      IRACING_MCP_CLIENT_SECRET_FILE: "/tmp/SECRET",
    },
    {
      IRACING_MCP_CLIENT_ID: "fixture",
      IRACING_MCP_CLIENT_SECRET_FILE:
        "/var/lib/iracing-data-mcp/credentials.json",
    },
  ]) {
    assert.throws(
      () => parseProductionConfig(env),
      (error) => {
        assert.doesNotMatch(error.message, /SECRET|example.com/);
        return true;
      },
    );
  }
  const config = parseProductionConfig({
    IRACING_MCP_CLIENT_ID: "fixture",
    IRACING_MCP_ALLOWED_HOSTS: "localhost:3000",
    IRACING_MCP_ALLOWED_ORIGINS: "http://localhost:3000",
    IRACING_MCP_CLIENT_SECRET_FILE: "/var/lib/iracing-data-mcp/client-secret",
  });
  assert.deepEqual(config.allowedHosts, ["localhost:3000"]);
  assert.deepEqual(config.allowedOrigins, ["http://localhost:3000"]);
  assert.equal(config.clientId, "fixture");
});

test("production directory and secret enforce ownership/modes without exposing values", async (t) => {
  const { checkProductionDirectory, readProductionSecret } =
    await import("../dist/production.js");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-production-"));
  t.after(() => fs.rm(dir, { force: true, recursive: true }));
  await fs.chmod(dir, 0o700);
  await checkProductionDirectory(dir);
  await fs.chmod(dir, 0o755);
  await assert.rejects(checkProductionDirectory(dir));
  await fs.chmod(dir, 0o700);
  const file = path.join(dir, "secret");
  await fs.writeFile(file, "SECRET\n", { mode: 0o600 });
  assert.equal(await readProductionSecret(file), "SECRET");
  await fs.chmod(file, 0o644);
  await assert.rejects(
    readProductionSecret(file),
    (error) => !error.message.includes("SECRET"),
  );
  const link = path.join(dir, "link");
  await fs.symlink(file, link);
  await assert.rejects(readProductionSecret(link));
  await fs.chmod(file, 0o600);
  await fs.writeFile(file, "one\ntwo");
  await assert.rejects(readProductionSecret(file));
});

test("configured HTTP Host/Origin list stays exact without accepting default hosts", async (t) => {
  const api = await import("../dist/index.js");
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services: { authorizationState: () => "authorization_required" },
    allowedHosts: ["localhost:4321"],
    allowedOrigins: ["http://localhost:4321"],
    logger: api.createDiagnosticLogger(() => {}),
  });
  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());
  const url = `http://127.0.0.1:${app.server.address().port}/healthz`;
  assert.equal(
    (
      await request(url, {
        headers: { Host: "localhost:4321", Origin: "http://localhost:4321" },
      })
    ).status,
    200,
  );
  assert.equal(
    (await request(url, { headers: { Host: "127.0.0.1:3000" } })).status,
    403,
  );
  assert.equal(
    (
      await request(url, {
        headers: {
          Host: "localhost:4321",
          Origin: "http://localhost:4321.evil.example",
        },
      })
    ).status,
    403,
  );
});

test("production rejects non-loopback and unpaired configuration", async () => {
  const { parseProductionConfig } = await import("../dist/production.js");
  for (const extra of [
    { IRACING_MCP_ALLOWED_HOSTS: "evil.example:3000" },
    { IRACING_MCP_ALLOWED_HOSTS: "192.168.1.10:3000" },
    { IRACING_MCP_ALLOWED_ORIGINS: "https://localhost:3000" },
    { IRACING_MCP_ALLOWED_ORIGINS: "http://localhost:4321" },
  ]) {
    assert.throws(() =>
      parseProductionConfig({ IRACING_MCP_CLIENT_ID: "fixture", ...extra }),
    );
  }
});

test("executable startup and import refusal print safe recovery without raw exceptions", async () => {
  const { spawnSync } = require("node:child_process");
  for (const [file, extra, args] of [
    [
      "main.js",
      { IRACING_MCP_CLIENT_ID: "", IRACING_MCP_CLIENT_SECRET: "SECRET" },
      [],
    ],
    ["import-main.js", {}, ["SECRET"]],
    [
      "import-main.js",
      { IRACING_MCP_OWNER_STOPPED: "yes" },
      ["/missing/SECRET"],
    ],
  ]) {
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, "../dist", file), ...args],
      {
        encoding: "utf8",
        env: { ...process.env, ...extra, IRACING_MCP_CLIENT_ID: "" },
      },
    );
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /SECRET|Error:| at /);
    assert.match(result.stderr, /Stop|stop|startup failed/);
  }
});

test("offline stopped import uses shared wire validation and durable atomic ownership", async (t) => {
  const oauth = require("@iracing-data/oauth-client");
  const { importCredentials } = await import("../dist/import-credentials.js");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-import-"));
  t.after(() => fs.rm(dir, { force: true, recursive: true }));
  await fs.chmod(dir, 0o700);
  const source = path.join(dir, "source.json");
  const target = path.join(dir, "credentials.json");
  await fs.writeFile(source, '{"invalid":"SECRET"}', { mode: 0o600 });
  await assert.rejects(importCredentials(source, target));
  const token = {
    access_token: "synthetic",
    refresh_token: "synthetic",
    expires_in: 3600,
    token_type: "Bearer",
    scope: "iracing.auth",
  };
  await oauth.writeOAuthTokenDocument(source, token, {
    overwrite: true,
    durability: "required",
  });
  await importCredentials(source, target);
  assert.deepEqual(await oauth.readOAuthTokenDocument(target), token);
  assert.equal((await fs.stat(target)).mode & 0o777, 0o600);
  await fs.chmod(source, 0o644);
  await assert.rejects(importCredentials(source, target));
  assert.deepEqual(await oauth.readOAuthTokenDocument(target), token);
});
