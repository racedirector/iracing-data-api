const assert = require("node:assert/strict");
const test = require("node:test");
const { Configuration } = require("@iracing-data/api-client-fetch");

async function fixture() {
  const api = await import("../dist/index.js");
  const handlers = new Map();
  const accounts = new Map();
  const seen = [];
  for (const id of [1, 2]) {
    accounts.set(
      id,
      new api.DataApiGateway({
        configuration: new Configuration({
          accessToken: async () => "account-" + id,
        }),
        logger: api.createDiagnosticLogger(() => {}),
        transport: async (url, init) => {
          if (url.hostname === "members-ng.iracing.com") {
            assert.equal(
              new Headers(init.headers).get("authorization"),
              "Bearer account-" + id,
            );
            return Response.json({
              link: "https://scorpio-assets.s3.amazonaws.com/drivers",
              expires: new Date(Date.now() + 900000).toISOString(),
            });
          }
          assert.equal(new Headers(init.headers).has("authorization"), false);
          return Response.json(
            Array.from({ length: 3 }, (_, index) => ({
              cust_id: id * 10 + index,
              display_name: "Driver " + id,
            })),
          );
        },
      }),
    );
  }
  api.registerMcpTools(
    { registerTool: (name, _options, handler) => handlers.set(name, handler) },
    {
      getDataApiGateway: async (context) => {
        seen.push(context);
        if (context.authInfo?.clientId === "denied")
          throw new api.ApplicationFailure("AUTHORIZATION_REQUIRED");
        return accounts.get(Number(context.authInfo?.clientId));
      },
    },
  );
  const call = (id, input) => {
    const authInfo = { token: "ingress", clientId: String(id), scopes: [] };
    const signal = new AbortController().signal;
    return handlers.get("find_drivers")(input, {
      http: { authInfo },
      mcpReq: { signal },
    });
  };
  return { call, seen, accounts };
}

test("tools use injected account access without credentials or storage", async () => {
  const f = await fixture();
  const [a, b] = await Promise.all([
    f.call(1, { query: "Driver" }),
    f.call(2, { query: "Driver" }),
  ]);
  assert.ok(!a.isError && !b.isError);
  assert.equal(a.structuredContent.items[0].cust_id, 10);
  assert.equal(b.structuredContent.items[0].cust_id, 20);
  assert.deepEqual(
    f.seen.map((context) => context.authInfo.clientId),
    ["1", "2"],
  );
  assert.ok(f.seen.every((context) => context.signal instanceof AbortSignal));
  const denied = await f.call("denied", { query: "Driver" });
  assert.equal(denied.structuredContent.error.code, "AUTHORIZATION_REQUIRED");
});

test("request account selection isolates cursors and preserves generation invalidation", async () => {
  const f = await fixture();
  const first = await f.call(1, { query: "Driver", limit: 1 });
  assert.ok(first.structuredContent.next_cursor);
  const cursor = first.structuredContent.next_cursor;
  const other = await f.call(2, { cursor });
  assert.equal(other.structuredContent.error.code, "CURSOR_EXPIRED");
  const same = await f.call(1, { cursor });
  assert.ok(!same.isError);
  assert.equal(same.structuredContent.items[0].cust_id, 11);
  f.accounts.get(1).invalidate();
  const invalidated = await f.call(1, { cursor });
  assert.equal(invalidated.structuredContent.error.code, "CURSOR_EXPIRED");
});
