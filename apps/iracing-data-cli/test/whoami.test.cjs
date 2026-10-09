const assert = require("node:assert/strict");
const test = require("node:test");

const diagnostics = { info() {}, warn() {}, error() {} };
const PROFILE = { iracing_cust_id: 42, iracing_name: "Example User" };
const loadCommand = () => import("../dist/commands/whoami/command.js");
const loadScope = () => import("../dist/commands/whoami/scope.js");

test("whoami module owns scope composition", async () => {
  const { createWhoamiCommand } =
    await import("../dist/commands/whoami/index.js");
  let stdout = "";
  let token;
  const command = createWhoamiCommand({
    diagnostics,
    dependencies: {
      async resolveAccessToken(options) {
        assert.equal(options.credentials, "alternate.json");
        return "override";
      },
      createIdentityClient(accessToken) {
        token = accessToken;
        return {
          async getProfile() {
            return PROFILE;
          },
        };
      },
      writeStdout(value) {
        stdout += value;
      },
    },
  });

  await command.parseAsync(["--credentials", "alternate.json"], {
    from: "user",
  });

  assert.equal(token, "override");
  assert.deepEqual(JSON.parse(stdout), PROFILE);
});

test("whoami command resolves one invocation scope and executes the command body", async () => {
  const { createWhoamiCommand } = await loadCommand();
  const events = [];
  const command = createWhoamiCommand({
    async createScope(options) {
      events.push("scope");
      assert.equal(options.credentials, "alternate.json");
      return {
        identity: {
          async getProfile() {
            events.push("profile");
            return PROFILE;
          },
        },
        output: {
          write(profile) {
            events.push("output");
            assert.deepEqual(profile, PROFILE);
          },
        },
        diagnostics: {
          ...diagnostics,
          info(message) {
            events.push(message);
          },
        },
      };
    },
  });

  await command.parseAsync(["--credentials", "alternate.json"], {
    from: "user",
  });

  assert.deepEqual(events, [
    "scope",
    "profile",
    "output",
    "iRacing identity verified.",
  ]);
});

test("whoami scope resolves credentials and binds output", async () => {
  const { createWhoamiCommandScopeFactory } = await loadScope();
  let token;
  let stdout = "";
  const createScope = createWhoamiCommandScopeFactory(diagnostics, {
    async resolveAccessToken(options) {
      assert.equal(options.credentials, "alternate.json");
      return "override";
    },
    createIdentityClient(accessToken) {
      token = accessToken;
      return {
        async getProfile() {
          return PROFILE;
        },
      };
    },
    writeStdout(value) {
      stdout += value;
    },
  });

  const scope = await createScope({ credentials: "alternate.json" });
  const profile = await scope.identity.getProfile();
  scope.output.write(profile);

  assert.equal(token, "override");
  assert.deepEqual(JSON.parse(stdout), PROFILE);
});

test("whoami identity adapter consumes a typed profile API and projects safe output", async () => {
  const { createOAuthIdentityClient } = await loadScope();
  let calls = 0;
  const client = createOAuthIdentityClient("synthetic", {
    async getProfile() {
      calls++;
      return { ...PROFILE, access_token: "do-not-print" };
    },
  });
  assert.deepEqual(await client.getProfile(), PROFILE);
  assert.equal(calls, 1);
});

test("default whoami scope delegates the profile request to the generated OAuth client", async (t) => {
  const { createWhoamiCommandScopeFactory } = await loadScope();
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://oauth.iracing.com/oauth2/iracing/profile");
    assert.equal(
      new Headers(options.headers).get("authorization"),
      "Bearer synthetic",
    );
    assert.equal(options.redirect, "error");
    assert.ok(options.signal);
    return Response.json({ ...PROFILE, access_token: "do-not-print" });
  };
  const scope = await createWhoamiCommandScopeFactory(diagnostics)({
    accessToken: "synthetic",
  });
  assert.deepEqual(await scope.identity.getProfile(), PROFILE);
  assert.equal(calls, 1);
});

for (const [label, fetchApi, expected] of [
  [
    "HTTP",
    async () => new Response("private", { status: 403 }),
    /HTTP 403.*iracing.profile.*auth login/,
  ],
  [
    "transport",
    async () => {
      throw new Error("private transport detail");
    },
    /network, timeout, or redirect/,
  ],
  [
    "content type",
    async () =>
      new Response(JSON.stringify(PROFILE), {
        headers: { "content-type": "text/html" },
      }),
    /not JSON/,
  ],
  [
    "invalid JSON",
    async () =>
      new Response("private body", {
        headers: { "content-type": "application/json" },
      }),
    /did not match the expected profile/,
  ],
  [
    "contract",
    async () =>
      Response.json({ iracing_cust_id: "private", iracing_name: "Example" }),
    /did not match the expected profile/,
  ],
]) {
  test(`real OAuth adapter preserves safe whoami diagnostics: ${label}`, async () => {
    const { createOAuthIdentityClient } = await loadScope();
    const { OAuthApiClient } = await import("@iracing-data/oauth-client");
    const client = createOAuthIdentityClient(
      "synthetic",
      new OAuthApiClient({ accessToken: "synthetic", fetchApi }),
    );
    await assert.rejects(client.getProfile(), (error) => {
      assert.match(error.message, expected);
      assert.doesNotMatch(error.message, /private/);
      return true;
    });
  });
}
