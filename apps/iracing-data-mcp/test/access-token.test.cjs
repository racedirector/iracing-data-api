const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.fixture`;

async function fixture(t, token) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-provider-"));
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "credentials.json");
  if (token) {
    await fs.writeFile(file, JSON.stringify(token), { mode: 0o600 });
  }
  return file;
}

async function provider(file, overrides = {}) {
  const { createTokenProvider } = await import("../dist/index.js");
  const { OAuthTokenDocumentSessionStore } =
    await import("@iracing-data/oauth-client");
  const sessionKey = "fixture-owner";
  return createTokenProvider({
    clientId: "fixture-client",
    scopes: [],
    sessionKey,
    sessionStore: new OAuthTokenDocumentSessionStore({
      filePath: file,
      sessionKey,
    }),
    ...overrides,
  });
}

test("one provider refreshes once and persists rotation before concurrent API use", async (t) => {
  const { createFetchQueries } = await import("../dist/index.js");
  const file = await fixture(t, {
    access_token: jwt(1),
    refresh_token: "original-refresh",
    token_type: "Bearer",
    expires_in: 3600,
  });
  const issued = {
    access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
    refresh_token: "rotated-refresh",
    token_type: "Bearer",
    expires_in: 3600,
  };
  let refreshes = 0;
  t.mock.method(globalThis, "fetch", async (input, init) => {
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
  });
  const accessToken = await provider(file);
  const capabilities = createFetchQueries(accessToken);
  assert.equal(refreshes, 0);
  const query = () =>
    capabilities.driverQueries.getCurrent({
      signal: new AbortController().signal,
    });
  await Promise.all([query(), query(), query()]);
  await query();
  assert.equal(refreshes, 1);
});

test("a loaded document remains cached until the owner is recreated", async (t) => {
  const first = {
    access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
    token_type: "Bearer",
    expires_in: 3600,
  };
  const replacement = {
    ...first,
    access_token: jwt(Math.floor(Date.now() / 1000) + 7200),
  };
  const file = await fixture(t, first);
  const accessToken = await provider(file);
  assert.equal(await accessToken(), first.access_token);
  await fs.writeFile(file, JSON.stringify(replacement), { mode: 0o600 });
  assert.equal(await accessToken(), first.access_token);
  const restarted = await provider(file);
  assert.equal(await restarted(), replacement.access_token);
});

test("provider propagates store failures unchanged without logging", async (t) => {
  const { createTokenProvider } = await import("../dist/index.js");
  const expected = new Error("trusted store diagnostic");
  const writes = t.mock.method(process.stderr, "write", () => true);
  const token = createTokenProvider({
    clientId: "fixture-client",
    scopes: [],
    sessionKey: "selected-owner",
    sessionStore: {
      get: async (key) => {
        assert.equal(key, "selected-owner");
        throw expected;
      },
      set: async () => assert.fail("No persistence after read failure"),
      del: async () => assert.fail("No deletion after read failure"),
    },
  });
  await assert.rejects(token(), (error) => error === expected);
  assert.equal(writes.mock.callCount(), 0);
});

test("missing sessions remain authorization failures; refresh errors propagate", async (t) => {
  const { OAuthRefreshError } = await import("@iracing-data/oauth-client");
  const { errorEnvelope, createRequestContext } =
    await import("@iracing-data/mcp");
  const missing = await provider(await fixture(t));
  await assert.rejects(missing(), (error) => {
    const failure = errorEnvelope(error.failure, createRequestContext()).error;
    return (
      failure.code === "AUTHORIZATION_REQUIRED" &&
      failure.reason === "missing_session"
    );
  });

  const file = await fixture(t, {
    access_token: jwt(1),
    token_type: "Bearer",
    expires_in: 3600,
  });
  const token = await provider(file);
  await assert.rejects(token(), (error) => error instanceof OAuthRefreshError);
});

test("failed rotated-token persistence quarantines the owner without another refresh", async (t) => {
  const { OAuthTokenDocumentSessionStore } =
    await import("@iracing-data/oauth-client");
  const file = await fixture(t, {
    access_token: jwt(1),
    refresh_token: "original-refresh",
    token_type: "Bearer",
    expires_in: 3600,
  });
  let refreshes = 0;
  t.mock.method(globalThis, "fetch", async () => {
    refreshes++;
    return Response.json({
      access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
      refresh_token: "rotated-refresh",
      token_type: "Bearer",
      expires_in: 3600,
    });
  });
  const sessionKey = "fixture-owner";
  const token = await provider(file, {
    sessionStore: new OAuthTokenDocumentSessionStore({
      filePath: file,
      sessionKey,
      fileSystem: {
        rename: async () => {
          throw new Error("Cannot persist");
        },
      },
    }),
  });
  await assert.rejects(token(), (error) => error.code === "io_error");
  await assert.rejects(token(), (error) => error.code === "store_quarantined");
  assert.equal(refreshes, 1);
});
