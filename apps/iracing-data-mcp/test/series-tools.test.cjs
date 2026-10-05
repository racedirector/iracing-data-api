const assert = require("node:assert/strict");
const test = require("node:test");
const http = require("node:http");
const { Configuration } = require("@iracing-data/api-client-fetch");

const hidden = {
  weather: "WEATHER_SECRET",
  assets: ["ASSET_SECRET"],
  race_time_descriptors: ["DURATION_SECRET"],
  session_times: ["RECURRENCE_SECRET"],
};
const season = (season_id, series_id = 20, active = true) => ({
  season_id,
  series_id,
  season_name: `Synthetic Season ${season_id}`,
  season_year: active ? 2026 : 2025,
  season_quarter: active ? 4 : 3,
  active,
  ...hidden,
});
const week = (race_week_num, track_id = 30) => ({
  race_week_num,
  start_date: `2026-10-${String(race_week_num + 1).padStart(2, "0")}`,
  week_end_time: `2026-10-${String(race_week_num + 7).padStart(2, "0")}T23:59:59Z`,
  series_id: 20,
  series_name: "Synthetic Series",
  track: {
    track_id,
    track_name: `Synthetic Raceway ${track_id}`,
    config_name: `Config ${track_id}`,
    ...hidden,
  },
  ...hidden,
});

async function fixture(t, data = {}, options = {}) {
  const api = await import("../dist/index.js");
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  let now = Date.now();
  const requests = [];
  const sources = {
    seasons: {
      seasons: [season(30), season(10), season(20, 21), season(40, 20, false)],
    },
    schedule: {
      success: true,
      season_id: 10,
      schedules: [week(2, 32), week(0, 30), week(1, 31)],
    },
    ...data,
  };
  const gateway = new api.DataApiGateway({
    configuration: new Configuration({
      accessToken: async () => "TOKEN_SECRET",
    }),
    authorizationState: () => "ready",
    now: () => now,
    logger: api.createDiagnosticLogger(() => {}),
    transport: async (url, init) => {
      requests.push({ url, init });
      if (url.hostname === "members-ng.iracing.com") {
        const key = url.pathname.endsWith("/series/season_list")
          ? "seasons"
          : url.pathname.endsWith("/series/season_schedule")
            ? "schedule"
            : null;
        assert.ok(key, `unexpected API path ${url.pathname}`);
        return Response.json({
          link: `https://scorpio-assets.s3.amazonaws.com/synthetic/${key}?secret=SIGNED_SECRET`,
          expires: new Date(now + (options.expiryMs ?? 900000)).toISOString(),
        });
      }
      assert.equal(new Headers(init.headers).has("authorization"), false);
      return Response.json(sources[url.pathname.split("/").pop()]);
    },
  });
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services: {
      oauthClient: {},
      dataApiConfiguration: {},
      dataApiGateway: gateway,
      authorizationState: () => "ready",
    },
    logger: api.createDiagnosticLogger(() => {}),
  });
  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());
  const request = (method, body, headers = {}) =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port: app.server.address().port,
          path: "/mcp",
          method,
          headers: { Host: "127.0.0.1:3000", ...headers },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () =>
            resolve(
              new Response(text || null, {
                status: res.statusCode,
                headers: res.headers,
              }),
            ),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  const client = new Client(
    { name: "offline-series-tools", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3000/mcp"), {
      fetch: (_url, init) =>
        request(
          init.method,
          init.body,
          Object.fromEntries(new Headers(init.headers)),
        ),
    }),
  );
  t.after(() => client.close());
  return {
    api,
    client,
    requests,
    sources,
    call: (name, args = {}) => client.callTool({ name, arguments: args }),
    advance: (ms) => (now += ms),
  };
}

function success(result) {
  assert.ok(!result.isError, JSON.stringify(result));
  assert.deepEqual(
    JSON.parse(result.content[0].text),
    result.structuredContent,
  );
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
  assert.doesNotMatch(
    JSON.stringify(result),
    /SECRET|weather|assets|race_time_descriptors|session_times|https:/,
  );
  return result.structuredContent;
}
function failure(result, code) {
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, code);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|https:|stack|cause/);
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
}

test("official client series-season scenario uses active upstream default, deterministic local filtering and replayable cursors", async (t) => {
  const f = await fixture(t);
  const tools = (await f.client.listTools()).tools;
  assert.ok(tools.some((tool) => tool.name === "list_series_seasons"));
  assert.ok(tools.some((tool) => tool.name === "get_series_schedule"));
  assert.match(
    tools.find((tool) => tool.name === "get_series_schedule").description,
    /zero-based/,
  );

  const first = success(
    await f.call("list_series_seasons", { series_id: 20, limit: 1 }),
  );
  assert.deepEqual(
    first.items.map((item) => item.season_id),
    [10],
  );
  assert.equal(first.source_total, 3);
  assert.equal(first.complete, false);
  assert.match(first.next_cursor, /^[A-Za-z0-9_-]{43}$/);
  const apiRequest = f.requests[0].url;
  assert.equal(apiRequest.pathname, "/data/series/season_list");
  assert.equal(apiRequest.searchParams.get("include_series"), "false");
  assert.equal(apiRequest.searchParams.has("season_year"), false);
  assert.equal(apiRequest.searchParams.has("season_quarter"), false);

  f.sources.seasons.seasons[0].season_name = "CHANGED";
  const next = success(
    await f.call("list_series_seasons", { cursor: first.next_cursor }),
  );
  assert.deepEqual(
    next.items.map((item) => item.season_id),
    [30],
  );
  assert.equal(next.items[0].season_name, "Synthetic Season 30");
  assert.equal(f.requests.length, 2);

  const historical = success(
    await f.call("list_series_seasons", {
      series_id: 20,
      season_year: 2025,
      season_quarter: 3,
    }),
  );
  assert.deepEqual(
    historical.items.map((item) => item.season_id),
    [10, 30, 40],
  );
  const historicalRequest = f.requests[2].url;
  assert.equal(historicalRequest.searchParams.get("season_year"), "2025");
  assert.equal(historicalRequest.searchParams.get("season_quarter"), "3");
  assert.equal(historicalRequest.searchParams.get("include_series"), "false");
});

test("official client schedule scenario preserves dates, locally filters zero-based race weeks and strips bulk fields", async (t) => {
  const f = await fixture(t);
  const result = success(
    await f.call("get_series_schedule", {
      season_id: 10,
      race_week_num: 0,
    }),
  );
  assert.equal(result.season_id, 10);
  assert.equal(result.returned_count, 1);
  assert.equal(result.items[0].race_week_num, 0);
  assert.equal(result.items[0].start_date, "2026-10-01");
  assert.equal(result.items[0].week_end_time, "2026-10-07T23:59:59Z");
  assert.deepEqual(result.items[0].track, {
    track_id: 30,
    track_name: "Synthetic Raceway 30",
    config_name: "Config 30",
  });
  const apiRequest = f.requests[0].url;
  assert.equal(apiRequest.pathname, "/data/series/season_schedule");
  assert.equal(apiRequest.searchParams.get("season_id"), "10");
  assert.equal(apiRequest.searchParams.has("race_week_num"), false);

  const all = success(
    await f.call("get_series_schedule", { season_id: 10, limit: 2 }),
  );
  assert.deepEqual(
    all.items.map((item) => item.race_week_num),
    [0, 1],
  );
  const tail = success(
    await f.call("get_series_schedule", { cursor: all.next_cursor }),
  );
  assert.deepEqual(
    tail.items.map((item) => item.race_week_num),
    [2],
  );
});

test("series tools reject coercion, unpaired periods, invalid IDs/weeks and edited continuations before network", async (t) => {
  const f = await fixture(t);
  for (const [name, args] of [
    ["list_series_seasons", { season_year: 2026 }],
    ["list_series_seasons", { season_quarter: 4 }],
    ["list_series_seasons", { season_year: "2026", season_quarter: 4 }],
    ["list_series_seasons", { season_year: 1999, season_quarter: 4 }],
    ["list_series_seasons", { season_year: 2101, season_quarter: 4 }],
    ["list_series_seasons", { season_year: 2026, season_quarter: 0 }],
    ["list_series_seasons", { series_id: 0 }],
    ["list_series_seasons", { series_id: "20" }],
    ["list_series_seasons", { cursor: "opaque", limit: 2 }],
    ["get_series_schedule", { season_id: 0 }],
    ["get_series_schedule", { season_id: "10" }],
    ["get_series_schedule", { season_id: 10, race_week_num: -1 }],
    ["get_series_schedule", { season_id: 10, race_week_num: 53 }],
    ["get_series_schedule", { season_id: 10, race_week_num: "0" }],
    ["get_series_schedule", { cursor: "opaque", season_id: 10 }],
  ])
    failure(await f.call(name, args), "INVALID_INPUT");
  assert.equal(f.requests.length, 0);
});

test("series tools return explicit empty local-filter pages and reject malformed essential wire fields", async (t) => {
  const f = await fixture(t);
  const none = success(await f.call("list_series_seasons", { series_id: 999 }));
  assert.deepEqual(none.items, []);
  assert.equal(none.complete, true);
  assert.equal(none.source_total, 0);
  const weekNone = success(
    await f.call("get_series_schedule", { season_id: 10, race_week_num: 52 }),
  );
  assert.deepEqual(weekNone.items, []);
  assert.equal(weekNone.complete, true);

  f.sources.seasons.seasons = [{ ...season(1), active: "true" }];
  failure(await f.call("list_series_seasons"), "DATA_RESOLUTION_FAILED");
  f.sources.schedule = {
    success: true,
    season_id: 10,
    schedules: [{ ...week(0), start_date: "not-a-date" }],
  };
  failure(
    await f.call("get_series_schedule", { season_id: 10 }),
    "DATA_RESOLUTION_FAILED",
  );
  f.sources.schedule = {
    success: true,
    season_id: 11,
    schedules: [week(0)],
  };
  failure(
    await f.call("get_series_schedule", { season_id: 10 }),
    "DATA_RESOLUTION_FAILED",
  );
});

test("series collection projections preserve the shared 100-item/64-KiB result cap", async (t) => {
  const f = await fixture(t, {
    seasons: {
      seasons: Array.from({ length: 101 }, (_, index) => ({
        ...season(index + 1),
        season_name: "x".repeat(900),
      })),
    },
  });
  const first = success(await f.call("list_series_seasons", { limit: 100 }));
  assert.ok(first.returned_count > 0);
  assert.ok(first.returned_count < 100);
  assert.ok(first.next_cursor);
  const second = success(
    await f.call("list_series_seasons", { cursor: first.next_cursor }),
  );
  assert.equal(second.items[0].season_id, first.returned_count + 1);

  f.sources.seasons.seasons = [
    { ...season(1), season_name: "x".repeat(40000) },
  ];
  failure(await f.call("list_series_seasons"), "RESPONSE_LIMIT_EXCEEDED");
});
