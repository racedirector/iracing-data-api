const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

const cases = [
  [
    "get",
    ["--league-id", "6529", "--include-licenses", "false"],
    { league_id: 6529, include_licenses: false },
    "get",
  ],
  [
    "roster",
    ["--league-id", "6529", "--include-licenses"],
    { league_id: 6529, include_licenses: true },
    "roster",
  ],
  [
    "seasons",
    ["--league-id", "6529", "--retired", "false"],
    { league_id: 6529, retired: false },
    "seasons",
  ],
  [
    "sessions",
    ["--league-id", "6529", "--season-id", "12", "--results-only"],
    { league_id: 6529, season_id: 12, results_only: true },
    "season_sessions",
  ],
  [
    "standings",
    [
      "--league-id",
      "6529",
      "--season-id",
      "12",
      "--car-class-id",
      "3",
      "--car-id",
      "4",
    ],
    { league_id: 6529, season_id: 12, car_class_id: 3, car_id: 4 },
    "season_standings",
  ],
  [
    "points-systems",
    ["--league-id", "6529", "--season-id", "12"],
    { league_id: 6529, season_id: 12 },
    "get_points_systems",
  ],
  [
    "membership",
    ["--cust-id", "123", "--include-league"],
    { cust_id: 123, include_league: true },
    "membership",
  ],
  [
    "directory",
    [
      "--search",
      "racing",
      "--tag",
      "a,b",
      "--restrict-to-member",
      "false",
      "--restrict-to-recruiting",
      "--restrict-to-friends",
      "false",
      "--restrict-to-watched",
      "--minimum-roster-count",
      "2",
      "--maximum-roster-count",
      "50",
      "--lowerbound",
      "1",
      "--upperbound",
      "20",
      "--sort",
      "leaguename",
      "--order",
      "asc",
    ],
    {
      search: "racing",
      tag: "a,b",
      restrict_to_member: false,
      restrict_to_recruiting: true,
      restrict_to_friends: false,
      restrict_to_watched: true,
      minimum_roster_count: 2,
      maximum_roster_count: 50,
      lowerbound: 1,
      upperbound: 20,
      sort: "leaguename",
      order: "asc",
    },
    "directory",
  ],
  [
    "customer-sessions",
    ["--mine", "--package-id", "4"],
    { mine: true, package_id: 4 },
    "cust_league_sessions",
  ],
];

for (const [operation, flags, query, endpoint] of cases) {
  test(`league ${operation} validates flags and materializes the modeled endpoint`, async () => {
    const { createLeagueCommand } =
      await import("../dist/commands/league/command.js");
    const { createLeagueService } =
      await import("../dist/commands/league/service.js");
    let calls = 0;
    const displayed = [];
    const root = (await createRootCommand()).addCommand(
      createLeagueCommand(
        createLeagueService({
          async fetch(input, init) {
            calls++;
            if (calls === 1) {
              const url = new URL(String(input));
              assert.equal(url.pathname, `/data/league/${endpoint}`);
              assert.deepEqual(
                Object.fromEntries(url.searchParams),
                Object.fromEntries(
                  Object.entries(query).map(([key, value]) => [
                    key,
                    String(value),
                  ]),
                ),
              );
              assert.equal(
                new Headers(init.headers).get("authorization"),
                "Bearer fixture",
              );
              return Response.json(
                operation === "roster"
                  ? {
                      type: "league_roster",
                      data: {
                        success: true,
                        subscribed: false,
                        roster_count: 1,
                        league_id: 6529,
                      },
                      data_url: "https://cache.example/league",
                    }
                  : { link: "https://cache.example/league" },
              );
            }
            assert.equal(String(input), "https://cache.example/league");
            assert.equal(init, undefined);
            return Response.json({ operation });
          },
          display(document) {
            displayed.push(document);
          },
        }),
      ),
    );
    await root.parseAsync(
      ["league", operation, ...flags, "--access-token", "fixture"],
      { from: "user" },
    );
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [{ operation }]);
  });
}

test("league preserves omitted optional queries and forwards credential-file selection", async () => {
  const { createLeagueCommand } =
    await import("../dist/commands/league/command.js");
  for (const operation of ["membership", "directory", "customer-sessions"]) {
    let selected;
    const root = (await createRootCommand()).addCommand(
      createLeagueCommand({
        async fetchLeague(options) {
          selected = options;
          return {};
        },
        present() {},
      }),
    );
    await root.parseAsync(
      ["--credentials", "fixture.json", "league", operation],
      { from: "user" },
    );
    assert.deepEqual(selected.request, { operation, query: {} });
    assert.equal(selected.credentials, "fixture.json");
    assert.equal(selected.password, undefined);
  }
});

test("invalid league requests fail before service effects", async () => {
  const { createLeagueCommand } =
    await import("../dist/commands/league/command.js");
  for (const args of [
    ["get", "--league-id", "bad"],
    ["get", "--league-id", "1", "--include-licenses", "invalid"],
    ["sessions", "--league-id", "1"],
    ["standings", "--league-id", "1", "--season-id", "bad"],
    ["directory", "--lowerbound", "bad"],
  ]) {
    let called = false;
    const command = createLeagueCommand({
      async fetchLeague() {
        called = true;
      },
      present() {
        called = true;
      },
    })
      .exitOverride()
      .configureOutput({ writeErr() {} });
    for (const leaf of command.commands) {
      leaf.exitOverride().configureOutput({ writeErr() {} });
    }
    await assert.rejects(command.parseAsync(args, { from: "user" }));
    assert.equal(called, false);
  }
});

test("league safely rejects API, cache, and malformed response failures", async () => {
  const { createLeagueService } =
    await import("../dist/commands/league/service.js");
  const { createExecute } = await import("../dist/commands/league/command.js");
  for (const responses of [
    [
      () => {
        throw new Error("secret");
      },
    ],
    [() => Response.json({}, { status: 403 })],
    [() => Response.json({})],
    [() => Response.json({ link: "http://cache.example/" })],
    [() => Response.json({ link: "https://user:secret@cache.example/" })],
    [
      () => Response.json({ link: "https://cache.example/" }),
      () => new Response("secret", { status: 500 }),
    ],
    [
      () => Response.json({ link: "https://cache.example/" }),
      () => new Response("secret"),
    ],
  ]) {
    let calls = 0;
    let displayed = false;
    const service = createLeagueService({
      async fetch() {
        return responses[calls++]();
      },
      display() {
        displayed = true;
      },
    });
    await assert.rejects(
      createExecute(service)({
        accessToken: "fixture",
        request: { operation: "get", query: { league_id: 1 } },
      }),
      {
        message:
          "League request failed. Check connectivity, token expiry, iracing.auth scope, and league access.",
      },
    );
    assert.equal(calls, responses.length);
    assert.equal(displayed, false);
  }
});

test("executable exposes the league group", () => {
  const result = spawnSync(
    process.execPath,
    [require.resolve("../dist/index.js"), "league", "--help"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  for (const [operation] of cases) {
    assert.ok(result.stdout.includes(operation));
  }
});
