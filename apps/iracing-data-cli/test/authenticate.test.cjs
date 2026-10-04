const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
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

function signalSource() {
  const emitter = new EventEmitter();
  return {
    emitter,
    source: {
      once: (signal, listener) => emitter.once(signal, listener),
      off: (signal, listener) => emitter.off(signal, listener),
    },
  };
}

test("binds an ephemeral callback before opening the browser and exchanges once", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  let config;
  let callbackCalls = 0;
  let sessionId;

  const result = await authenticateWithBrowser({
    clientId: "client-id",
    clientSecret: "client-secret",
    timeoutSeconds: 2,
    openBrowser: true,
    diagnostics: log.value,
    clientFactory: (value) => {
      config = value;
      return {
        authorize: async () => ({
          url: new URL("https://example.test/authorize?state=synthetic-state"),
        }),
        callback: async (_params, id) => {
          callbackCalls += 1;
          sessionId = id;
          await new Promise((resolve) => setTimeout(resolve, 25));
          return TOKEN;
        },
      };
    },
    browserOpener: async () => {
      assert.match(
        config.redirectUri,
        /^http:\/\/127\.0\.0\.1:\d+\/oauth\/iracing\/callback$/,
      );
      assert.notEqual(new URL(config.redirectUri).port, "0");

      const unrelated = await fetch(
        config.redirectUri.replace("/oauth/iracing/callback", "/unrelated"),
      );
      assert.equal(unrelated.status, 404);

      const first = fetch(`${config.redirectUri}?code=one&state=state`);
      const duplicate = fetch(`${config.redirectUri}?code=two&state=state`);
      const [firstResponse, duplicateResponse] = await Promise.all([
        first,
        duplicate,
      ]);
      assert.deepEqual(
        new Set([firstResponse.status, duplicateResponse.status]),
        new Set([200, 409]),
      );
    },
  });

  assert.deepEqual(result, TOKEN);
  assert.equal(callbackCalls, 1);
  assert.equal(sessionId, "iracing-data-cli");
  assert.equal(config.clientId, "client-id");
  assert.equal(config.clientSecret, "client-secret");
  assert.deepEqual(config.scopes, ["iracing.auth"]);
});

test("--no-open reports the authorization URL without invoking a browser", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  let opened = false;

  const result = await authenticateWithBrowser({
    clientId: "client-id",
    timeoutSeconds: 2,
    openBrowser: false,
    diagnostics: log.value,
    clientFactory: ({ redirectUri }) => ({
      authorize: async () => {
        setTimeout(() => void fetch(`${redirectUri}?code=ok&state=state`), 10);
        return {
          url: new URL("https://example.test/authorize?state=synthetic-state"),
        };
      },
      callback: async () => TOKEN,
    }),
    browserOpener: async () => {
      opened = true;
    },
  });

  assert.deepEqual(result, TOKEN);
  assert.equal(opened, false);
  assert.ok(
    log.messages.some((message) =>
      message.startsWith("Open this URL in a browser: https://example.test/authorize"),
    ),
  );
});

test("browser-launch failure falls back to a manual URL and continues", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();

  const result = await authenticateWithBrowser({
    clientId: "client-id",
    timeoutSeconds: 2,
    openBrowser: true,
    diagnostics: log.value,
    clientFactory: ({ redirectUri }) => ({
      authorize: async () => {
        setTimeout(() => void fetch(`${redirectUri}?code=ok&state=state`), 10);
        return { url: new URL("https://example.test/authorize") };
      },
      callback: async () => TOKEN,
    }),
    browserOpener: async () => {
      throw new Error("synthetic browser failure");
    },
  });

  assert.deepEqual(result, TOKEN);
  assert.ok(log.messages.includes("Could not open the browser automatically."));
  assert.ok(
    log.messages.includes("Open this URL manually: https://example.test/authorize"),
  );
  assert.doesNotMatch(log.messages.join("\n"), /synthetic browser failure/);
});

test("times out and removes signal listeners when no callback arrives", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  const signals = signalSource();

  await assert.rejects(
    authenticateWithBrowser({
      clientId: "client-id",
      timeoutSeconds: 0.01,
      openBrowser: false,
      diagnostics: log.value,
      signalSource: signals.source,
      clientFactory: () => ({
        authorize: async () => ({ url: new URL("https://example.test/authorize") }),
        callback: async () => TOKEN,
      }),
    }),
    /Timed out waiting for the OAuth callback/,
  );

  assert.equal(signals.emitter.listenerCount("SIGINT"), 0);
  assert.equal(signals.emitter.listenerCount("SIGTERM"), 0);
});

test("SIGINT cancels the pending flow and removes signal listeners", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();
  const signals = signalSource();

  const pending = authenticateWithBrowser({
    clientId: "client-id",
    timeoutSeconds: 2,
    openBrowser: false,
    diagnostics: log.value,
    signalSource: signals.source,
    clientFactory: () => ({
      authorize: async () => ({ url: new URL("https://example.test/authorize") }),
      callback: async () => TOKEN,
    }),
  });

  await new Promise((resolve) => setTimeout(resolve, 10));
  signals.emitter.emit("SIGINT");
  await assert.rejects(pending, /Authentication cancelled/);
  assert.equal(signals.emitter.listenerCount("SIGINT"), 0);
  assert.equal(signals.emitter.listenerCount("SIGTERM"), 0);
});

test("callback failures are sanitized and never expose token or secret material", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const log = diagnostics();

  await assert.rejects(
    authenticateWithBrowser({
      clientId: "client-id",
      clientSecret: "synthetic-secret",
      timeoutSeconds: 2,
      openBrowser: false,
      diagnostics: log.value,
      clientFactory: ({ redirectUri }) => ({
        authorize: async () => {
          setTimeout(() => void fetch(`${redirectUri}?code=bad&state=state`), 10);
          return { url: new URL("https://example.test/authorize") };
        },
        callback: async () => {
          throw new Error("synthetic-secret synthetic-access synthetic-refresh");
        },
      }),
    }),
    /iRacing OAuth authentication failed/,
  );

  assert.doesNotMatch(
    log.messages.join("\n"),
    /synthetic-secret|synthetic-access|synthetic-refresh/,
  );
});
