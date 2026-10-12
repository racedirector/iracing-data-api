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

async function fixture(
  t,
  local = false,
  remote = remoteConfig,
  signed = false,
  verifyAccessToken,
) {
  const api = await import("../dist/index.js");

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

  const config = api.parseMcpRemoteAuthorizationConfig(remote);
  let signing;
  if (signed) {
    const { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } =
      await import("jose");
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const jwk = {
      ...(await exportJWK(publicKey)),
      alg: "RS256",
      kid: "integration",
    };
    signing = {
      keySet: createLocalJWKSet({ keys: [jwk] }),
      async sign(overrides = {}, key = privateKey) {
        return new SignJWT({
          iss: config.issuer,
          aud: config.audience,
          client_id: "signed-client",
          scope: config.requiredScopes.join(" "),
          exp: Math.floor(Date.now() / 1000) + 300,
          ...overrides,
        })
          .setProtectedHeader({ alg: "RS256", kid: "integration" })
          .sign(key);
      },
    };
  }
  const authorization = api.createMcpAuthorizationBoundary({
    ...config,
    verifier: signed
      ? api.createMcpJwtVerifier(config, signing.keySet)
      : {
          async verifyAccessToken(token) {
            if (verifyAccessToken) return verifyAccessToken(token);
            return {
              token,
              clientId: token,
              scopes: token === "no-scope" ? [] : ["mcp:use"],
              expiresAt: Math.floor(Date.now() / 1000) + 300,
              resource: new URL(remoteConfig.resourceUrl),
            };
          },
        },
  });
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
    authorization: local ? undefined : authorization,
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
            ...(token === undefined
              ? {}
              : { Authorization: `Bearer ${token}` }),
            ...(sessionId === undefined ? {} : { "Mcp-Session-Id": sessionId }),
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

    seenAuth: () => seenAuth,
    sign: signing?.sign,
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

test("SDK bearer boundary rejects missing authorization and insufficient scope", async (t) => {
  const { request, authorization } = await fixture(t);
  const missing = await request();
  assert.equal(missing.status, 401);
  assert.equal(missing.headers.connection, "close");
  assert.ok(
    missing.headers["www-authenticate"].includes(authorization.metadataUrl),
  );
  assert.equal((await request({ token: "no-scope" })).status, 403);
  for (const method of ["GET", "DELETE"]) {
    assert.equal(
      (await request({ method, sessionId: "unknown", body: "" })).status,
      401,
    );
  }
});

test("bearer auth is rechecked across a stateful MCP session", async (t) => {
  const { request, seenAuth } = await fixture(t);
  const token = "principal-123";

  const initialized = await request({ token, body: initializeBody() });
  assert.equal(initialized.status, 200);
  assert.equal(initialized.json().result.protocolVersion, "2025-11-25");
  assert.equal(initialized.headers["mcp-session-id"], "auth-session-1");

  const withoutBearer = await request({ sessionId: "auth-session-1" });
  assert.equal(withoutBearer.status, 401);

  const list = await request({ token, sessionId: "auth-session-1" });
  assert.equal(list.status, 200);
  assert.ok(
    list.json().result.tools.some((tool) => tool.name === "auth_probe"),
  );

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

test("local initialize remains unauthenticated", async (t) => {
  const { request } = await fixture(t, true);
  assert.equal((await request({ body: initializeBody() })).status, 200);
});

test("PRM exposes exact root and mapped resource identities and optional scopes", async (t) => {
  for (const resourceUrl of [
    "https://mcp.example",
    "https://mcp.example/mcp",
    "https://mcp.example/services/mcp",
  ]) {
    for (const requiredScopes of [[], ["MCP:Use", "*"]]) {
      const { request, authorization } = await fixture(t, false, {
        ...remoteConfig,
        resourceUrl,
        requiredScopes,
      });
      const path = new URL(authorization.metadataUrl).pathname;
      const expectedPath =
        "/.well-known/oauth-protected-resource" +
        (new URL(resourceUrl).pathname === "/"
          ? ""
          : new URL(resourceUrl).pathname);
      assert.equal(path, expectedPath);
      const response = await request({ path, method: "GET", body: "" });
      assert.equal(response.status, 200);
      assert.deepEqual(response.json(), {
        resource: resourceUrl,
        authorization_servers: [remoteConfig.issuer],
        ...(requiredScopes.length ? { scopes_supported: requiredScopes } : {}),
      });
      assert.equal(response.headers["access-control-allow-origin"], "*");
      assert.equal(
        (await request({ path, method: "HEAD", body: "" })).text,
        "",
      );
      const options = await request({
        path,
        method: "OPTIONS",
        body: "",
        headers: {
          "Access-Control-Request-Headers":
            "Content-Type, MCP-Protocol-Version",
        },
      });
      assert.equal(options.status, 204);
      assert.ok(
        options.headers["access-control-allow-headers"].includes(
          "MCP-Protocol-Version",
        ),
      );
      const denied = await request({ path, method: "POST" });
      assert.equal(denied.status, 405);
      assert.equal(denied.headers.allow, "GET, HEAD, OPTIONS");
    }
  }
});

test("signed JWT reaches initialize with distinct audience and request-local principals", async (t) => {
  const { request, sign, seenAuth } = await fixture(
    t,
    false,
    {
      ...remoteConfig,
      resourceUrl: "https://mcp.example/services/mcp",
      audience: "api-audience",
      requiredScopes: ["MCP:Use", "*"],
    },
    true,
  );
  const token = await sign();
  const initialized = await request({ token, body: initializeBody() });
  assert.equal(initialized.status, 200);
  const sessionId = initialized.headers["mcp-session-id"];
  assert.equal((await request({ sessionId })).status, 401);
  assert.equal((await request({ token, sessionId })).status, 200);
  const newer = await sign({ client_id: "second-client" });
  assert.equal(
    (
      await request({
        token: newer,
        sessionId,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: { name: "auth_probe", arguments: {} },
        }),
      })
    ).status,
    200,
  );
  assert.equal(seenAuth().clientId, "second-client");
  assert.equal(String(seenAuth().resource), "https://mcp.example/services/mcp");
  for (const method of ["GET", "DELETE"])
    assert.equal((await request({ method, sessionId, body: "" })).status, 401);
  for (const overrides of [
    { iss: "https://wrong.example" },
    { aud: "wrong" },
    { exp: 1 },
  ])
    assert.equal(
      (await request({ token: await sign(overrides), sessionId })).status,
      401,
    );
  const { generateKeyPair } = await import("jose");
  const { privateKey } = await generateKeyPair("RS256");
  assert.equal(
    (await request({ token: await sign({}, privateKey), sessionId })).status,
    401,
  );
  assert.equal(
    (await request({ token: await sign({ scope: "MCP:Use" }), sessionId }))
      .status,
    403,
  );
  assert.equal(
    (await request({ token, method: "DELETE", sessionId, body: "" })).status,
    200,
  );
  assert.equal((await request({ token, sessionId })).status, 404);
});

test("omitted global scopes accept signed tokens without scope claims", async (t) => {
  const { request, sign } = await fixture(
    t,
    false,
    { ...remoteConfig, requiredScopes: [] },
    true,
  );
  assert.equal(
    (
      await request({
        token: await sign({ scope: undefined }),
        body: initializeBody(),
      })
    ).status,
    200,
  );
});

test("shutdown while verification is pending answers the connected request", async (t) => {
  let release, started;
  const waiting = new Promise((resolve) => {
    started = resolve;
  });
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const { request, app } = await fixture(
    t,
    false,
    remoteConfig,
    false,
    async (token) => {
      started();
      await gate;
      return {
        token,
        clientId: "pending",
        scopes: ["mcp:use"],
        expiresAt: Math.floor(Date.now() / 1000) + 300,
        resource: new URL(remoteConfig.resourceUrl),
      };
    },
  );
  const pending = request({ token: "pending", body: initializeBody() });
  await waiting;
  const shutdown = app.shutdown();
  release();
  assert.equal((await pending).status, 503);
  await shutdown;
});
