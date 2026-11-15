const assert = require("node:assert/strict");
const test = require("node:test");

test("league roster materializes the observed data_url response without forwarding credentials", async () => {
  const { createLeagueService } =
    await import("../dist/commands/league/service.js");
  let calls = 0;
  const payload = { roster: [{ cust_id: 123 }] };
  const service = createLeagueService({
    async fetch(input, init) {
      calls++;
      if (calls === 1) {
        assert.equal(new URL(String(input)).pathname, "/data/league/roster");
        assert.equal(
          new Headers(init.headers).get("authorization"),
          "Bearer synthetic-token",
        );
        return new Response(
          JSON.stringify({
            type: "league_roster",
            data: {
              success: true,
              subscribed: false,
              roster_count: 1,
              league_id: 6529,
            },
            data_url: "https://cache.example/roster.json",
          }),
        );
      }
      assert.equal(String(input), "https://cache.example/roster.json");
      assert.equal(init, undefined);
      return new Response(JSON.stringify(payload));
    },
    display() {},
  });
  assert.deepEqual(
    await service.fetchLeague({
      accessToken: "synthetic-token",
      request: { operation: "roster", query: { league_id: 6529 } },
    }),
    payload,
  );
  assert.equal(calls, 2);
});

for (const body of [
  {
    type: "league_roster",
    data: { success: false },
    data_url: "https://cache.example/roster",
  },
  {
    type: "unexpected",
    data: { success: true },
    data_url: "https://cache.example/roster",
  },
  {
    type: "league_roster",
    data: { success: true },
    data_url: "http://cache.example/roster",
  },
  {
    type: "league_roster",
    data: { success: true },
    data_url: "https://user:secret@cache.example/roster",
  },
]) {
  test(`roster rejects invalid or unsafe envelope ${JSON.stringify(body)}`, async () => {
    const { createLeagueService } =
      await import("../dist/commands/league/service.js");
    let calls = 0;
    const service = createLeagueService({
      async fetch() {
        calls++;
        return new Response(JSON.stringify(body));
      },
      display() {
        assert.fail("must not display");
      },
    });
    await assert.rejects(
      service.fetchLeague({
        accessToken: "synthetic-token",
        request: { operation: "roster", query: { league_id: 6529 } },
      }),
      /League request failed/,
    );
    assert.equal(calls, 1);
  });
}
