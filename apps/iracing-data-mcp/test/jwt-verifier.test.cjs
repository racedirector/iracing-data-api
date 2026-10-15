const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const base = {
  resourceUrl: "https://mcp.example/services/mcp",
  issuer: "https://issuer.example/tenant",
};

async function signingFixture(config) {
  const { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } =
    await import("jose");
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "fixture", alg: "RS256" };
  return {
    jwk,
    keySet: createLocalJWKSet({ keys: [jwk] }),
    async sign(overrides = {}, key = privateKey) {
      return new SignJWT({
        iss: config.issuer,
        aud: config.audience,
        client_id: "client",
        azp: "authorized-party",
        sub: "subject",
        scope: "MCP:Use * read:content",
        exp: Math.floor(Date.now() / 1000) + 300,
        ...overrides,
      })
        .setProtectedHeader({ alg: "RS256", kid: "fixture" })
        .sign(key);
    },
  };
}

test("remote configuration defaults and exact opaque identifiers", async () => {
  const api = await import("../dist/index.js");
  for (const resourceUrl of [
    "https://mcp.example",
    "https://mcp.example/mcp",
    base.resourceUrl,
  ]) {
    const config = api.parseMcpRemoteAuthorizationConfig({
      ...base,
      resourceUrl,
    });
    assert.equal(config.resourceUrl, resourceUrl);
    assert.equal(config.audience, resourceUrl);
    assert.deepEqual(config.requiredScopes, []);
  }
  const config = api.parseMcpRemoteAuthorizationConfig({
    ...base,
    audience: "api-audience",
    requiredScopes: ["MCP:Use", "*", "read:content"],
  });
  assert.equal(config.audience, "api-audience");
  assert.deepEqual(config.requiredScopes, ["MCP:Use", "*", "read:content"]);
  assert.deepEqual(
    api.parseOAuthScopes("MCP:Use * read:content"),
    config.requiredScopes,
  );
  for (const invalid of [
    { ...base, resourceUrl: "http://mcp.example" },
    { ...base, resourceUrl: "https://user@mcp.example" },
    { ...base, resourceUrl: "https://mcp.example/#fragment" },
    { ...base, issuer: "https://issuer.example/?query" },
  ])
    assert.throws(() => api.parseMcpRemoteAuthorizationConfig(invalid));
  assert.throws(() => api.parseOAuthScopes("read\twrite"));
  const { parseProductionConfig } = await import("../dist/production.js");
  assert.equal(
    parseProductionConfig({ IRACING_MCP_CLIENT_ID: "client" })
      .remoteAuthorization,
    undefined,
  );
  assert.equal(
    parseProductionConfig({
      IRACING_MCP_CLIENT_ID: "client",
      IRACING_MCP_RESOURCE_URL: base.resourceUrl,
      IRACING_MCP_AUTH_ISSUER: base.issuer,
    }).remoteAuthorization.audience,
    base.resourceUrl,
  );
  for (const env of [
    { IRACING_MCP_RESOURCE_URL: base.resourceUrl },
    { IRACING_MCP_AUTH_ISSUER: base.issuer },
    { IRACING_MCP_AUTH_SCOPES: "*" },
  ])
    assert.throws(() =>
      parseProductionConfig({ IRACING_MCP_CLIENT_ID: "client", ...env }),
    );
});

test("JWT verifier enforces trust and maps canonical resource independently of audience", async () => {
  const api = await import("../dist/index.js");
  const config = api.parseMcpRemoteAuthorizationConfig({
    ...base,
    audience: "api-audience",
  });
  const fixture = await signingFixture(config);
  const verifier = api.createMcpJwtVerifier(config, fixture.keySet);
  const auth = await verifier.verifyAccessToken(await fixture.sign());
  assert.equal(auth.clientId, "client");
  assert.equal(String(auth.resource), base.resourceUrl);
  assert.deepEqual(auth.scopes, ["MCP:Use", "*", "read:content"]);
  assert.ok(auth.expiresAt > Date.now() / 1000);
  assert.equal(
    (
      await verifier.verifyAccessToken(
        await fixture.sign({ client_id: undefined }),
      )
    ).clientId,
    "authorized-party",
  );
  assert.equal(
    (
      await verifier.verifyAccessToken(
        await fixture.sign({ client_id: undefined, azp: undefined }),
      )
    ).clientId,
    "subject",
  );
  assert.deepEqual(
    (await verifier.verifyAccessToken(await fixture.sign({ scope: undefined })))
      .scopes,
    [],
  );
  for (const overrides of [
    { iss: "https://untrusted.example" },
    { aud: "wrong" },
    { exp: 1 },
    { exp: undefined },
  ])
    await assert.rejects(
      verifier.verifyAccessToken(await fixture.sign(overrides)),
      (error) => error.code === "invalid_token",
    );
  const { generateKeyPair } = await import("jose");
  const { privateKey } = await generateKeyPair("RS256");
  await assert.rejects(
    verifier.verifyAccessToken(await fixture.sign({}, privateKey)),
    (error) => error.code === "invalid_token",
  );
});

test("issuer-driven discovery and local JWKS fixture fail closed", async (t) => {
  const api = await import("../dist/index.js");
  const config = api.parseMcpRemoteAuthorizationConfig(base);
  const signing = await signingFixture(config);
  let metadata = {
    issuer: base.issuer,
    jwks_uri: "https://issuer.example/keys",
  };
  let rfcStatus = 200;
  const paths = [];
  const server = http.createServer((req, res) => {
    paths.push(req.url);
    if (req.url === "/keys") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ keys: [signing.jwk] }));
      return;
    }
    res.writeHead(
      req.url.startsWith("/.well-known/oauth-authorization-server")
        ? rfcStatus
        : 200,
      { "Content-Type": "application/json" },
    );
    res.end(JSON.stringify(metadata));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const fetchFixture = (url, options) =>
    fetch(origin + new URL(url).pathname, options);
  assert.equal(
    String(await api.resolveMcpJwksUrl(config, fetchFixture)),
    metadata.jwks_uri,
  );
  assert.equal(paths[0], "/.well-known/oauth-authorization-server/tenant");
  const { createRemoteJWKSet } = await import("jose");
  const verifier = api.createMcpJwtVerifier(
    config,
    createRemoteJWKSet(new URL(origin + "/keys")),
  );
  assert.equal(
    (await verifier.verifyAccessToken(await signing.sign())).clientId,
    "client",
  );
  rfcStatus = 404;
  await api.resolveMcpJwksUrl(config, fetchFixture);
  assert.ok(paths.includes("/tenant/.well-known/openid-configuration"));
  rfcStatus = 200;
  for (const invalid of [
    { issuer: "https://wrong.example", jwks_uri: metadata.jwks_uri },
    { issuer: base.issuer },
    { issuer: base.issuer, jwks_uri: "http://unsafe.example" },
  ]) {
    metadata = invalid;
    await assert.rejects(api.resolveMcpJwksUrl(config, fetchFixture));
  }
  const explicit = api.parseMcpRemoteAuthorizationConfig({
    ...base,
    jwksUrl: "https://keys.example/jwks",
  });
  assert.equal(
    String(
      await api.resolveMcpJwksUrl(explicit, () => {
        throw new Error("Must not discover");
      }),
    ),
    explicit.jwksUrl,
  );
  await assert.rejects(
    api.resolveMcpJwksUrl(
      config,
      async () => new Response(null, { status: 503 }),
    ),
  );
  await assert.rejects(
    verifier.verifyAccessToken("iracing-style-access-token"),
    (error) => error.code === "invalid_token",
  );
});
