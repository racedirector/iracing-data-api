const assert = require("node:assert/strict");
const test = require("node:test");
const load = () => import("../dist/commands/whoami.js");
const loadOAuth = () => import("@iracing-data/oauth-client");

test("checks active credentials through the OAuth API dependency", async () => {
  const { whoami } = await load();
  let calls = 0;
  const result = await whoami(
    { accessToken: "synthetic" },
    {
      createOAuthApi(accessToken) {
        assert.equal(accessToken, "synthetic");
        return {
          async getProfile() {
            calls++;
            return {
              iracing_cust_id: 42,
              iracing_name: "Example User",
              access_token: "do-not-print",
            };
          },
        };
      },
    },
  );

  assert.equal(calls, 1);
  assert.deepEqual(result, {
    iracing_cust_id: 42,
    iracing_name: "Example User",
  });
});

test("uses credential overrides and reports actionable auth failures", async () => {
  const { whoami } = await load();
  const { OAuthApiHttpError } = await loadOAuth();

  await assert.rejects(
    whoami(
      {
        credentials: "alternate.json",
        accessToken: "environment",
        readCredentials: async () => '{"access_token":"override"}',
      },
      {
        createOAuthApi(accessToken) {
          assert.equal(accessToken, "override");
          return {
            async getProfile() {
              throw new OAuthApiHttpError(
                new Response("private failure", { status: 403 }),
              );
            },
          };
        },
      },
    ),
    /HTTP 403.*iracing.profile.*auth login/,
  );
});

test("does not log untrusted errors or response bodies", async () => {
  const { whoami } = await load();
  const { OAuthApiContractError } = await loadOAuth();

  await assert.rejects(
    whoami(
      { accessToken: "synthetic" },
      {
        createOAuthApi() {
          return {
            async getProfile() {
              throw new OAuthApiContractError(
                "OAuth API request failed before a response was received: Error",
              );
            },
          };
        },
      },
    ),
    /network, timeout, or redirect/,
  );

  await assert.rejects(
    whoami(
      { accessToken: "synthetic" },
      {
        createOAuthApi() {
          return {
            async getProfile() {
              throw new OAuthApiContractError(
                "OAuth API response did not match the maintained contract.",
              );
            },
          };
        },
      },
    ),
    /did not match/,
  );

  await assert.rejects(
    whoami(
      { accessToken: "synthetic" },
      {
        createOAuthApi() {
          return {
            async getProfile() {
              throw new OAuthApiContractError(
                "OAuth API response was not JSON.",
              );
            },
          };
        },
      },
    ),
    /not JSON/,
  );
});
