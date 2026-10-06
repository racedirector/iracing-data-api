import assert from "node:assert/strict";
import test from "node:test";
import {
  OAuthApiClient,
  OAuthApiHttpError,
} from "../dist/index.js";

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

test("revokeSessions serializes opaque session ids as one form field", async () => {
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

  assert.equal(
    request.url,
    "https://oauth.iracing.com/oauth2/revoke/sessions",
  );
  assert.equal(request.options.method, "POST");
  assert.equal(
    new Headers(request.options.headers).get("content-type"),
    "application/x-www-form-urlencoded",
  );
  assert.equal(
    request.options.body.toString(),
    "session_ids=opaque-a%2Copaque-b",
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
