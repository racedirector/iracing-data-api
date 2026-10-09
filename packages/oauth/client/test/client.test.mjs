import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { afterEach, beforeEach, test } from "node:test";
import runtime from "../dist/index.js";
import utils from "../dist/utils.js";

const {
  OAuthClient,
  InMemoryStore,
  OAuthCallbackError,
  OAuthRefreshError,
  SessionNotFoundError,
} = runtime;
const { maskSecret } = utils;
const originalFetch = globalThis.fetch;
const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.fixture`;
const future = () => Math.floor(Date.now() / 1000) + 3600;
const token = (overrides = {}) => ({
  access_token: jwt(future()),
  token_type: "Bearer",
  expires_in: 3600,
  ...overrides,
});
const json = (body, status = 200) => Response.json(body, { status });

function setup(metadata = {}, sessionStore = new InMemoryStore()) {
  const stateStore = new InMemoryStore();
  const client = new OAuthClient({
    clientMetadata: {
      clientId: "fixture-client",
      redirectUri: "https://client.example/callback",
      scopes: ["iracing.auth", "iracing.profile"],
      ...metadata,
    },
    stateStore,
    sessionStore,
  });
  return { client, stateStore, sessionStore };
}

function deferred() {
  return Promise.withResolvers();
}

// No request can reach the network: every test starts with a rejecting fetch.
afterEach(() => {
  globalThis.fetch = originalFetch;
});
function mockFetch(
  handler = () => {
    throw new Error("Unexpected network request");
  },
) {
  globalThis.fetch = handler;
}

beforeEach(() => mockFetch());

test("masking has a fixed SHA-256/base64 vector and normalizes only the identifier", () => {
  assert.equal(
    maskSecret("secret", "  User@Example.COM  "),
    "ihBzlO6bnu0lfgFIo+8L4Sq3a+vl4rzfyPtyHKb2TO8=",
  );
  assert.notEqual(
    maskSecret(" secret", "user@example.com"),
    maskSecret("secret", "user@example.com"),
  );
});

test("authorize stores state/verifier and constructs an S256 request", async () => {
  mockFetch();
  const { client, stateStore } = setup();
  const { url, verifier, state } = await client.authorize();
  assert.equal(
    url.origin + url.pathname,
    "https://oauth.iracing.com/oauth2/authorize",
  );
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://client.example/callback",
  );
  assert.equal(url.searchParams.get("client_id"), "fixture-client");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("scope"), "iracing.auth iracing.profile");
  assert.equal(url.searchParams.get("state"), state);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(
    url.searchParams.get("code_challenge"),
    createHash("sha256").update(verifier).digest("base64url"),
  );
  assert.equal(stateStore.get(state).verifier, verifier);
});

test("callback exchanges the code, consumes state, and persists the profile session", async () => {
  const { client, stateStore, sessionStore } = setup();
  mockFetch();
  const { state, verifier } = await client.authorize();
  const issued = token();
  const requests = [];
  mockFetch(async (url, options) => {
    requests.push(String(url));
    if (requests.length === 1) {
      const body = new URLSearchParams(options.body);
      assert.equal(body.get("grant_type"), "authorization_code");
      assert.equal(body.get("code"), "code +&=");
      assert.equal(body.get("code_verifier"), verifier);
      assert.equal(body.get("redirect_uri"), "https://client.example/callback");
      return json(issued);
    }
    assert.equal(
      new Headers(options.headers).get("authorization"),
      `Bearer ${issued.access_token}`,
    );
    return json({ iracing_name: "Fixture Driver", iracing_cust_id: 42 });
  });
  const params = new URLSearchParams({ state, code: "code +&=" });
  assert.deepEqual(await client.callback(params), issued);
  assert.equal(stateStore.get(state), undefined);
  assert.deepEqual(sessionStore.get("42"), issued);
  assert.deepEqual(requests, [
    "https://oauth.iracing.com/oauth2/token",
    "https://oauth.iracing.com/oauth2/iracing/profile",
  ]);
  await assert.rejects(client.callback(params), OAuthCallbackError);
  assert.equal(requests.length, 2);
});

test("callback with explicit session ID stores directly without a profile request", async () => {
  const { client, sessionStore, stateStore } = setup({
    scopes: ["iracing.auth"],
  });
  const { state } = await client.authorize();
  const issued = token({ scope: "iracing.auth" });
  const requests = [];
  mockFetch(async (url) => {
    requests.push(String(url));
    assert.equal(requests.length, 1);
    assert.equal(String(url), "https://oauth.iracing.com/oauth2/token");
    return json(issued);
  });

  assert.deepEqual(
    await client.callback(
      new URLSearchParams({ state, code: "fixture" }),
      "explicit-session",
    ),
    issued,
  );
  assert.deepEqual(sessionStore.get("explicit-session"), issued);
  assert.equal(sessionStore.get("42"), undefined);
  assert.equal(stateStore.get(state), undefined);
  assert.deepEqual(requests, ["https://oauth.iracing.com/oauth2/token"]);
});

for (const params of [{}, { state: "unknown", code: "code" }]) {
  test(`callback rejects missing/unknown state: ${JSON.stringify(params)}`, async () => {
    mockFetch();
    await assert.rejects(
      setup().client.callback(new URLSearchParams(params)),
      OAuthCallbackError,
    );
  });
}

for (const failure of [
  { error: "access_denied", error_description: "Fixture denial" },
  {},
]) {
  test(`callback consumes known state on failure: ${JSON.stringify(failure)}`, async () => {
    mockFetch();
    const { client, stateStore } = setup();
    const { state } = await client.authorize();
    await assert.rejects(
      client.callback(new URLSearchParams({ state, ...failure })),
      OAuthCallbackError,
    );
    assert.equal(stateStore.get(state), undefined);
  });
}

test("password-limited request form encodes masked credentials and stores by username", async () => {
  const { client, sessionStore } = setup({
    username: "fixture+driver@example.com",
    password: "fixture-password",
    clientSecret: "fixture-secret",
  });
  const issued = token();
  mockFetch(async (url, options) => {
    assert.equal(String(url), "https://oauth.iracing.com/oauth2/token");
    assert.equal(options.method, "POST");
    assert.equal(
      new Headers(options.headers).get("content-type"),
      "application/x-www-form-urlencoded",
    );
    const body = new URLSearchParams(options.body);
    assert.equal(body.get("grant_type"), "password_limited");
    assert.equal(body.get("username"), "fixture+driver@example.com");
    assert.equal(
      body.get("password"),
      maskSecret("fixture-password", "fixture+driver@example.com"),
    );
    assert.equal(
      body.get("client_secret"),
      maskSecret("fixture-secret", "fixture-client"),
    );
    assert.equal(body.get("scope"), "iracing.auth iracing.profile");
    return json(issued);
  });
  assert.deepEqual(await client.passwordLimitedAuthorization(), issued);
  assert.deepEqual(sessionStore.get("fixture+driver@example.com"), issued);
});

for (const response of [
  () => json({ error: "invalid_grant" }, 400),
  () => json({ token_type: "Bearer", expires_in: 3600 }),
  () =>
    new Response("broken", { headers: { "content-type": "application/json" } }),
]) {
  test("failed password grant never writes a session", async () => {
    const { client, sessionStore } = setup({
      username: "fixture",
      password: "fixture",
      clientSecret: "fixture",
    });
    mockFetch(async () => response());
    await assert.rejects(client.passwordLimitedAuthorization());
    assert.equal(sessionStore.get("fixture"), undefined);
  });
}

test("expired session refresh rotates tokens before making a protected request", async () => {
  const { client, sessionStore } = setup({ clientSecret: "fixture-secret" });
  const old = token({ access_token: jwt(1), refresh_token: jwt(future()) });
  const rotated = token({ refresh_token: jwt(future() + 1) });
  sessionStore.set("session", old);
  let calls = 0;
  mockFetch(async (url, options) => {
    calls++;
    if (calls === 1) {
      const body = new URLSearchParams(options.body);
      assert.equal(body.get("grant_type"), "refresh_token");
      assert.equal(body.get("refresh_token"), old.refresh_token);
      assert.equal(
        body.get("client_secret"),
        maskSecret("fixture-secret", "fixture-client"),
      );
      return json(rotated);
    }
    assert.equal(String(url), "https://members-ng.iracing.com/data/member/get");
    assert.equal(
      new Headers(options.headers).get("authorization"),
      `Bearer ${rotated.access_token}`,
    );
    return json({ ok: true });
  });
  assert.deepEqual(
    await (
      await client.makeProtectedRequest("session", "GET", "/data/member/get")
    ).json(),
    { ok: true },
  );
  assert.deepEqual(sessionStore.get("session"), rotated);
  assert.equal(calls, 2);
});

test("valid and missing sessions require no refresh", async () => {
  mockFetch();
  const { client, sessionStore } = setup();
  const stored = token();
  sessionStore.set("valid", stored);
  assert.deepEqual(await client.restoreSessionForId("valid"), stored);
  assert.equal(await client.restoreSessionForId("missing"), undefined);
  await assert.rejects(
    client.makeProtectedRequest("missing", "GET", "/data/doc"),
    SessionNotFoundError,
  );
});

test("expired session without a refresh token fails before network", async () => {
  mockFetch();
  const { client, sessionStore } = setup();
  const stored = token({ access_token: jwt(1) });
  sessionStore.set("session", stored);
  await assert.rejects(
    client.restoreSessionForId("session"),
    (error) =>
      error instanceof OAuthRefreshError &&
      error.code === "MISSING_REFRESH_TOKEN",
  );
  assert.deepEqual(sessionStore.get("session"), stored);
});

test("refresh error retains structured information and leaves stored tokens intact", async () => {
  const { client, sessionStore } = setup();
  const stored = token({ access_token: jwt(1), refresh_token: jwt(future()) });
  sessionStore.set("session", stored);
  mockFetch(async () =>
    json(
      { error: "invalid_grant", error_description: "Fixture refresh rejected" },
      400,
    ),
  );
  await assert.rejects(
    client.restoreSessionForId("session"),
    (error) =>
      error instanceof OAuthRefreshError &&
      error.description === "Fixture refresh rejected",
  );
  assert.deepEqual(sessionStore.get("session"), stored);
});

test("session-store write failure propagates to the caller", async () => {
  const { stateStore } = setup();
  const failure = new Error("Fixture store unavailable");
  const client = new OAuthClient({
    clientMetadata: {
      clientId: "fixture",
      username: "fixture",
      password: "fixture",
      clientSecret: "fixture",
      scopes: ["iracing.auth"],
    },
    stateStore,
    sessionStore: {
      get() {},
      del() {},
      set() {
        throw failure;
      },
    },
  });
  mockFetch(async () => json(token()));
  await assert.rejects(
    client.passwordLimitedAuthorization(),
    (error) => error === failure,
  );
});

for (const response of [
  () => json({ access_token: "fixture", token_type: "MAC", expires_in: 3600 }),
  () => json({ access_token: "fixture", token_type: "Bearer" }),
  () => {
    throw new Error("Fixture transport failure");
  },
]) {
  test("malformed/failed refresh leaves the original session intact", async () => {
    const { client, sessionStore } = setup();
    const stored = token({
      access_token: jwt(1),
      refresh_token: jwt(future()),
    });
    sessionStore.set("session", stored);
    mockFetch(async () => response());
    await assert.rejects(client.restoreSessionForId("session"));
    assert.deepEqual(sessionStore.get("session"), stored);
  });
}

test("refresh preserves a stored refresh token when the response omits rotation", async () => {
  const { client, sessionStore } = setup();
  const stored = token({ access_token: jwt(1), refresh_token: jwt(future()) });
  sessionStore.set("session", stored);
  const issued = token();
  mockFetch(async () => json(issued));
  assert.deepEqual(await client.restoreSessionForId("session"), {
    ...stored,
    ...issued,
  });
  assert.deepEqual(sessionStore.get("session"), { ...stored, ...issued });
});

test("concurrent restorations share refresh through persistence and use rotated tokens later", async () => {
  const backing = new InMemoryStore();
  const writeStarted = deferred();
  const allowWrite = deferred();
  let writes = 0;
  const { client } = setup(
    {},
    {
      get: (id) => backing.get(id),
      del: (id) => backing.del(id),
      async set(id, session) {
        writes++;
        writeStarted.resolve();
        await allowWrite.promise;
        backing.set(id, session);
      },
    },
  );
  const old = token({
    access_token: jwt(1),
    refresh_token: jwt(future()),
    scope: "iracing.auth iracing.profile",
  });
  const rotated = token({ refresh_token: jwt(future() + 1) });
  const expected = { ...old, ...rotated };
  backing.set("session", old);
  const requestStarted = deferred();
  const response = deferred();
  const refreshTokens = [];
  mockFetch(async (url, options) => {
    assert.equal(String(url), "https://oauth.iracing.com/oauth2/token");
    const body = new URLSearchParams(options.body);
    assert.equal(body.get("grant_type"), "refresh_token");
    refreshTokens.push(body.get("refresh_token"));
    requestStarted.resolve();
    return response.promise;
  });
  let completed = 0;
  const restore = () =>
    client.restoreSessionForId("session").then((session) => {
      completed++;
      assert.deepEqual(backing.get("session"), session);
      return session;
    });
  const callers = Array.from({ length: 5 }, restore);
  await requestStarted.promise;
  assert.deepEqual(refreshTokens, [old.refresh_token]);
  response.resolve(json(rotated));
  await writeStarted.promise;
  assert.equal(completed, 0);
  assert.deepEqual(backing.get("session"), old);
  // Callers arriving while the rotated session is being written also wait.
  callers.push(restore());
  allowWrite.resolve();
  const results = await Promise.all(callers);
  for (const session of results) assert.deepEqual(session, expected);
  assert.equal(writes, 1);
  assert.deepEqual(await client.restoreSessionForId("session"), expected);
  assert.equal(refreshTokens.length, 1);

  backing.set("session", { ...expected, access_token: jwt(1) });
  const next = token({ refresh_token: jwt(future() + 2) });
  mockFetch(async (_url, options) => {
    refreshTokens.push(new URLSearchParams(options.body).get("refresh_token"));
    return json(next);
  });
  assert.deepEqual(await client.restoreSessionForId("session"), {
    ...expected,
    ...next,
  });
  assert.deepEqual(refreshTokens, [old.refresh_token, rotated.refresh_token]);
  assert.equal(writes, 2);
});

test("a delayed stale read rechecks the persisted session after refresh completes", async () => {
  const backing = new InMemoryStore();
  const staleRead = deferred();
  let reads = 0;
  const { client } = setup(
    {},
    {
      get(id) {
        return ++reads === 1 ? staleRead.promise : backing.get(id);
      },
      set: (id, session) => backing.set(id, session),
      del: (id) => backing.del(id),
    },
  );
  const old = token({ access_token: jwt(1), refresh_token: jwt(future()) });
  const rotated = token({ refresh_token: jwt(future() + 1) });
  backing.set("session", old);
  let requests = 0;
  mockFetch(async () => {
    requests++;
    return json(rotated);
  });
  const delayed = client.restoreSessionForId("session");
  assert.deepEqual(await client.restoreSessionForId("session"), rotated);
  staleRead.resolve(old);
  assert.deepEqual(await delayed, rotated);
  assert.equal(requests, 1);
});

for (const failure of ["oauth", "transport", "malformed", "persistence"]) {
  test(`concurrent ${failure} failure clears refresh coordination for retry`, async () => {
    const backing = new InMemoryStore();
    const response = deferred();
    const started = deferred();
    const storeFailure = new Error("Fixture persistence failure");
    let failWrite = failure === "persistence";
    const { client } = setup(
      {},
      {
        get: (id) => backing.get(id),
        del: (id) => backing.del(id),
        set(id, session) {
          if (failWrite) throw storeFailure;
          backing.set(id, session);
        },
      },
    );
    const old = token({ access_token: jwt(1), refresh_token: jwt(future()) });
    backing.set("session", old);
    let requests = 0;
    mockFetch(async () => {
      requests++;
      started.resolve();
      await response.promise;
      if (failure === "transport") throw new Error("Fixture transport failure");
      if (failure === "oauth") {
        return json(
          { error: "invalid_grant", error_description: "Fixture denial" },
          400,
        );
      }
      if (failure === "malformed") return json({ token_type: "Bearer" });
      return json(token({ refresh_token: jwt(future() + 1) }));
    });
    const callers = Array.from({ length: 4 }, () =>
      client.restoreSessionForId("session"),
    );
    const outcomes = Promise.allSettled(callers);
    await started.promise;
    response.resolve();
    const results = await outcomes;
    assert.equal(requests, 1);
    for (const result of results) {
      assert.equal(result.status, "rejected");
      assert.equal(result.reason, results[0].reason);
      if (failure === "oauth") {
        assert.ok(result.reason instanceof OAuthRefreshError);
        assert.equal(result.reason.description, "Fixture denial");
      }
      if (failure === "persistence") assert.equal(result.reason, storeFailure);
    }
    assert.deepEqual(backing.get("session"), old);
    failWrite = false;
    const rotated = token({ refresh_token: jwt(future() + 2) });
    mockFetch(async () => {
      requests++;
      return json(rotated);
    });
    assert.deepEqual(await client.restoreSessionForId("session"), rotated);
    assert.equal(requests, 2);
  });
}

test("different session IDs refresh independently while valid and missing sessions bypass refresh", async () => {
  const { client, sessionStore } = setup();
  const started = { a: deferred(), b: deferred() };
  const responses = { a: deferred(), b: deferred() };
  const old = {
    a: token({ access_token: jwt(1), refresh_token: jwt(future()) }),
    b: token({ access_token: jwt(1), refresh_token: jwt(future() + 1) }),
  };
  for (const id of ["a", "b"]) sessionStore.set(id, old[id]);
  const valid = token();
  sessionStore.set("valid", valid);
  let requests = 0;
  mockFetch(async (_url, options) => {
    requests++;
    const refreshToken = new URLSearchParams(options.body).get("refresh_token");
    const id = refreshToken === old.a.refresh_token ? "a" : "b";
    assert.equal(refreshToken, old[id].refresh_token);
    started[id].resolve();
    return responses[id].promise;
  });
  const a = client.restoreSessionForId("a");
  await started.a.promise;
  const b = client.restoreSessionForId("b");
  await started.b.promise;
  assert.deepEqual(await client.restoreSessionForId("valid"), valid);
  assert.equal(await client.restoreSessionForId("missing"), undefined);
  const rotatedB = token({ refresh_token: jwt(future() + 2) });
  responses.b.resolve(json(rotatedB));
  assert.deepEqual(await b, rotatedB);
  assert.deepEqual(sessionStore.get("a"), old.a);
  const rotatedA = token({ refresh_token: jwt(future() + 3) });
  responses.a.resolve(json(rotatedA));
  assert.deepEqual(await a, rotatedA);
  assert.equal(requests, 2);
});

test("malformed stored access_token fails before network and allows corrected session retry", async () => {
  const { client, sessionStore } = setup();
  sessionStore.set(
    "session",
    token({
      access_token: "malformed",
      refresh_token: jwt(future()),
    }),
  );
  await assert.rejects(client.restoreSessionForId("session"));
  const valid = token();
  sessionStore.set("session", valid);
  assert.deepEqual(await client.restoreSessionForId("session"), valid);
});

test("password-limited exchange preserves configured token path and query parameters", async () => {
  const endpoint =
    "https://auth.example/custom/exchange?tenant=a%2Bb&tenant=second";
  const { client } = setup({
    tokenUrl: endpoint,
    username: "fixture",
    password: "fixture",
    clientSecret: "fixture",
  });
  const issued = token();
  mockFetch(async (url, options) => {
    assert.equal(String(url), endpoint);
    assert.equal(
      new URLSearchParams(options.body).get("grant_type"),
      "password_limited",
    );
    return json(issued);
  });
  assert.deepEqual(await client.passwordLimitedAuthorization(), issued);
});

test("callback profile lookup preserves configured profile path and query parameters", async () => {
  const endpoint =
    "https://auth.example/custom/profile?tenant=a%2Bb&tenant=second";
  const { client, sessionStore } = setup({ userInfoUrl: endpoint });
  const { state } = await client.authorize();
  const issued = token();
  let calls = 0;
  mockFetch(async (url, options) => {
    if (++calls === 1) return json(issued);
    assert.equal(String(url), endpoint);
    assert.equal(
      new Headers(options.headers).get("authorization"),
      `Bearer ${issued.access_token}`,
    );
    return json({ iracing_cust_id: 42, iracing_name: "Example" });
  });
  await client.callback(new URLSearchParams({ state, code: "fixture-code" }));
  assert.equal(calls, 2);
  assert.deepEqual(sessionStore.get("42"), issued);
});
