const assert = require("node:assert/strict");
const test = require("node:test");

test("injected account-scoped token providers remain isolated and resolve on demand", async (t) => {
  const { createFetchQueries, composeMcpServices } =
    await import("../dist/index.js");
  const calls = [];
  const authorizations = [];
  const tokens = new Map([
    ["alice", "alice-first"],
    ["bob", "bob-first"],
  ]);
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    if (url.hostname === "members-ng.iracing.com") {
      const token = new Headers(init.headers).get("authorization");
      authorizations.push(token);
      return Response.json({
        link: `https://cache.example.test/${token.endsWith("bob-first") ? "bob" : "alice"}`,
        expires: new Date(Date.now() + 60000).toISOString(),
      });
    }
    return Response.json({
      cust_id: url.pathname === "/bob" ? 2 : 1,
      display_name: url.pathname.slice(1),
    });
  };
  const resolveCapabilities = (actor) =>
    createFetchQueries(async () => {
      calls.push(actor.id);
      assert.ok(tokens.has(actor.id), "Only linked accounts may supply tokens");
      return tokens.get(actor.id);
    });
  const context = { signal: new AbortController().signal };
  const alice = composeMcpServices(
    { id: "alice", provider: "fixture" },
    resolveCapabilities,
  );
  const bob = composeMcpServices(
    { id: "bob", provider: "fixture" },
    resolveCapabilities,
  );
  const [aliceQueries, bobQueries] = await Promise.all([
    alice.getDriverQueries(context),
    bob.getDriverQueries(context),
  ]);
  assert.deepEqual(calls, []);
  const [a, b] = await Promise.all([
    aliceQueries.getCurrent(context),
    bobQueries.getCurrent(context),
  ]);
  assert.equal(a.cust_id, 1);
  assert.equal(b.cust_id, 2);
  tokens.set("alice", "alice-second");
  await aliceQueries.getCurrent(context);
  assert.deepEqual(calls, ["alice", "bob", "alice"]);
  assert.deepEqual(authorizations, [
    "Bearer alice-first",
    "Bearer bob-first",
    "Bearer alice-second",
  ]);
});
