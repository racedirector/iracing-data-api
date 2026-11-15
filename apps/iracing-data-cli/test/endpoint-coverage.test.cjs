const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const document = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../../openapi/iracing.json"),
    "utf8",
  ),
);

// Preserve established workflow names while deriving the ordinary group/leaf names.
const aliases = {
  "/data/carclass/get": ["metadata", "car-class"],
  "/data/car/get": ["metadata", "car"],
  "/data/track/get": ["metadata", "track"],
  "/data/results/get": ["results"],
  "/data/league/get_points_systems": ["league", "points-systems"],
  "/data/league/season_sessions": ["league", "sessions"],
  "/data/league/season_standings": ["league", "standings"],
  "/data/league/cust_league_sessions": ["league", "customer-sessions"],
  "/data/session/reg_drivers_list": ["session", "registered-drivers"],
  "/data/driver_stats_by_category/{category}": ["driver-stats-by-category"],
};

function commandFor(route) {
  if (aliases[route]) return aliases[route];
  const [, , group, leaf] = route.split("/");
  if (leaf === "assets" && group !== "series") return ["assets", group];
  if (group === "results") return [`results-${leaf.replaceAll("_", "-")}`];
  return [group.replaceAll("_", "-"), leaf.replaceAll("_", "-")];
}

function inputFor(parameter) {
  const known = {
    category: "sports_car",
    cust_ids: "123",
    search_term: "Example",
    season_year: "2026",
    season_quarter: "4",
    event_type: "5",
    category_id: "1",
    chart_type: "1",
    simsession_number: "0",
  };
  return known[parameter.name] ?? "1";
}

function wireResponse(route) {
  const metadata = {
    success: true,
    cust_id: 123,
    award_count: 1,
    award_id: 88,
    subscribed: true,
    roster_count: 1,
    league_id: 1,
  };
  const types = {
    "/data/member/awards": "member_awards",
    "/data/member/award_instances": "member_award_instances",
    "/data/league/roster": "league_roster",
  };
  if (types[route])
    return {
      type: types[route],
      data: metadata,
      data_url: "https://cache.example/document",
    };
  if (route.startsWith("/data/constants/"))
    return [{ label: "Example", value: 1 }];
  if (
    ["/data/results/search_series", "/data/stats/world_records"].includes(route)
  ) {
    return {
      type: route.includes("world_records")
        ? "stats_world_records"
        : "search_series_results",
      data: {
        success: true,
        params: {},
        car_id: 1,
        track_id: 1,
        last_updated: "2026-11-15T00:00:00Z",
        chunk_info: {
          chunk_size: 500,
          num_chunks: 0,
          rows: 0,
          base_download_url: "https://cache.example/chunks/",
          chunk_file_names: [],
        },
      },
    };
  }
  return {
    link: "https://cache.example/document",
    expires: "2026-11-15T01:00:00Z",
  };
}

for (const [route, item] of Object.entries(document.paths)) {
  // /data/doc is retrieved as one complete map by `docs`; /auth is legacy OAuth-external auth.
  if (!route.startsWith("/data/") || route.startsWith("/data/doc") || !item.get)
    continue;
  test(`OpenAPI runtime route ${route} has an executable CLI command`, async () => {
    const { createProgram } = await import("../dist/program.js");
    let modeled = 0;
    let displayed = 0;
    const root = createProgram({
      diagnostics: { info() {}, warn() {}, error() {}, debug() {} },
      async fetch(input, init) {
        const url = new URL(String(input));
        if (url.hostname === "cache.example") {
          assert.equal(new Headers(init?.headers).has("authorization"), false);
          return route.includes("driver_stats_by_category")
            ? new Response("name,value\r\nExample,1\r\n")
            : Response.json({ example: true });
        }
        modeled++;
        assert.equal(url.pathname, route.replace("{category}", "sports_car"));
        assert.equal(
          new Headers(init.headers).get("authorization"),
          "Bearer synthetic-coverage-token",
        );
        return Response.json(wireResponse(route));
      },
      display: {
        display() {
          displayed++;
        },
      },
    });
    const args = commandFor(route);
    const configure = (command) => {
      command.exitOverride().configureOutput({ writeErr() {} });
      command.commands.forEach(configure);
    };
    configure(root);
    for (const parameter of item.get.parameters ?? []) {
      if (parameter.required)
        args.push(
          `--${parameter.name.replaceAll("_", "-")}`,
          inputFor(parameter),
        );
    }
    await root.parseAsync([
      "node",
      "test",
      ...args,
      "--access-token",
      "synthetic-coverage-token",
    ]);
    assert.equal(modeled, 1);
    assert.equal(displayed, 1);
  });
}
