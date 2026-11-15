const assert = require("node:assert/strict");
const test = require("node:test");

const diagnostics = { info() {}, warn() {}, error() {} };
const PROFILE = { iracing_cust_id: 42, iracing_name: "Example User" };
const loadCommand = () => import("../dist/commands/whoami/command.js");
const loadService = () => import("../dist/commands/whoami/service.js");

async function fixture(overrides = {}) {
  const { createWhoamiService } = await loadService();
  return createWhoamiService({
    diagnostics,
    fetch: async () => Response.json(PROFILE),
    display() {},
    ...overrides,
  });
}

test("whoami command parses credentials and calls its injected capability", async () => {
  const { createWhoamiCommand } = await loadCommand();
  const events = [];
  const command = createWhoamiCommand({
    async getProfile(options) {
      assert.equal(options.credentials, "alternate.json");
      events.push("profile");
      return PROFILE;
    },
    present(profile) {
      events.push(profile);
    },
  });
  await command.parseAsync(["--credentials", "alternate.json"], {
    from: "user",
  });
  assert.deepEqual(events, ["profile", PROFILE]);
});

test("whoami resolves credentials and makes one typed OAuth request with safe output", async () => {
  const events = [];
  const service = await fixture({
    async fetch(url, options) {
      events.push("request");
      assert.equal(url, "https://oauth.iracing.com/oauth2/iracing/profile");
      assert.equal(
        new Headers(options.headers).get("authorization"),
        "Bearer override",
      );
      assert.equal(options.redirect, "error");
      assert.ok(options.signal);
      return Response.json({ ...PROFILE, access_token: "do-not-print" });
    },
    display(profile) {
      events.push(profile);
    },
    diagnostics: {
      info(message) {
        events.push(message);
      },
    },
  });
  const { createExecute } = await loadCommand();
  await createExecute(service)({
    credentials: "alternate.json",
    accessToken: "other",
    readCredentials: async (file) => {
      assert.equal(file, "alternate.json");
      return '{"access_token":"override"}';
    },
  });
  assert.deepEqual(events, ["request", PROFILE, "iRacing identity verified."]);
});

for (const [label, fetch, expected] of [
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
  test(`whoami preserves safe diagnostics and emits no success on ${label} failure`, async () => {
    const { createExecute } = await loadCommand();
    const service = await fixture({
      fetch,
      display() {
        assert.fail("must not write");
      },
      diagnostics: {
        info() {
          assert.fail("must not report success");
        },
      },
    });
    await assert.rejects(
      createExecute(service)({ accessToken: "synthetic" }),
      (error) => {
        assert.match(error.message, expected);
        assert.doesNotMatch(error.message, /private/);
        return true;
      },
    );
  });
}

test("whoami credential failures stop before HTTP or presentation", async () => {
  const { createExecute } = await loadCommand();
  const service = await fixture({
    async fetch() {
      assert.fail("must not request");
    },
    display() {
      assert.fail("must not write");
    },
  });
  await assert.rejects(
    createExecute(service)({
      credentials: "missing.json",
      readCredentials: async () => {
        throw new Error("unreadable");
      },
    }),
    /credential/i,
  );
});

test("whoami output failures propagate without success diagnostics", async () => {
  const { createExecute } = await loadCommand();
  const failure = new Error("fixture output failure");
  const service = await fixture({
    display() {
      throw failure;
    },
    diagnostics: {
      info() {
        assert.fail("must not report success");
      },
    },
  });
  await assert.rejects(
    createExecute(service)({ accessToken: "synthetic" }),
    (error) => error === failure,
  );
});
