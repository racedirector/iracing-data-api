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
  assert.deepEqual(config.scopes, ["iracing.auth", "iracing.profile"]);
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
      message.startsWith(
        "Open this URL in a browser: https://example.test/authorize",
      ),
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
    log.messages.includes(
      "Open this URL manually: https://example.test/authorize",
    ),
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
        authorize: async () => ({
          url: new URL("https://example.test/authorize"),
        }),
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
      authorize: async () => ({
        url: new URL("https://example.test/authorize"),
      }),
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
          setTimeout(
            () => void fetch(`${redirectUri}?code=bad&state=state`),
            10,
          );
          return { url: new URL("https://example.test/authorize") };
        },
        callback: async () => {
          throw new Error(
            "synthetic-secret synthetic-access synthetic-refresh",
          );
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

async function unusedPort() {
  const { createServer } = require("node:http");
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

for (const fixedPort of [false, true]) {
  test(`uses the registered callback path and ${fixedPort ? "fixed" : "ephemeral"} port`, async () => {
    const { authenticateWithBrowser } = await import("../dist/authenticate.js");
    const port = fixedPort ? await unusedPort() : 0;
    const registered = `http://127.0.0.1:${port}/api/auth/callback/iracing?flow=cli`;
    let actual;
    const result = await authenticateWithBrowser({
      clientId: "client-id",
      redirectUri: registered,
      timeoutSeconds: 2,
      openBrowser: true,
      diagnostics: diagnostics().value,
      clientFactory: ({ redirectUri }) => {
        actual = redirectUri;
        return {
          authorize: async () => ({
            url: new URL("https://example.test/authorize"),
          }),
          callback: async (params) => {
            assert.equal(params.get("flow"), "cli");
            return TOKEN;
          },
        };
      },
      browserOpener: async () => {
        if (fixedPort) assert.equal(actual, registered);
        else {
          assert.notEqual(new URL(actual).port, "0");
          assert.equal(new URL(actual).pathname, "/api/auth/callback/iracing");
          assert.equal(new URL(actual).search, "?flow=cli");
        }
        const response = await fetch(`${actual}&code=ok&state=state`);
        assert.equal(response.status, 200);
      },
    });
    assert.deepEqual(result, TOKEN);
    await assert.rejects(fetch(actual));
  });
}

test("rejects unsupported callback URIs before opening a browser", async () => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  for (const redirectUri of [
    "invalid",
    "https://127.0.0.1:3000/callback",
    "http://localhost:3000/callback",
    "http://example.test/callback",
    "http://user:secret@127.0.0.1:3000/callback",
    "http://127.0.0.1:3000/callback#fragment",
  ]) {
    await assert.rejects(
      authenticateWithBrowser({
        clientId: "client-id",
        redirectUri,
        timeoutSeconds: 2,
        openBrowser: true,
        diagnostics: diagnostics().value,
        clientFactory: () => {
          throw new Error("must not construct client");
        },
        browserOpener: async () => {
          throw new Error("must not open browser");
        },
      }),
      /IRACING_AUTH_REDIRECT_URI/,
    );
  }
});

test("reports a recovery action when the registered port is occupied", async () => {
  const { createServer } = require("node:http");
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await assert.rejects(
      authenticateWithBrowser({
        clientId: "client-id",
        redirectUri: `http://127.0.0.1:${server.address().port}/callback`,
        timeoutSeconds: 2,
        openBrowser: false,
        diagnostics: diagnostics().value,
      }),
      /Free the port configured by IRACING_AUTH_REDIRECT_URI/,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
