import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import runtime from "../dist/index.js";
import utils from "../dist/utils.js";

const { OAuthClient, InMemoryStore, OAuthRefreshError } = runtime;
const { isRefreshTokenExpired } = utils;
const originalFetch = globalThis.fetch;
const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.fixture`;
const future = () => Math.floor(Date.now() / 1000) + 3600;
const opaqueRefreshToken = "opaque.part-two.part-three.part-four.part-five";
const token = (overrides = {}) => ({
  access_token: jwt(future()),
  token_type: "Bearer",
  expires_in: 3600,
  ...overrides,
});
const json = (body, status = 200) => Response.json(body, { status });

function setup(sessionStore = new InMemoryStore()) {
  const client = new OAuthClient({
    clientMetadata: {
      clientId: "fixture-client",
      redirectUri: "https://client.example/callback",
      scopes: ["iracing.auth"],
    },
    stateStore: new InMemoryStore(),
    sessionStore,
  });
  return { client, sessionStore };
}

function deferred() {
  return Promise.withResolvers();
}

function mockFetch(
  handler = () => {
    throw new Error("Unexpected network request");
  },
) {
  globalThis.fetch = handler;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

beforeEach(() => mockFetch());

test("restoration treats an opaque refresh credential as a grant input and preserves it when rotation is omitted", async () => {
  const backing = new InMemoryStore();
  const writeStarted = deferred();
  const allowWrite = deferred();
  let writes = 0;
  const { client } = setup({
    get: (id) => backing.get(id),
    del: (id) => backing.del(id),
    async set(id, session) {
      writes++;
      writeStarted.resolve();
      await allowWrite.promise;
      backing.set(id, session);
    },
  });
  const stored = token({
    access_token: jwt(1),
    refresh_token: opaqueRefreshToken,
    scope: "iracing.auth",
  });
  const issued = token({ scope: "iracing.auth" });
  const expected = { ...stored, ...issued };
  backing.set("session", stored);

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

  const callers = Array.from({ length: 4 }, restore);
  await requestStarted.promise;
  assert.deepEqual(refreshTokens, [opaqueRefreshToken]);

  response.resolve(json(issued));
  await writeStarted.promise;
  assert.equal(completed, 0);
  assert.deepEqual(backing.get("session"), stored);

  callers.push(restore());
  allowWrite.resolve();
  const results = await Promise.all(callers);
  for (const session of results) assert.deepEqual(session, expected);
  assert.equal(writes, 1);
  assert.deepEqual(backing.get("session"), expected);
  assert.equal(expected.refresh_token, opaqueRefreshToken);
});

test("issuer invalid_grant decides opaque refresh-token validity", async () => {
  const { client, sessionStore } = setup();
  const stored = token({
    access_token: jwt(1),
    refresh_token: opaqueRefreshToken,
  });
  sessionStore.set("session", stored);
  let requests = 0;
  mockFetch(async (_url, options) => {
    requests++;
    assert.equal(
      new URLSearchParams(options.body).get("refresh_token"),
      opaqueRefreshToken,
    );
    return json(
      { error: "invalid_grant", error_description: "Fixture refresh rejected" },
      400,
    );
  });

  await assert.rejects(
    client.restoreSessionForId("session"),
    (error) =>
      error instanceof OAuthRefreshError &&
      error.description === "Fixture refresh rejected",
  );
  assert.equal(requests, 1);
  assert.deepEqual(sessionStore.get("session"), stored);
});

test("an expired session without a refresh credential still fails before network", async () => {
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

test("opaque refresh persistence failure rejects all callers and clears coordination for retry", async () => {
  const backing = new InMemoryStore();
  const failure = new Error("Fixture persistence failure");
  let failWrite = true;
  const { client } = setup({
    get: (id) => backing.get(id),
    del: (id) => backing.del(id),
    set(id, session) {
      if (failWrite) throw failure;
      backing.set(id, session);
    },
  });
  const stored = token({
    access_token: jwt(1),
    refresh_token: opaqueRefreshToken,
  });
  backing.set("session", stored);
  let requests = 0;
  mockFetch(async () => {
    requests++;
    return json(token({ refresh_token: "replacement.opaque.token" }));
  });

  const results = await Promise.allSettled(
    Array.from({ length: 4 }, () => client.restoreSessionForId("session")),
  );
  assert.equal(requests, 1);
  for (const result of results) {
    assert.equal(result.status, "rejected");
    assert.equal(result.reason, failure);
  }
  assert.deepEqual(backing.get("session"), stored);

  failWrite = false;
  const rotated = token({ refresh_token: "replacement.opaque.token.two" });
  mockFetch(async () => {
    requests++;
    return json(rotated);
  });
  assert.deepEqual(await client.restoreSessionForId("session"), rotated);
  assert.equal(requests, 2);
});

test("JWT refresh-token convenience helper remains JWT-only", () => {
  assert.equal(isRefreshTokenExpired(jwt(1)), true);
  assert.throws(() => isRefreshTokenExpired(opaqueRefreshToken));
});
