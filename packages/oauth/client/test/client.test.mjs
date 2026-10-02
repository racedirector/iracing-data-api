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

function setup(metadata = {}) {
  const stateStore = new InMemoryStore();
  const sessionStore = new InMemoryStore();
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

for (const [refresh_token, code] of [
  [undefined, "MISSING_REFRESH_TOKEN"],
  [jwt(1), "REFRESH_TOKEN_EXPIRED"],
]) {
  test(`unrefreshable session fails before network: ${code}`, async () => {
    mockFetch();
    const { client, sessionStore } = setup();
    const stored = token({ access_token: jwt(1), refresh_token });
    sessionStore.set("session", stored);
    await assert.rejects(
      client.restoreSessionForId("session"),
      (error) => error instanceof OAuthRefreshError && error.code === code,
    );
    assert.deepEqual(sessionStore.get("session"), stored);
  });
}

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
  assert.deepEqual(await client.restoreSessionForId("session"), issued);
  assert.deepEqual(sessionStore.get("session"), { ...stored, ...issued });
});

for (const profile of [
  { iracing_name: "Fixture", iracing_cust_id: 42 },
  { iracing_name: "Fixture", iracing_cust_id: "invalid" },
]) {
  test(`callback honors explicit session ID and rejects malformed profile: ${profile.iracing_cust_id}`, async () => {
    const { client, sessionStore, stateStore } = setup();
    const { state } = await client.authorize();
    const issued = token();
    let calls = 0;
    mockFetch(async () => json(++calls === 1 ? issued : profile));
    const callback = client.callback(
      new URLSearchParams({ state, code: "fixture" }),
      "explicit-session",
    );
    if (typeof profile.iracing_cust_id === "number") {
      assert.deepEqual(await callback, issued);
      assert.deepEqual(sessionStore.get("explicit-session"), issued);
      assert.equal(sessionStore.get("42"), undefined);
    } else {
      await assert.rejects(callback);
      assert.equal(sessionStore.get("explicit-session"), undefined);
    }
    assert.equal(stateStore.get(state), undefined);
  });
}
