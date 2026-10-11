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

async function fixture(t) {
  const api = await import("../dist/index.js");
  const { OAuthError, OAuthErrorCode } = await import(
    "@modelcontextprotocol/server"
  );
  const logs = [];
  let seenAuth;

  const verifier = {
    async verifyAccessToken(token) {
      const expiresAt = Math.floor(Date.now() / 1000) + 300;
      if (token === "valid") {
        return {
          token,
          clientId: "principal-123",
          scopes: ["mcp:use"],
          expiresAt,
          resource: new URL(remoteConfig.resourceUrl),
        };
      }
      if (token === "no-scope") {
        return {
          token,
          clientId: "principal-123",
          scopes: [],
          expiresAt,
          resource: new URL(remoteConfig.resourceUrl),
        };
      }
      if (token === "wrong-resource") {
        return {
          token,
          clientId: "principal-123",
          scopes: ["mcp:use"],
          expiresAt,
          resource: new URL("https://other.example/mcp"),
        };
      }
      if (token === "expired") {
        return {
          token,
          clientId: "principal-123",
          scopes: ["mcp:use"],
          expiresAt: Math.floor(Date.now() / 1000) - 1,
          resource: new URL(remoteConfig.resourceUrl),
        };
      }
      throw new OAuthError(OAuthErrorCode.InvalidToken, "Invalid access token");
    },
  };

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

  const authorization = api.createMcpAuthorizationBoundary(
    api.parseMcpRemoteAuthorizationConfig(remoteConfig),
    verifier,
  );
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
    authorization,
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

  return { api, app, authorization, logs, request, seenAuth: () => seenAuth };
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

test("protected MCP requests reject missing, malformed, invalid, expired, wrong-resource, and underscoped credentials", async (t) => {
  const { request } = await fixture(t);

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
  assert.equal((await request({ token: "expired" })).status, 401);
  assert.equal((await request({ token: "wrong-resource" })).status, 401);

  const noScope = await request({ token: "no-scope" });
  assert.equal(noScope.status, 403);
  assert.match(noScope.headers["www-authenticate"], /insufficient_scope/);
  assert.match(noScope.headers["www-authenticate"], /scope="mcp:use"/);
});

test("valid bearer auth reaches initialize, tools/list, tool execution, and request auth context", async (t) => {
  const { request, seenAuth } = await fixture(t);

  const initialized = await request({ token: "valid", body: initializeBody() });
  assert.equal(initialized.status, 200);
  assert.equal(initialized.json().result.protocolVersion, "2025-11-25");

  const list = await request({ token: "valid" });
  assert.equal(list.status, 200);
  assert.ok(list.json().result.tools.some((tool) => tool.name === "auth_probe"));

  const called = await request({
    token: "valid",
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
