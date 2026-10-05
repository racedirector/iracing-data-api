const assert = require("node:assert/strict");
const test = require("node:test");
const load = () => import("../dist/commands/whoami.js");
test("checks active credentials against the official profile endpoint without docs requests", async () => {
  const { whoami } = await load();
  let calls = 0;
  const result = await whoami({
    accessToken: "synthetic",
    fetcher: async (url, options) => {
      calls++;
      assert.equal(url, "https://oauth.iracing.com/oauth2/iracing/profile");
      assert.equal(options.headers.Authorization, "Bearer synthetic");
      assert.equal(options.redirect, "error");
      assert.ok(options.signal);
      return Response.json({
        iracing_cust_id: 42,
        iracing_name: "Example User",
        access_token: "do-not-print",
      });
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, {
    iracing_cust_id: 42,
    iracing_name: "Example User",
  });
});
test("uses credential overrides and reports actionable auth failures", async () => {
  const { whoami } = await load();
  await assert.rejects(
    whoami({
      credentials: "alternate.json",
      accessToken: "environment",
      readCredentials: async () => '{"access_token":"override"}',
      fetcher: async (_url, options) => {
        assert.equal(options.headers.Authorization, "Bearer override");
        return new Response("private failure", { status: 403 });
      },
    }),
    /HTTP 403.*iracing.profile.*auth login/,
  );
});
test("does not log untrusted errors or response bodies", async () => {
  const { whoami } = await load();
  await assert.rejects(
    whoami({
      accessToken: "synthetic",
      fetcher: async () => {
        throw new Error("private failure");
      },
    }),
    /network, timeout, or redirect/,
  );
  await assert.rejects(
    whoami({
      accessToken: "synthetic",
      fetcher: async () => Response.json({ access_token: "private" }),
    }),
    /did not match/,
  );
  await assert.rejects(
    whoami({
      accessToken: "synthetic",
      fetcher: async () =>
        new Response("private", { headers: { "content-type": "text/html" } }),
    }),
    /not JSON/,
  );
});
