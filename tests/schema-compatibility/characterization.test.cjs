const assert = require("node:assert/strict");
const { test } = require("node:test");
const { z } = require("../../packages/oauth/schema/node_modules/zod");
const api = require("../../packages/api/schema/src");
const oauth = require("../../packages/oauth/schema/src");
const baseline = require("./exports.json");
test("historical package and declaration-module exports remain available", () => {
  for (const entry of baseline.filter((entry) => entry.kind === "const")) {
    const surface = entry.module.includes("/oauth/") ? oauth : api;
    assert.equal(
      surface[entry.old],
      require("../../" + entry.module)[entry.old],
    );
    assert.notEqual(surface[entry.old], undefined);
  }
});
test("wire behavior, metadata, errors and codecs", () => {
  assert.equal(api.IRacingCustomerIdSchema.parse("42"), 42);
  assert.equal(api.IRacingCustomerIdSchema.meta().id, "customerId");
  assert.deepEqual(
    api.IRacingMemberGetParametersSchema.parse({
      cust_ids: 42,
      include_licenses: "true",
    }),
    { cust_ids: "42", include_licenses: true },
  );
  assert.equal(
    api.IRacingMemberGetParametersSchema.safeParse({ cust_ids: "bad" }).success,
    false,
  );
  assert.equal(
    z.encode(api.IRacingRateLimitResetHeaderSchema, new Date(1000)),
    1000,
  );
  assert.deepEqual(
    api.IRacingRateLimitResetHeaderSchema.parse(1000),
    new Date(1000),
  );
  const uuid = "123e4567-e89b-12d3-a456-426614174000";
  assert.deepEqual(
    oauth.IRacingOAuthRevokeSessionsInputSchema.parse({ session_ids: uuid }),
    { session_ids: [uuid] },
  );
  assert.deepEqual(
    z.encode(oauth.IRacingOAuthRevokeSessionsInputSchema, {
      session_ids: [uuid],
    }),
    { session_ids: uuid },
  );
  assert.equal(
    oauth.IRacingOAuthJWTAccessTokenAlgorithmSchema.parse(" RS256 "),
    "RS256",
  );
  assert.equal(
    oauth.IRacingOAuthJWTAccessTokenAlgorithmSchema.safeParse("none").success,
    false,
  );
  assert.equal(
    oauth.IRacingOAuthTokenResponseSchema.meta().id,
    "tokenGrantResponse",
  );
  assert.deepEqual(
    oauth.IRacingOAuthCllbackParametersSchema.parse({
      state: "s",
      code: "c",
      extra: true,
    }),
    { state: "s", code: "c" },
  );
  assert.equal(
    oauth.IRacingOAuthAuthorizeParametersSchema.parse({
      client_id: "c",
      redirect_uri: "https://example.com",
      response_type: "code",
    }).code_challenge_method,
    "plain",
  );
});

test("every historical schema metadata and literal value matches the pre-migration baseline", () => {
  const behavior = require("./behavior.json");
  for (const entry of baseline.filter((entry) => entry.kind === "const")) {
    const value = (entry.module.includes("/oauth/") ? oauth : api)[entry.old];
    assert.deepEqual(
      typeof value.meta === "function"
        ? { metadata: value.meta() || {} }
        : { literal: value },
      behavior[entry.old],
      entry.old,
    );
  }
});
