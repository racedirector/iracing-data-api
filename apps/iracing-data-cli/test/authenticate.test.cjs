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

function diagnostics() {
  const messages = [];
  return {
    messages,
    value: {
      info: (message) => messages.push(message),
      warn: (message) => messages.push(message),
      error: (message) => messages.push(message),
    },
  };
}

test("binds the callback before opening the browser and exchanges once", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  let redirectUri;
  let callbackCalls = 0;
  let sessionId;

  const result = await authenticateWithBrowser({
    clientId: "client-id",
    timeoutSeconds: 2,
    openBrowser: true,
    diagnostics: log.value,
    clientFactory: (uri) => {
      redirectUri = uri;
      return {
        authorize: async () => ({ url: new URL("https://example.test/authorize") }),
        callback: async (_params, id) => {
          callbackCalls += 1;
          sessionId = id;
          await new Promise((resolve) => setTimeout(resolve, 25));
          return TOKEN;
        },
      };
    },
    browserOpener: async () => {
      assert.match(redirectUri, /^http:\/\/127\.0\.0\.1:\d+\/oauth\/iracing\/callback$/);
      const unrelated = await fetch(redirectUri.replace("/oauth/iracing/callback", "/unrelated"));
      assert.equal(unrelated.status, 404);
      const first = fetch(`${redirectUri}?code=one&state=state`);
      const duplicate = fetch(`${redirectUri}?code=two&state=state`);
      const [firstResponse, duplicateResponse] = await Promise.all([first, duplicate]);
      assert.deepEqual(new Set([firstResponse.status, duplicateResponse.status]), new Set([200, 409]));
    },
  });

  assert.deepEqual(result, TOKEN);
  assert.equal(callbackCalls, 1);
  assert.equal(sessionId, "iracing-data-cli");
});

test("--no-open reports a manual URL and never invokes the browser opener", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  let opened = false;

  const result = await authenticateWithBrowser({
    clientId: "client-id",
    timeoutSeconds: 2,
    openBrowser: false,
    diagnostics: log.value,
    clientFactory: (redirectUri) => ({
      authorize: async () => {
        setTimeout(() => void fetch(`${redirectUri}?code=ok&state=state`), 10);
        return { url: new URL("https://example.test/authorize?state=state") };
      },
      callback: async () => TOKEN,
    }),
    browserOpener: async () => {
      opened = true;
    },
  });

  assert.deepEqual(result, TOKEN);
  assert.equal(opened, false);
  assert.ok(log.messages.some((message) => message.startsWith("Open this URL in a browser:")));
});

test("times out and cleans up when no callback arrives", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();

  await assert.rejects(
    authenticateWithBrowser({
      clientId: "client-id",
      timeoutSeconds: 0.01,
      openBrowser: false,
      diagnostics: log.value,
      clientFactory: () => ({
        authorize: async () => ({ url: new URL("https://example.test/authorize") }),
        callback: async () => TOKEN,
      }),
    }),
    /Timed out waiting for the OAuth callback/,
  );
});

test("rejects missing client IDs without leaking secret material", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  await assert.rejects(
    authenticateWithBrowser({
      clientId: "",
      clientSecret: "synthetic-secret",
      timeoutSeconds: 1,
      openBrowser: false,
      diagnostics: log.value,
    }),
    /IRACING_AUTH_CLIENT/,
  );
  assert.doesNotMatch(log.messages.join("\n"), /synthetic-secret|synthetic-access|synthetic-refresh/);
});
