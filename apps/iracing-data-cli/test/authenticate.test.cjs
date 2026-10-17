const assert = require("node:assert/strict");
const { createServer } = require("node:net");
const test = require("node:test");

const originalFetch = globalThis.fetch;
const TOKEN = {
  access_token: "synthetic-access",
  token_type: "Bearer",
  expires_in: 3600,
};

function trackSignals(t) {
  const counts = ["SIGINT", "SIGTERM"].map((signal) =>
    process.listenerCount(signal),
  );
  t.after(() => {
    for (const [index, signal] of ["SIGINT", "SIGTERM"].entries()) {
      assert.equal(process.listenerCount(signal), counts[index]);
    }
  });
}

async function unusedPort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function completeCallback(url) {
  const callback = new URL(url.searchParams.get("redirect_uri"));
  callback.searchParams.set("code", "synthetic-code");
  callback.searchParams.set("state", url.searchParams.get("state"));
  const response = await originalFetch(callback);
  assert.equal(response.status, 200);
}

for (const configured of [false, true]) {
  test(`browser login uses matching redirect, state and PKCE (configured: ${configured})`, async (t) => {
    const { authenticateWithBrowser } = await import("../dist/authenticate.js");
    trackSignals(t);
    const redirectUri = configured
      ? `http://127.0.0.1:${await unusedPort()}/registered?keep=exact%20value`
      : undefined;
    let authorization;
    let exchanges = 0;
    t.mock.method(globalThis, "fetch", async (url, options) => {
      assert.equal(String(url), "https://oauth.iracing.com/oauth2/token");
      exchanges += 1;
      const body = new URLSearchParams(options.body);
      assert.equal(
        body.get("redirect_uri"),
        authorization.searchParams.get("redirect_uri"),
      );
      assert.equal(body.get("code"), "synthetic-code");
      const { createHash } = require("node:crypto");
      assert.equal(
        createHash("sha256")
          .update(body.get("code_verifier"))
          .digest("base64url"),
        authorization.searchParams.get("code_challenge"),
      );
      return Response.json(TOKEN);
    });
    const result = await authenticateWithBrowser({
      clientId: "synthetic-client",
      redirectUri,
      timeoutSeconds: 2,
      async launch(url) {
        authorization = url;
        const bound = new URL(url.searchParams.get("redirect_uri"));
        assert.notEqual(bound.port, "0");
        assert.ok(url.searchParams.get("state"));
        if (configured) {
          assert.equal(bound.href, redirectUri);
        } else {
          assert.equal(bound.hostname, "127.0.0.1");
          assert.equal(bound.pathname, "/oauth/iracing/callback");
        }
        await completeCallback(url);
      },
    });
    assert.deepEqual(result, TOKEN);
    assert.equal(exchanges, 1);
  });
}

test("browser launch failure prints the login URL to stderr and permits manual completion", async (t) => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  trackSignals(t);
  let launched;
  let manualCallback;
  t.mock.method(process.stderr, "write", (message) => {
    assert.equal(message, `Open this URL to log in: ${launched.href}\n`);
    manualCallback = completeCallback(launched);
    return true;
  });
  t.mock.method(globalThis, "fetch", async () => Response.json(TOKEN));
  assert.deepEqual(
    await authenticateWithBrowser({
      clientId: "synthetic-client",
      timeoutSeconds: 2,
      launch(url) {
        launched = url;
        throw new Error("synthetic opener failure");
      },
    }),
    TOKEN,
  );
  await manualCallback;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  test(`${signal} cancels login and releases the listener and both handlers`, async (t) => {
    const { authenticateWithBrowser } = await import("../dist/authenticate.js");
    trackSignals(t);
    let redirectUri;
    await assert.rejects(
      authenticateWithBrowser({
        clientId: "synthetic-client",
        timeoutSeconds: 2,
        launch(url) {
          redirectUri = url.searchParams.get("redirect_uri");
          process.emit(signal);
        },
      }),
      /Authentication cancelled/,
    );
    await assert.rejects(originalFetch(redirectUri));
  });
}

test("timeout removes signal handlers and releases the listener", async (t) => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  trackSignals(t);
  let redirectUri;
  await assert.rejects(
    authenticateWithBrowser({
      clientId: "synthetic-client",
      timeoutSeconds: 0.1,
      launch(url) {
        redirectUri = url.searchParams.get("redirect_uri");
      },
    }),
    { name: "TimeoutError" },
  );
  await assert.rejects(originalFetch(redirectUri));
});

test("authorization failure removes signal handlers", async (t) => {
  const { authenticateWithBrowser } = await import("../dist/authenticate.js");
  trackSignals(t);
  await assert.rejects(
    authenticateWithBrowser({
      clientId: "synthetic-client",
      timeoutSeconds: 2,
      clientFactory() {
        throw new Error("synthetic authorization failure");
      },
    }),
    /synthetic authorization failure/,
  );
});
