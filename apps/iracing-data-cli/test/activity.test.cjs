const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

const manifest = {
  type: "search_series_results",
  data: {
    success: true,
    params: {},
    chunk_info: {
      chunk_size: 500,
      num_chunks: 1,
      rows: 1,
      base_download_url: "https://cache.example/chunks/",
      chunk_file_names: ["one.json"],
    },
  },
};
for (const [args, path, query, direct] of [
  [
    ["results-event-log", "--subsession-id", "42", "--simsession-number", "0"],
    "/data/results/event_log",
    { subsession_id: "42", simsession_number: "0" },
  ],
  [
    [
      "results-lap-chart-data",
      "--subsession-id",
      "42",
      "--simsession-number",
      "-1",
    ],
    "/data/results/lap_chart_data",
    { subsession_id: "42", simsession_number: "-1" },
  ],
  [
    [
      "results-lap-data",
      "--subsession-id",
      "42",
      "--simsession-number",
      "0",
      "--cust-id",
      "123",
    ],
    "/data/results/lap_data",
    { subsession_id: "42", simsession_number: "0", cust_id: "123" },
  ],
  [
    ["results-season-results", "--season-id", "6434", "--race-week-num", "0"],
    "/data/results/season_results",
    { season_id: "6434", race_week_num: "0" },
  ],
  [
    [
      "results-search-series",
      "--season-year",
      "2026",
      "--season-quarter",
      "4",
      "--official-only",
      "false",
      "--start-range-begin",
      "2026-10-01T00:00:00Z",
    ],
    "/data/results/search_series",
    {
      season_year: "2026",
      season_quarter: "4",
      official_only: "false",
      start_range_begin: "2026-10-01T00:00:00.000Z",
    },
    manifest,
  ],
  [
    ["driver-stats-by-category", "--category", "sports_car"],
    "/data/driver_stats_by_category/sports_car",
    {},
  ],
  [
    ["session", "registered-drivers", "--subsession-id", "42"],
    "/data/session/reg_drivers_list",
    { subsession_id: "42" },
  ],
  [
    ["time-attack", "member-season-results", "--ta-comp-season-id", "1"],
    "/data/time_attack/member_season_results",
    { ta_comp_season_id: "1" },
  ],
]) {
  test(`${args[0]} uses modeled serialization and correct response handling`, async () => {
    const { createActivityCommands } =
      await import("../dist/commands/activity/command.js");
    const { createActivityService } =
      await import("../dist/commands/activity/service.js");
    let calls = 0;
    const displayed = [];
    const root = await createRootCommand();
    for (const command of createActivityCommands(
      createActivityService({
        async fetch(input, init) {
          calls++;
          if (calls === 1) {
            const url = new URL(String(input));
            assert.equal(url.pathname, path);
            assert.deepEqual(Object.fromEntries(url.searchParams), query);
            assert.equal(
              new Headers(init.headers).get("authorization"),
              "Bearer synthetic-activity-token",
            );
            return Response.json(
              direct ?? {
                link: "https://cache.example/activity",
                expires: "2026-11-15T01:00:00Z",
              },
            );
          }
          assert.equal(String(input), "https://cache.example/activity");
          assert.equal(init, undefined);
          if (args[0] === "driver-stats-by-category") {
            return new Response(
              'name,notes\r\n"Example, Driver","A ""quoted"" value"\r\n',
              {
                headers: { "content-type": "text/csv" },
              },
            );
          }
          return Response.json({ example: true });
        },
        display(value) {
          displayed.push(value);
        },
      }),
    ))
      root.addCommand(command);
    await root.parseAsync([
      "node",
      "test",
      ...args,
      "--access-token",
      "synthetic-activity-token",
    ]);
    assert.equal(calls, direct ? 1 : 2);
    assert.deepEqual(displayed, [
      direct ??
        (args[0] === "driver-stats-by-category"
          ? [{ name: "Example, Driver", notes: 'A "quoted" value' }]
          : { example: true }),
    ]);
  });
}

test("activity invalid input has no service effects", async () => {
  const { createActivityCommands } =
    await import("../dist/commands/activity/command.js");
  for (const args of [
    ["results-event-log"],
    [
      "results-event-log",
      "--subsession-id",
      "42",
      "--simsession-number",
      "invalid",
    ],
    ["driver-stats-by-category", "--category", "invalid"],
    ["session", "registered-drivers", "--subsession-id", "invalid"],
    ["time-attack", "member-season-results", "--ta-comp-season-id", "invalid"],
  ]) {
    let effects = 0;
    const root = await createRootCommand();
    for (const command of createActivityCommands({
      async fetchActivity() {
        effects++;
      },
      present() {
        effects++;
      },
    }))
      root.addCommand(command);
    for (const command of [
      root,
      ...root.commands,
      ...root.commands.flatMap((c) => c.commands),
    ]) {
      command.exitOverride().configureOutput({ writeErr() {} });
    }
    await assert.rejects(root.parseAsync(["node", "test", ...args]));
    assert.equal(effects, 0);
  }
});

test("activity response-only preserves raw fields without materialization", async () => {
  const { createActivityService } =
    await import("../dist/commands/activity/service.js");
  let calls = 0;
  const wire = { future_field: true, link: "https://cache.example/data" };
  const service = createActivityService({
    async fetch() {
      calls++;
      return Response.json(wire);
    },
    display() {},
  });
  assert.deepEqual(
    await service.fetchActivity({
      request: {
        operation: "registered-drivers",
        query: { subsession_id: 42 },
      },
      responseOnly: true,
      accessToken: "synthetic-activity-token",
    }),
    wire,
  );
  assert.equal(calls, 1);
});

test("activity failures are safe and never presented", async () => {
  const { createActivityService } =
    await import("../dist/commands/activity/service.js");
  const { createExecute } =
    await import("../dist/commands/activity/command.js");
  for (const link of [
    "http://cache.example/private",
    "https://user:secret@cache.example/private",
  ]) {
    const execute = createExecute(
      createActivityService({
        async fetch() {
          return Response.json({ link });
        },
        display() {
          assert.fail("No presentation on failure");
        },
      }),
    );
    await assert.rejects(
      execute({
        request: {
          operation: "event-log",
          query: { subsession_id: 42, simsession_number: 0 },
        },
        accessToken: "synthetic-activity-token",
      }),
      (error) => {
        assert.match(error.message, /Activity request failed/);
        assert.doesNotMatch(error.message, /secret|cache.example/);
        assert.equal(error.cause, undefined);
        return true;
      },
    );
  }
});
