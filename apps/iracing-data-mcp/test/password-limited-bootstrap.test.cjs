const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const oauth = require("@iracing-data/oauth-client");

const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;

const token = (changes = {}) => ({
  access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "password-limited-refresh",
  scope: "iracing.auth",
  ...changes,
});

test("password-limited bootstrap uses the canonical MCP owner and refresh lifecycle", async (t) => {
  const api = await import("../dist/index.js");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-password-limited-"),
  );
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));

  const credentialFile = path.join(directory, "credentials.json");
  const username = "bootstrap-user@example.invalid";
  const password = "bootstrap-password-must-not-persist";
  const acquired = token();

  await oauth.writeOAuthTokenDocument(credentialFile, acquired, {
    overwrite: true,
  });

  const persistedBootstrap = JSON.stringify(
    await oauth.readOAuthTokenDocument(credentialFile),
  );
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
  global.fetch = () => {
    throw new Error("unexpected network during valid bootstrap restore");
  };
  t.after(() => (global.fetch = originalFetch));

  const initialOwner = await api.createMcpServices(options);
  assert.equal(initialOwner.authorizationState(), "ready");
  assert.equal(
    await initialOwner.dataApiConfiguration.accessToken(),
    acquired.access_token,
  );

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
    assert.equal(
      new URLSearchParams(request.body).get("refresh_token"),
      "password-limited-refresh",
    );
    return Response.json(
      token({
        access_token: jwt(Math.floor(Date.now() / 1000) + 7200),
        refresh_token: "rotated-refresh",
      }),
    );
  };

  const restored = await Promise.all(
    Array.from({ length: 8 }, () =>
      refreshOwner.dataApiConfiguration.accessToken(),
    ),
  );
  assert.equal(refreshes, 1);
  assert.ok(restored.every((value) => value === restored[0]));

  const rotated = await oauth.readOAuthTokenDocument(credentialFile);
  assert.equal(rotated.refresh_token, "rotated-refresh");
  assert.equal(JSON.stringify(rotated).includes(username), false);
  assert.equal(JSON.stringify(rotated).includes(password), false);

  global.fetch = () => {
    throw new Error("restart must consume the rotated credential without a grant");
  };
  const restartedOwner = await api.createMcpServices(options);
  assert.equal(restartedOwner.authorizationState(), "ready");
  assert.equal(
    await restartedOwner.dataApiConfiguration.accessToken(),
    rotated.access_token,
  );
});
