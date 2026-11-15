const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const [group, operation, wire, flags, query] of [
  [
    "season",
    "list",
    "list",
    ["--season-year", "2026", "--season-quarter", "4"],
    { season_year: "2026", season_quarter: "4" },
  ],
  [
    "season",
    "race-guide",
    "race_guide",
    ["--from", "2026-11-15T00:00:00Z", "--include-end-after-from", "false"],
    { from: "2026-11-15T00:00:00.000Z", include_end_after_from: "false" },
  ],
  [
    "season",
    "spectator-subsessionids",
    "spectator_subsessionids",
    ["--event-types", "2,5"],
    { event_types: "2,5" },
  ],
  [
    "season",
    "spectator-subsessionids-detail",
    "spectator_subsessionids_detail",
    ["--event-types", "2,5", "--season-ids", "1,2"],
    { event_types: "2,5", season_ids: "1,2" },
  ],
  ["series", "get", "get", [], {}],
  ["series", "assets", "assets", [], {}],
  ["series", "stats-series", "stats_series", [], {}],
  [
    "series",
    "past-seasons",
    "past_seasons",
    ["--series-id", "514"],
    { series_id: "514" },
  ],
  [
    "series",
    "season-schedule",
    "season_schedule",
    ["--season-id", "6434"],
    { season_id: "6434" },
  ],
  [
    "series",
    "seasons",
    "seasons",
    [
      "--include-series",
      "false",
      "--season-year",
      "2026",
      "--season-quarter",
      "4",
    ],
    { include_series: "false", season_year: "2026", season_quarter: "4" },
  ],
  ["series", "season-list", "season_list", [], {}],
]) {
  test(`${group} ${operation} uses generated serialization and downloads without credentials`, async () => {
    const { createReferenceCommands } =
      await import("../dist/commands/reference/command.js");
    const { createReferenceService } =
      await import("../dist/commands/reference/service.js");
    let calls = 0;
    const displayed = [];
    const root = await createRootCommand();
    for (const command of createReferenceCommands(
      createReferenceService({
        async fetch(input, init) {
          calls++;
          if (calls === 1) {
            const url = new URL(String(input));
            assert.equal(url.pathname, `/data/${group}/${wire}`);
            assert.deepEqual(Object.fromEntries(url.searchParams), query);
            assert.equal(
              new Headers(init.headers).get("authorization"),
              "Bearer synthetic-reference-token",
            );
            return Response.json({
              link: "https://cache.example/reference",
              expires: "2026-11-15T01:00:00Z",
            });
          }
          assert.equal(String(input), "https://cache.example/reference");
          assert.equal(init, undefined);
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
      group,
      operation,
      ...flags,
      "--access-token",
      "synthetic-reference-token",
    ]);
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [{ example: true }]);
  });
}

test("reference invalid flags have no service effects", async () => {
  const { createReferenceCommands } =
    await import("../dist/commands/reference/command.js");
  for (const args of [
    ["season", "list"],
    ["season", "list", "--season-year", "2026", "--season-quarter", "invalid"],
    ["season", "spectator-subsessionids", "--event-types", "2,"],
    ["season", "spectator-subsessionids", "--event-types", "0"],
    ["season", "spectator-subsessionids-detail", "--season-ids", "invalid"],
    ["season", "race-guide", "--from", "invalid"],
    ["series", "past-seasons", "--series-id", "invalid"],
  ]) {
    let effects = 0;
    const root = await createRootCommand();
    for (const command of createReferenceCommands({
      async fetchReference() {
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

test("reference response-only preserves wire JSON without a cache download", async () => {
  const { createReferenceService } =
    await import("../dist/commands/reference/service.js");
  let calls = 0;
  const wire = { future_field: true, link: "https://cache.example/data" };
  const service = createReferenceService({
    async fetch() {
      calls++;
      return Response.json(wire);
    },
    display() {},
  });
  assert.deepEqual(
    await service.fetchReference({
      request: { operation: "series-get", query: {} },
      accessToken: "synthetic-reference-token",
      responseOnly: true,
    }),
    wire,
  );
  assert.equal(calls, 1);
});

for (const failure of ["api", "unsafe", "cache-http", "cache-decode"]) {
  test(`reference ${failure} failure is sanitized`, async () => {
    const { createReferenceService } =
      await import("../dist/commands/reference/service.js");
    let calls = 0;
    const service = createReferenceService({
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
            expires: "2026-11-15T01:00:00Z",
          });
        }
        return new Response("private-detail", {
          status: failure === "cache-http" ? 500 : 200,
        });
      },
      display() {
        assert.fail("No failed requests may be displayed");
      },
    });
    await assert.rejects(
      service.fetchReference({
        request: { operation: "series-get", query: {} },
        accessToken: "synthetic-reference-token",
      }),
      (error) => {
        assert.match(error.message, /Reference request failed/);
        assert.doesNotMatch(error.message, /private-detail|cache.example/);
        assert.equal(error.cause, undefined);
        return true;
      },
    );
  });
}
