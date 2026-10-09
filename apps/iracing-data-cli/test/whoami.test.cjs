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

test("whoami transport adapter owns the fixed profile request and projects safe output", async () => {
  const { createFetchIdentityClient } = await loadScope();
  let calls = 0;
  const profile = await createFetchIdentityClient(
    "synthetic",
    async (url, options) => {
      calls++;
      assert.equal(url, "https://oauth.iracing.com/oauth2/iracing/profile");
      assert.equal(options.headers.Authorization, "Bearer synthetic");
      assert.equal(options.redirect, "error");
      assert.ok(options.signal);
      return Response.json({
        ...PROFILE,
        access_token: "do-not-print",
      });
    },
  ).getProfile();

  assert.equal(calls, 1);
  assert.deepEqual(profile, PROFILE);
});

test("whoami transport adapter preserves actionable status failures", async () => {
  const { createFetchIdentityClient } = await loadScope();
  await assert.rejects(
    createFetchIdentityClient(
      "synthetic",
      async () => new Response("private", { status: 403 }),
    ).getProfile(),
    /HTTP 403.*iracing.profile.*auth login/,
  );
});

test("whoami transport adapter does not expose untrusted errors or response bodies", async () => {
  const { createFetchIdentityClient } = await loadScope();
  await assert.rejects(
    createFetchIdentityClient("synthetic", async () => {
      throw new Error("private failure");
    }).getProfile(),
    /network, timeout, or redirect/,
  );
  await assert.rejects(
    createFetchIdentityClient("synthetic", async () =>
      Response.json({ access_token: "private" }),
    ).getProfile(),
    /did not match/,
  );
  await assert.rejects(
    createFetchIdentityClient(
      "synthetic",
      async () =>
        new Response("private", {
          headers: { "content-type": "text/html" },
        }),
    ).getProfile(),
    /not JSON/,
  );
});
