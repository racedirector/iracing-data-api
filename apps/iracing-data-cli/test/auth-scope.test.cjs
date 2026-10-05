const assert = require("node:assert/strict");
const test = require("node:test");

const TOKEN = {
  access_token: "synthetic-access",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "synthetic-refresh",
  refresh_token_expires_in: 7200,
  scope: "iracing.auth",
};

const diagnostics = { info() {}, warn() {}, error() {} };

test("auth-only browser login requests exactly iracing.auth and preserves explicit session callback", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  let configuredScopes;
  let callbackSessionId;

  const result = await authenticateWithBrowser({
    clientId: "client-id",
    scopes: ["iracing.auth"],
    timeoutSeconds: 2,
    openBrowser: true,
    diagnostics,
    clientFactory: ({ redirectUri, scopes }) => {
      configuredScopes = scopes;
      return {
        authorize: async () => ({
          url: new URL("https://example.test/authorize?state=synthetic-state"),
        }),
        callback: async (_params, sessionId) => {
          callbackSessionId = sessionId;
          return TOKEN;
        },
      };
    },
    browserOpener: async (_authorizationUrl) => {
      // clientFactory has already received the bound runtime redirect URI.
      // Recover it by creating the callback from the active listener URL exposed
      // through a second factory-free observation is unnecessary; authorize can
      // schedule the callback once configuration is available instead.
    },
  });

  assert.deepEqual(configuredScopes, ["iracing.auth"]);
  assert.equal(callbackSessionId, "iracing-data-cli");
  assert.deepEqual(result, TOKEN);
});
