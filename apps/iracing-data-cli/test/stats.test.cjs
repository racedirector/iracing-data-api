const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

const manifest = {
  type: "stats_world_records",
  data: {
    success: true,
    car_id: 1,
    track_id: 1,
    chunk_info: {
      chunk_size: 500,
      num_chunks: 1,
      rows: 1,
      base_download_url: "https://cache.example/chunks/",
      chunk_file_names: ["one.json"],
    },
    last_updated: "2026-11-15T00:00:00Z",
  },
};
const cases = [
  ...[
    "member-bests",
    "member-career",
    "member-recent-races",
    "member-summary",
    "member-yearly",
  ].map((operation) => [operation, ["--cust-id", "123"], { cust_id: "123" }]),
  [
    "member-recap",
    ["--year", "2026", "--season", "4"],
    { year: "2026", season: "4" },
  ],
  [
    "member-division",
    ["--season-id", "6434", "--event-type", "5"],
    { season_id: "6434", event_type: "5" },
  ],
  ...[
    "season-driver-standings",
    "season-supersession-standings",
    "season-team-standings",
    "season-tt-standings",
  ].map((operation) => [
    operation,
    ["--season-id", "6434", "--car-class-id", "74"],
    { season_id: "6434", car_class_id: "74" },
  ]),
  ...["season-tt-results", "season-qualify-results"].map((operation) => [
    operation,
    [
      "--season-id",
      "6434",
      "--car-class-id",
      "74",
      "--race-week-num",
      "0",
      "--division",
      "10",
    ],
    {
      season_id: "6434",
      car_class_id: "74",
      race_week_num: "0",
      division: "10",
    },
  ]),
  [
    "world-records",
    ["--car-id", "1", "--track-id", "1"],
    { car_id: "1", track_id: "1" },
  ],
];

for (const [operation, flags, query] of cases) {
  test(`stats ${operation} validates and uses the generated request`, async () => {
    const { createStatsCommand } =
      await import("../dist/commands/stats/command.js");
    const { createStatsService } =
      await import("../dist/commands/stats/service.js");
    let calls = 0;
    const displayed = [];
    const root = (await createRootCommand()).addCommand(
      createStatsCommand(
        createStatsService({
          async fetch(input, init) {
            calls++;
            if (calls === 1) {
              const url = new URL(String(input));
              assert.equal(
                url.pathname,
                `/data/stats/${operation.replaceAll("-", "_")}`,
              );
              assert.deepEqual(Object.fromEntries(url.searchParams), query);
              assert.equal(
                new Headers(init.headers).get("authorization"),
                "Bearer synthetic-stats-token",
              );
              return Response.json(
                operation === "world-records"
                  ? manifest
                  : {
                      link: "https://cache.example/stats",
                      expires: "2026-11-15T01:00:00Z",
                    },
              );
            }
            assert.equal(String(input), "https://cache.example/stats");
            assert.equal(init, undefined);
            return Response.json({ example: true });
          },
          display(value) {
            displayed.push(value);
          },
        }),
      ),
    );
    await root.parseAsync([
      "node",
      "test",
      "stats",
      operation,
      ...flags,
      "--access-token",
      "synthetic-stats-token",
    ]);
    assert.equal(calls, operation === "world-records" ? 1 : 2);
    assert.deepEqual(displayed, [
      operation === "world-records" ? manifest : { example: true },
    ]);
  });
}

test("statistics invalid inputs have no service effects", async () => {
  const { createStatsCommand } =
    await import("../dist/commands/stats/command.js");
  for (const args of [
    ["member-division"],
    ["member-division", "--season-id", "1", "--event-type", "3"],
    ["season-tt-results", "--season-id", "1", "--car-class-id", "74"],
    ["member-bests", "--cust-id", "invalid"],
    ["world-records", "--car-id", "1", "--track-id", "invalid"],
  ]) {
    let effects = 0;
    const root = (await createRootCommand()).addCommand(
      createStatsCommand({
        async fetchStats() {
          effects++;
        },
        present() {
          effects++;
        },
      }),
    );
    for (const command of [
      root,
      ...root.commands,
      ...root.commands.flatMap((c) => c.commands),
    ]) {
      command.exitOverride().configureOutput({ writeErr() {} });
    }
    await assert.rejects(root.parseAsync(["node", "test", "stats", ...args]));
    assert.equal(effects, 0);
  }
});

for (const failure of ["api", "unsafe", "http", "decode"]) {
  test(`statistics ${failure} failure never presents or leaks upstream details`, async () => {
    const { createStatsService } =
      await import("../dist/commands/stats/service.js");
    const { createExecute } = await import("../dist/commands/stats/command.js");
    let calls = 0;
    const execute = createExecute(
      createStatsService({
        async fetch() {
          calls++;
          if (calls === 1) {
            if (failure === "api")
              return new Response("private-detail", { status: 500 });
            return Response.json({
              link:
                failure === "unsafe"
                  ? "https://user:private-detail@cache.example/data"
                  : "https://cache.example/data",
            });
          }
          return new Response("private-detail", {
            status: failure === "http" ? 500 : 200,
          });
        },
        display() {
          assert.fail("No presentation on failure");
        },
      }),
    );
    await assert.rejects(
      execute({
        request: { operation: "member-career", query: {} },
        accessToken: "synthetic-stats-token",
      }),
      (error) => {
        assert.match(error.message, /Statistics request failed/);
        assert.doesNotMatch(error.message, /private-detail|cache.example/);
        assert.equal(error.cause, undefined);
        return true;
      },
    );
  });
}
