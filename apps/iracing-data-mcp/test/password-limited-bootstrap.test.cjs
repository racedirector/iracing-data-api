const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const oauth = require("@iracing-data/oauth-client");

function jwt(exp) {
  const header = Buffer.from('{"alg":"RS256"}').toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");

  return `${header}.${payload}.signature`;
}

function token(changes = {}) {
  return {
    access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "password-limited-refresh",
    scope: "iracing.auth",
    ...changes,
  };
}

test("password-limited bootstrap uses the canonical MCP owner", async (t) => {
  const api = await import("../dist/index.js");
  const prefix = path.join(os.tmpdir(), "mcp-password-limited-");
  const directory = await fs.mkdtemp(prefix);
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));

  const credentialFile = path.join(directory, "credentials.json");
  const username = "bootstrap-user@example.invalid";
  const password = "bootstrap-password-must-not-persist";
  const acquired = token();

  await oauth.writeOAuthTokenDocument(credentialFile, acquired, {
    overwrite: true,
  });

  const initialDocument = await oauth.readOAuthTokenDocument(credentialFile);
  const persistedBootstrap = JSON.stringify(initialDocument);
  assert.equal(persistedBootstrap.includes(username), false);
  assert.equal(persistedBootstrap.includes(password), false);

  const options = {
    credentialFile,
    clientMetadata: {
      clientId: "fixture-client",
      redirectUri: "http://127.0.0.1:0/callback",
      scopes: ["iracing.auth"],
    },
    logger: api.createDiagnosticLogger(() => {}),
  };

  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = () => {
    throw new Error("unexpected network during valid bootstrap restore");
  };

  const initialOwner = await api.createMcpServices(options);
  assert.equal(initialOwner.authorizationState(), "ready");
  const initialAccess = await initialOwner.dataApiConfiguration.accessToken();
  assert.equal(initialAccess, acquired.access_token);
  await initialOwner.shutdownAuthorizationOwner();

  const expired = token({
    access_token: jwt(1),
    refresh_token: "password-limited-refresh",
  });
  await oauth.writeOAuthTokenDocument(credentialFile, expired, {
    overwrite: true,
  });

  const refreshOwner = await api.createMcpServices(options);
  let refreshes = 0;
  global.fetch = async (_url, request) => {
    refreshes += 1;
    const body = new URLSearchParams(request.body);
    assert.equal(body.get("refresh_token"), "password-limited-refresh");

    const refreshed = token({
      access_token: jwt(Math.floor(Date.now() / 1000) + 7200),
      refresh_token: "rotated-refresh",
    });

    return Response.json(refreshed);
  };

  const reads = Array.from({ length: 8 }, () =>
    refreshOwner.dataApiConfiguration.accessToken(),
  );
  const restored = await Promise.all(reads);
  assert.equal(refreshes, 1);
  assert.ok(restored.every((value) => value === restored[0]));

  const rotated = await oauth.readOAuthTokenDocument(credentialFile);
  const persistedRotated = JSON.stringify(rotated);
  assert.equal(rotated.refresh_token, "rotated-refresh");
  assert.equal(persistedRotated.includes(username), false);
  assert.equal(persistedRotated.includes(password), false);
  await refreshOwner.shutdownAuthorizationOwner();

  global.fetch = () => {
    throw new Error("unexpected grant during rotated credential restart");
  };
  const restartedOwner = await api.createMcpServices(options);
  assert.equal(restartedOwner.authorizationState(), "ready");
  const restartedAccess =
    await restartedOwner.dataApiConfiguration.accessToken();
  assert.equal(restartedAccess, rotated.access_token);
  await restartedOwner.shutdownAuthorizationOwner();
});
