const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");

const remoteConfig = Object.freeze({
  resourceUrl: "https://mcp.example/mcp",
  issuer: "https://issuer.example/",
  audience: "https://mcp.example/mcp",
  jwksUrl: "https://issuer.example/.well-known/jwks.json",
  requiredScopes: ["mcp:use"],
});

async function signingFixture() {
  const { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } =
    await import("jose");
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  Object.assign(jwk, { alg: "RS256", kid: "test-key", use: "sig" });

  async function sign(overrides = {}, signingKey = privateKey) {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: remoteConfig.issuer,
      aud: remoteConfig.audience,
      sub: "principal-123",
      scope: "mcp:use",
      iat: now,
      exp: now + 300,
      ...overrides,
    };

    return new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .sign(signingKey);
  }

  return {
    keySet: createLocalJWKSet({ keys: [jwk] }),
    sign,
    generateKeyPair,
  };
}

async function fixture(t) {
  const api = await import("../dist/index.js");
  const signing = await signingFixture();
  const logs = [];
  let seenAuth;

  const services = new Proxy(
    {},
    {
      get(_target, key) {
        if (
          key === "authorizationState" ||
          key === "shutdownAuthorizationOwner"
        )
          return undefined;
        throw new Error("Unexpected upstream service access");
      },
    },
  );

  const config = api.parseMcpRemoteAuthorizationConfig(remoteConfig);
  const authorization = api.createMcpAuthorizationBoundary(
    config,
    api.createMcpJwtVerifier(config, signing.keySet),
  );
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
    authorization,
    sessionIdGenerator: () => "auth-session-1",
    registerTools(server) {
      server.registerTool("auth_probe", {}, (ctx) => {
        seenAuth = ctx.http?.authInfo;
        return { content: [{ type: "text", text: "ok" }] };
      });
    },
    logger: api.createDiagnosticLogger((line) => logs.push(line)),
  });

  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());
  const port = app.server.address().port;

  function request({
    path = "/mcp",
    method = "POST",
    token,
    sessionId,
    headers = {},
    body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  } = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port,
          path,
          method,
          headers: {
            Host: "127.0.0.1:3000",
            Accept: "application/json, text/event-stream",
            "Content-Type": "application/json",
            "MCP-Protocol-Version": "2025-11-25",
            ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
            ...(sessionId === undefined
              ? {}
              : { "Mcp-Session-Id": sessionId }),
            ...headers,
          },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: res.headers,
              text,
              json: () => JSON.parse(text),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  }

  return {
    api,
    app,
    authorization,
    logs,
    request,
    sign: signing.sign,
    generateKeyPair: signing.generateKeyPair,
    seenAuth: () => seenAuth,
  };
}

function initializeBody() {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "oauth-test", version: "1" },
    },
  });
}

test("remote resource-server configuration is strict and fail-closed", async () => {
  const api = await import("../dist/index.js");

  assert.deepEqual(
    api.parseMcpRemoteAuthorizationConfig(remoteConfig).requiredScopes,
    ["mcp:use"],
  );

  for (const invalid of [
    { ...remoteConfig, resourceUrl: "http://mcp.example/mcp" },
    { ...remoteConfig, resourceUrl: "https://mcp.example/other" },
    { ...remoteConfig, issuer: "https://*.example/" },
    { ...remoteConfig, audience: "*" },
    { ...remoteConfig, audience: "https://other.example/mcp" },
    { ...remoteConfig, requiredScopes: [] },
    { ...remoteConfig, requiredScopes: ["*"] },
  ]) {
    assert.throws(() => api.parseMcpRemoteAuthorizationConfig(invalid));
  }

  const { parseProductionConfig } = await import("../dist/production.js");
  const local = parseProductionConfig({ IRACING_MCP_CLIENT_ID: "client" });
  assert.equal(local.remoteAuthorization, undefined);

  const allRemote = {
    IRACING_MCP_CLIENT_ID: "client",
    IRACING_MCP_RESOURCE_URL: remoteConfig.resourceUrl,
    IRACING_MCP_AUTH_ISSUER: remoteConfig.issuer,
    IRACING_MCP_AUTH_AUDIENCE: remoteConfig.audience,
    IRACING_MCP_AUTH_JWKS_URL: remoteConfig.jwksUrl,
    IRACING_MCP_AUTH_SCOPES: "mcp:use",
  };
  assert.equal(
    parseProductionConfig(allRemote).remoteAuthorization.resourceUrl,
    remoteConfig.resourceUrl,
  );

  for (const key of [
    "IRACING_MCP_AUTH_ISSUER",
    "IRACING_MCP_AUTH_AUDIENCE",
    "IRACING_MCP_AUTH_JWKS_URL",
    "IRACING_MCP_AUTH_SCOPES",
  ]) {
    const partial = { ...allRemote };
    delete partial[key];
    assert.throws(() => parseProductionConfig(partial));
  }
});

test("serves path-aware protected resource metadata without bearer auth", async (t) => {
  const { authorization, request } = await fixture(t);
  assert.equal(
    authorization.metadataUrl,
    "https://mcp.example/.well-known/oauth-protected-resource/mcp",
  );

  const response = await request({
    path: "/.well-known/oauth-protected-resource/mcp",
    method: "GET",
    body: "",
  });
  assert.equal(response.status, 200);
  assert.deepEqual(response.json(), {
    resource: "https://mcp.example/mcp",
    authorization_servers: ["https://issuer.example/"],
    scopes_supported: ["mcp:use"],
  });
  assert.equal(response.headers["access-control-allow-origin"], "*");
});

test("signed JWT verification rejects invalid credentials and enforces scope", async (t) => {
  const { request, sign, generateKeyPair } = await fixture(t);
  const now = Math.floor(Date.now() / 1000);

  const missing = await request();
  assert.equal(missing.status, 401);
  assert.match(missing.headers["www-authenticate"], /invalid_token/);
  assert.match(
    missing.headers["www-authenticate"],
    /resource_metadata="https:\/\/mcp\.example\/\.well-known\/oauth-protected-resource\/mcp"/,
  );

  const malformed = await request({
    headers: { Authorization: "Basic nope" },
  });
  assert.equal(malformed.status, 401);
  assert.equal(
    (await request({ token: "iracing-style-access-token" })).status,
    401,
  );
  assert.equal((await request({ token: await sign({ exp: now - 1 }) })).status, 401);
  assert.equal(
    (await request({ token: await sign({ iss: "https://other.example/" }) }))
      .status,
    401,
  );
  assert.equal(
    (
      await request({
        token: await sign({ aud: "https://other.example/mcp" }),
      })
    ).status,
    401,
  );

  const { privateKey: untrustedKey } = await generateKeyPair("RS256");
  assert.equal((await request({ token: await sign({}, untrustedKey) })).status, 401);

  const noScope = await request({ token: await sign({ scope: "other" }) });
  assert.equal(noScope.status, 403);
  assert.match(noScope.headers["www-authenticate"], /insufficient_scope/);
  assert.match(noScope.headers["www-authenticate"], /scope="mcp:use"/);
});

test("signed bearer auth is rechecked across a stateful MCP session", async (t) => {
  const { request, sign, seenAuth } = await fixture(t);
  const token = await sign();

  const initialized = await request({ token, body: initializeBody() });
  assert.equal(initialized.status, 200);
  assert.equal(initialized.json().result.protocolVersion, "2025-11-25");
  assert.equal(initialized.headers["mcp-session-id"], "auth-session-1");

  const withoutBearer = await request({ sessionId: "auth-session-1" });
  assert.equal(withoutBearer.status, 401);

  const list = await request({ token, sessionId: "auth-session-1" });
  assert.equal(list.status, 200);
  assert.ok(list.json().result.tools.some((tool) => tool.name === "auth_probe"));

  const called = await request({
    token,
    sessionId: "auth-session-1",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "auth_probe", arguments: {} },
    }),
  });
  assert.equal(called.status, 200);
  assert.equal(called.json().result.content[0].text, "ok");
  assert.equal(seenAuth().clientId, "principal-123");
  assert.deepEqual(seenAuth().scopes, ["mcp:use"]);
  assert.equal(String(seenAuth().resource), remoteConfig.resourceUrl);
});

test("health remains separate from remote MCP bearer authentication", async (t) => {
  const { request } = await fixture(t);
  const health = await request({ path: "/healthz", method: "GET", body: "" });

  assert.equal(health.status, 200);
  assert.equal(health.json().live, true);
});
