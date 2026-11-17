const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.fixture`;

test("local credentials refresh once and persist rotated tokens before API use", async (t) => {
  const { createFileCapabilities } = await import("../dist/credentials.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "credentials.json");
  await fs.writeFile(
    file,
    JSON.stringify({
      access_token: jwt(1),
      refresh_token: "original-refresh",
      token_type: "Bearer",
      expires_in: 3600,
    }),
    { mode: 0o600 },
  );
  const issued = {
    access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
    refresh_token: "rotated-refresh",
    token_type: "Bearer",
    expires_in: 3600,
  };
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  let refreshes = 0;
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    if (url.hostname === "oauth.iracing.com") {
      refreshes++;
      const body = new URLSearchParams(init.body);
      assert.equal(body.get("grant_type"), "refresh_token");
      assert.equal(body.get("refresh_token"), "original-refresh");
      assert.equal(body.get("client_id"), "fixture-client");
      return Response.json(issued);
    }
    if (url.hostname === "members-ng.iracing.com") {
      assert.equal(
        new Headers(init.headers).get("authorization"),
        `Bearer ${issued.access_token}`,
      );
      assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), issued);
      return Response.json({
        link: "https://cache.example.test/member",
        expires: new Date(Date.now() + 60000).toISOString(),
      });
    }
    return Response.json({ cust_id: 42, display_name: "Fixture Driver" });
  };
  const capabilities = createFileCapabilities(file, {
    clientId: "fixture-client",
    scopes: [],
  });
  const query = () =>
    capabilities.driverQueries.getCurrent({
      signal: new AbortController().signal,
    });
  await Promise.all([query(), query()]);
  await query();
  assert.equal(refreshes, 1);

  // A long-running connection must observe a subsequent CLI login.
  const replacement = {
    ...issued,
    access_token: jwt(Math.floor(Date.now() / 1000) + 7200),
    refresh_token: "replacement-refresh",
  };
  await fs.writeFile(file, JSON.stringify(replacement), { mode: 0o600 });
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    assert.notEqual(url.hostname, "oauth.iracing.com");
    if (url.hostname === "members-ng.iracing.com") {
      assert.equal(
        new Headers(init.headers).get("authorization"),
        `Bearer ${replacement.access_token}`,
      );
      return Response.json({
        link: "https://cache.example.test/member",
        expires: new Date(Date.now() + 60000).toISOString(),
      });
    }
    return Response.json({ cust_id: 42, display_name: "Fixture Driver" });
  };
  await query();
  assert.equal(refreshes, 1);

  // Missing credentials fail before any protected-resource request.
  await fs.unlink(file);
  globalThis.fetch = async () => {
    assert.fail("No network request is allowed without credentials");
  };
  await assert.rejects(query(), { name: "ApplicationFailure" });
});

test("local diagnostics retain OAuth detail without turning tool auth failures into INTERNAL_ERROR", async (t) => {
  const { createFileAccessTokenProvider, createFileCapabilities } =
    await import("../dist/credentials.js");
  const { errorEnvelope, createRequestContext } =
    await import("@iracing-data/mcp");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-auth-diagnostics-"),
  );
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "credentials.json");
  const metadata = { clientId: "fixture-client", scopes: [] };
  const token = createFileAccessTokenProvider(file, metadata);
  const envelope = (error) =>
    errorEnvelope(error.failure ?? error, createRequestContext()).error;

  await assert.rejects(token(), (error) => {
    assert.match(error.message, /No OAuth session found/);
    assert.ok(error.message.includes(file));
    assert.equal(envelope(error).code, "AUTHORIZATION_REQUIRED");
    assert.equal(envelope(error).reason, "missing_session");
    assert.ok(!envelope(error).message.includes(file));
    return true;
  });
  const capabilities = createFileCapabilities(file, metadata);
  await assert.rejects(
    capabilities.driverQueries.getCurrent({
      signal: new AbortController().signal,
    }),
    (error) => envelope(error).code === "AUTHORIZATION_REQUIRED",
  );

  await fs.writeFile(file, "not JSON", { mode: 0o600 });
  await assert.rejects(token(), (error) => {
    assert.match(error.message, /restoration failed/);
    assert.ok(error.cause instanceof Error);
    assert.equal(envelope(error).code, "AUTHORIZATION_REQUIRED");
    return true;
  });

  await fs.writeFile(
    file,
    JSON.stringify({
      access_token: jwt(1),
      token_type: "Bearer",
      expires_in: 3600,
    }),
    { mode: 0o600 },
  );
  await assert.rejects(token(), (error) => {
    assert.equal(envelope(error).code, "TOKEN_REFRESH_FAILED");
    assert.match(error.message, /Missing refresh token/);
    assert.ok(error.cause instanceof Error);
    return true;
  });
  await assert.rejects(
    capabilities.driverQueries.getCurrent({
      signal: new AbortController().signal,
    }),
    (error) => envelope(error).code === "TOKEN_REFRESH_FAILED",
  );

  // A corrected external login is observed by the same long-lived resolver.
  const access = jwt(Math.floor(Date.now() / 1000) + 3600);
  await fs.writeFile(
    file,
    JSON.stringify({
      access_token: access,
      token_type: "Bearer",
      expires_in: 3600,
    }),
    { mode: 0o600 },
  );
  assert.equal(await token(), access);
});
