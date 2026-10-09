import assert from "node:assert/strict";
import test from "node:test";
import { OAuthApiClient, OAuthApiHttpError } from "../dist/index.js";

test("getProfile sends bearer auth and parses the maintained profile contract", async () => {
  const calls = [];
  const client = new OAuthApiClient({
    accessToken: "synthetic-token",
    fetchApi: async (url, options) => {
      calls.push({ url, options });
      return Response.json({
        iracing_cust_id: 42,
        iracing_name: "Example User",
      });
    },
  });

  const profile = await client.getProfile();

  assert.deepEqual(profile, {
    iracing_cust_id: 42,
    iracing_name: "Example User",
  });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    "https://oauth.iracing.com/oauth2/iracing/profile",
  );
  assert.equal(calls[0].options.method, "GET");
  assert.equal(
    new Headers(calls[0].options.headers).get("authorization"),
    "Bearer synthetic-token",
  );
  assert.equal(
    new Headers(calls[0].options.headers).get("accept"),
    "application/json",
  );
  assert.equal(calls[0].options.redirect, "error");
  assert.ok(calls[0].options.signal);
});

test("revokeSessions delegates opaque session serialization to the generated client", async () => {
  let request;
  const client = new OAuthApiClient({
    accessToken: "synthetic-token",
    fetchApi: async (url, options) => {
      request = { url, options };
      return new Response(null, {
        status: 200,
        headers: { "x-request-id": "req-123" },
      });
    },
  });

  await client.revokeSessions({ session_ids: ["opaque-a", "opaque-b"] });

  assert.equal(request.url, "https://oauth.iracing.com/oauth2/revoke/sessions");
  assert.equal(request.options.method, "POST");
  assert.ok(request.options.body instanceof URLSearchParams);
  assert.equal(
    request.options.body.toString(),
    "session_ids=opaque-a%2Copaque-b",
  );
});

test("raw token exchange preserves OAuth error responses for protocol processing", async () => {
  const client = new OAuthApiClient({
    fetchApi: async () =>
      Response.json(
        {
          error: "invalid_grant",
          error_description: "synthetic failure",
        },
        { status: 400 },
      ),
  });

  const response = await client.exchangeTokenRaw({
    grant_type: "refresh_token",
    client_id: "fixture-client",
    refresh_token: "fixture-refresh-token",
  });

  assert.equal(response.status, 400);
});

test("parsed token exchange maps non-success responses to the wire error", async () => {
  const client = new OAuthApiClient({
    fetchApi: async () =>
      Response.json(
        {
          error: "invalid_grant",
          error_description: "synthetic failure",
        },
        {
          status: 400,
          headers: { "x-request-id": "req-token" },
        },
      ),
  });

  await assert.rejects(
    client.exchangeToken({
      grant_type: "refresh_token",
      client_id: "fixture-client",
      refresh_token: "fixture-refresh-token",
    }),
    (error) => {
      assert.ok(error instanceof OAuthApiHttpError);
      assert.equal(error.response.status, 400);
      assert.equal(error.requestId, "req-token");
      return true;
    },
  );
});

test("HTTP errors expose status and request id without consuming the body", async () => {
  const client = new OAuthApiClient({
    accessToken: "synthetic-token",
    fetchApi: async () =>
      new Response("private body", {
        status: 403,
        headers: { "x-request-id": "req-403" },
      }),
  });

  await assert.rejects(client.getProfile(), (error) => {
    assert.ok(error instanceof OAuthApiHttpError);
    assert.equal(error.response.status, 403);
    assert.equal(error.requestId, "req-403");
    return true;
  });
});

for (const [kind, fetchApi] of [
  [
    "transport",
    async () => {
      throw new Error("private transport detail");
    },
  ],
  [
    "not_json",
    async () =>
      new Response('{"iracing_cust_id":42,"iracing_name":"Example"}', {
        headers: { "content-type": "text/html" },
      }),
  ],
  [
    "invalid_json",
    async () =>
      new Response("private invalid body", {
        headers: { "content-type": "application/json" },
      }),
  ],
  [
    "contract",
    async () =>
      Response.json({
        iracing_cust_id: "private invalid id",
        iracing_name: "Example",
      }),
  ],
]) {
  test(`profile and session failures expose safe typed kinds: ${kind}`, async () => {
    const { OAuthApiContractError } = await import("../dist/index.js");
    const client = new OAuthApiClient({ accessToken: "synthetic", fetchApi });
    for (const operation of [
      () => client.getProfile(),
      () => client.getSessions(),
    ]) {
      await assert.rejects(operation(), (error) => {
        assert.ok(error instanceof OAuthApiContractError);
        assert.equal(error.kind, kind);
        assert.doesNotMatch(error.message, /private/);
        return true;
      });
    }
  });
}

test("session response preserves opaque IDs, nullable fields, and subdivision arrays", async () => {
  const session = {
    session_id: "opaque-session",
    client_id: "fixture",
    client_name: "Example",
    client_developer_name: null,
    client_developer_url: null,
    client_developer_email: null,
    scope: null,
    scope_descriptions: null,
    auth_time: 1,
    last_activity: 2,
    session_expiration: 3,
    current_session: true,
    impersonated: false,
    impersonation_note: null,
    first_ip: "192.0.2.1",
    first_continent: null,
    first_country: null,
    first_subdivisions: ["Massachusetts"],
    first_city: null,
    first_user_agent_header: null,
    first_user_agent_operating_system: null,
    first_user_agent_browser: null,
    last_ip: null,
    last_continent: null,
    last_country: null,
    last_subdivisions: ["Massachusetts"],
    last_city: null,
    last_user_agent_header: null,
    last_user_agent_operating_system: null,
    last_user_agent_browser: null,
  };
  const client = new OAuthApiClient({
    fetchApi: async () => Response.json({ sessions: [session] }),
  });
  assert.deepEqual(await client.getSessions(), { sessions: [session] });
});
