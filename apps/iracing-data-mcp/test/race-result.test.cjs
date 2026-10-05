const assert = require("node:assert/strict");
const test = require("node:test");
const http = require("node:http");
const { Configuration } = require("@iracing-data/api-client-fetch");
const driver = (cust_id, change = {}) => ({
  cust_id,
  display_name: `Driver ${cust_id}`,
  car_id: 10,
  car_class_id: 20,
  starting_position: 0,
  finish_position: 1,
  finish_position_in_class: 0,
  laps_complete: 12,
  incidents: 2,
  champ_points: 30,
  oldi_rating: 1000,
  newi_rating: 1020,
  reason_out: "Running",
  licenses: ["SECRET"],
  lap_times: ["SECRET"],
  ...change,
});
const race = () => ({
  subsession_id: 100,
  start_time: "2026-10-01T12:00:00Z",
  series_id: 1,
  series_name: "Synthetic Series",
  season_id: 2,
  track: { track_id: 3, track_name: "Synthetic Track", config_name: "Road" },
  session_results: [
    { simsession_number: 0, results: [driver(3), driver(1), driver(2)] },
  ],
  weather: "SECRET",
  assets: ["SECRET"],
});
async function fixture(t, data = {}, options = {}) {
  const api = await import("../dist/index.js");
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  let now = Date.now();
  const requests = [];
  const sources = { result: race(), ...data };
  const gateway = new api.DataApiGateway({
    configuration: new Configuration({
      accessToken: async () => "TOKEN_SECRET",
    }),
    authorizationState: () => "ready",
    now: () => now,
    logger: api.createDiagnosticLogger(() => {}),
    transport:
      options.transport ??
      (async (url, init) => {
        requests.push({ url, init });
        if (url.hostname === "members-ng.iracing.com") {
          assert.equal(url.pathname, "/data/results/get");
          const key = "result";
          return Response.json({
            link: `https://scorpio-assets.s3.amazonaws.com/synthetic/${key}?secret=SIGNED_SECRET`,
            expires: new Date(now + (options.expiryMs ?? 900000)).toISOString(),
          });
        }
        assert.equal(new Headers(init.headers).has("authorization"), false);
        return Response.json(sources[url.pathname.split("/").pop()]);
      }),
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
    { name: "offline-race-tools", version: "1" },
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
    app,
    gateway,
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
    /SECRET|weather|assets|driver_results|lap_times|licenses|https:/,
  );
  return result.structuredContent;
}
function failure(result, code) {
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, code);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|https:|stack|cause/);
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
}

test("official client compares two results using bounded ordered projections and canonical wire", async (t) => {
  const f = await fixture(t);
  const first = success(
    await f.call("get_race_result", { subsession_id: 100, limit: 1 }),
  );
  assert.equal(first.position_basis, "one_based");
  assert.equal(first.items[0].cust_id, 3);
  assert.equal(first.items[0].starting_position, 1);
  assert.equal(first.items[0].finish_position, 2);
  assert.equal(first.items[0].attribution, "driver");
  assert.equal(f.requests[0].url.searchParams.get("include_licenses"), "false");
  assert.equal(f.requests[0].url.searchParams.get("subsession_id"), "100");
  const count = f.requests.length;
  const [a, b] = await Promise.all([
    f.call("get_race_result", { cursor: first.next_cursor }),
    f.call("get_race_result", { cursor: first.next_cursor }),
  ]);
  assert.deepEqual(success(a), success(b));
  assert.equal(success(a).items[0].cust_id, 1);
  assert.equal(f.requests.length, count);
  failure(
    await f.call("find_drivers", { cursor: first.next_cursor }),
    "CURSOR_EXPIRED",
  );
  f.sources.result.subsession_id = 101;
  f.sources.result.session_results[0].results = [
    driver(3, { finish_position: 0 }),
  ];
  const other = success(
    await f.call("get_race_result", { subsession_id: 101, cust_ids: [3] }),
  );
  assert.equal(other.items[0].finish_position, 1);
  f.gateway.invalidate();
  failure(
    await f.call("get_race_result", { cursor: first.next_cursor }),
    "CURSOR_EXPIRED",
  );
});
test("team driver filters retain team attribution without inheriting totals; no match is valid", async (t) => {
  const f = await fixture(t);
  f.sources.result.session_results[0].results = [
    driver(9, {
      cust_id: null,
      team_id: 44,
      display_name: "Team",
      champ_points: 999,
      driver_results: [
        driver(3, {
          champ_points: undefined,
          starting_position: -1,
          finish_position: -1,
          finish_position_in_class: -1,
        }),
        driver(2),
      ],
    }),
  ];
  const all = success(await f.call("get_race_result", { subsession_id: 100 }));
  assert.equal(all.items[0].team_id, 44);
  assert.equal(all.items[0].cust_id, null);
  assert.equal(all.items[0].attribution, "team");
  const selected = success(
    await f.call("get_race_result", { subsession_id: 100, cust_ids: [3] }),
  );
  assert.equal(selected.items[0].cust_id, 3);
  assert.equal(selected.items[0].team_id, 44);
  assert.equal(selected.items[0].attribution, "team");
  for (const key of [
    "champ_points",
    "starting_position",
    "finish_position",
    "finish_position_in_class",
  ])
    assert.equal(selected.items[0][key], null);
  const none = success(
    await f.call("get_race_result", { subsession_id: 100, cust_ids: [999] }),
  );
  assert.deepEqual(none.items, []);
  assert.equal(none.complete, true);
});
test("strict race inputs reject coercion, bounds, duplicate IDs and modified cursor without reads", async (t) => {
  const f = await fixture(t);
  for (const args of [
    {},
    { subsession_id: "100" },
    { subsession_id: 0 },
    { subsession_id: Number.MAX_SAFE_INTEGER + 1 },
    { subsession_id: 100, cust_ids: [] },
    { subsession_id: 100, cust_ids: [1, 1] },
    {
      subsession_id: 100,
      cust_ids: Array.from({ length: 11 }, (_, i) => i + 1),
    },
    { subsession_id: 100, simsession_number: 21 },
    { subsession_id: 100, simsession_number: -21 },
    { subsession_id: 100, simsession_number: "0" },
    { subsession_id: 100, limit: 101 },
    { subsession_id: 100, limit: 0 },
    { subsession_id: 100, include_licenses: true },
    { cursor: "x", subsession_id: 100 },
    { cursor: "x", limit: 1 },
  ])
    failure(await f.call("get_race_result", args), "INVALID_INPUT");
  assert.equal(f.requests.length, 0);
});
test("session not found and malformed essentials/optionals fail safely", async (t) => {
  const f = await fixture(t);
  failure(
    await f.call("get_race_result", {
      subsession_id: 100,
      simsession_number: 1,
    }),
    "NOT_FOUND",
  );
  const optional = driver(1);
  for (const key of [
    "car_id",
    "car_class_id",
    "laps_complete",
    "incidents",
    "champ_points",
    "oldi_rating",
    "newi_rating",
    "reason_out",
    "starting_position",
    "finish_position",
    "finish_position_in_class",
  ])
    delete optional[key];
  f.sources.result.session_results[0].results = [optional];
  const row = success(await f.call("get_race_result", { subsession_id: 100 }))
    .items[0];
  assert.equal(row.car_id, null);
  assert.equal(row.reason_out, null);
  for (const change of [
    { display_name: undefined },
    { cust_id: 0 },
    { finish_position: 1.5 },
    { finish_position: Number.MAX_SAFE_INTEGER },
    { incidents: "SECRET" },
    { team_id: 44, driver_results: [{ cust_id: 1 }] },
  ]) {
    f.sources.result.session_results[0].results = [driver(1, change)];
    failure(
      await f.call("get_race_result", { subsession_id: 100, cust_ids: [1] }),
      "DATA_RESOLUTION_FAILED",
    );
  }
  for (const change of [
    { subsession_id: 101 },
    { track: {} },
    { session_results: [{ simsession_number: 0 }] },
    {
      session_results: [
        { simsession_number: 0, results: [] },
        { simsession_number: 0, results: [] },
      ],
    },
  ]) {
    f.sources.result = { ...race(), ...change };
    failure(
      await f.call("get_race_result", { subsession_id: 100 }),
      "DATA_RESOLUTION_FAILED",
    );
  }
});
test("race result pages enforce byte/item/source caps and earliest expiry", async (t) => {
  const f = await fixture(t);
  f.sources.result.session_results[0].results = Array.from(
    { length: 150 },
    (_, i) => driver(i + 1),
  );
  const page = success(
    await f.call("get_race_result", { subsession_id: 100, limit: 100 }),
  );
  assert.equal(page.returned_count, 100);
  assert.equal(page.source_total, 150);
  const tail = success(
    await f.call("get_race_result", { cursor: page.next_cursor }),
  );
  assert.equal(tail.returned_count, 50);
  assert.equal(tail.items[0].cust_id, 101);
  assert.equal(tail.complete, true);
  f.sources.result.session_results[0].results = Array.from(
    { length: 100 },
    (_, i) => driver(i + 1, { display_name: "x".repeat(900) }),
  );
  const small = success(
    await f.call("get_race_result", { subsession_id: 100, limit: 100 }),
  );
  assert.ok(small.returned_count < 100);
  f.sources.result.session_results[0].results = [
    driver(1, { display_name: "x".repeat(40000) }),
  ];
  failure(
    await f.call("get_race_result", { subsession_id: 100 }),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  f.sources.result = { ...race(), bulk: "x".repeat(8 * 1024 * 1024) };
  failure(
    await f.call("get_race_result", { subsession_id: 100, cust_ids: [999] }),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  const expired = await fixture(t, {}, { expiryMs: 30000 });
  failure(
    await expired.call("get_race_result", { subsession_id: 100, limit: 1 }),
    "CURSOR_EXPIRED",
  );
  let clock = Date.now();
  t.mock.method(Date, "now", () => clock);
  const short = await fixture(t, {}, { expiryMs: 120000 });
  const cursor = success(
    await short.call("get_race_result", { subsession_id: 100, limit: 1 }),
  ).next_cursor;
  clock += 120000;
  failure(await short.call("get_race_result", { cursor }), "CURSOR_EXPIRED");
});

test("race results propagate HTTP disconnect cancellation into the gateway", async (t) => {
  for (const [name, args] of [["get_race_result", { subsession_id: 100 }]]) {
    let started = false,
      aborted = false;
    const f = await fixture(
      t,
      {},
      {
        transport: async (url, init) => {
          if (url.hostname === "members-ng.iracing.com")
            return Response.json({
              link: "https://scorpio-assets.s3.amazonaws.com/pending",
              expires: new Date(Date.now() + 900000).toISOString(),
            });
          started = true;
          init.signal.addEventListener("abort", () => {
            aborted = true;
          });
          return new Promise(() => {});
        },
      },
    );
    const req = http.request({
      host: "127.0.0.1",
      port: f.app.server.address().port,
      path: "/mcp",
      method: "POST",
      headers: {
        Host: "127.0.0.1:3000",
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
        "MCP-Protocol-Version": "2025-11-25",
      },
    });
    req.on("error", () => {});
    req.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 99,
        method: "tools/call",
        params: { name, arguments: args },
      }),
    );
    for (let index = 0; index < 100 && !started; index++)
      await new Promise(setImmediate);
    assert.equal(started, true);
    req.destroy();
    for (let index = 0; index < 100 && !aborted; index++)
      await new Promise(setImmediate);
    assert.equal(aborted, true);
    assert.equal(await f.gateway.withCall(async () => "released"), "released");
  }
});

test("race cursors share global capacity and unrelated sessions do not change selection", async (t) => {
  const f = await fixture(t);
  f.sources.result.session_results.push({ simsession_number: 21, results: [] });
  for (let index = 0; index < 32; index++) {
    success(await f.call("get_race_result", { subsession_id: 100, limit: 1 }));
  }
  failure(
    await f.call("get_race_result", { subsession_id: 100, limit: 1 }),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  f.gateway.invalidate();
  success(await f.call("get_race_result", { subsession_id: 100, limit: 1 }));
});

test("filtered nested drivers preserve order and selected nondefault session validates optional context", async (t) => {
  const f = await fixture(t);
  f.sources.result.session_results[0].results = [
    driver(1, {
      cust_id: null,
      team_id: 44,
      driver_results: [driver(3), driver(2), driver(1)],
    }),
  ];
  const team = success(
    await f.call("get_race_result", { subsession_id: 100, cust_ids: [1, 3] }),
  );
  assert.deepEqual(
    team.items.map((row) => row.cust_id),
    [3, 1],
  );
  for (const row of team.items) {
    assert.equal(row.team_id, 44);
    assert.equal(row.attribution, "team");
  }
  delete f.sources.result.start_time;
  delete f.sources.result.series_id;
  delete f.sources.result.series_name;
  delete f.sources.result.season_id;
  delete f.sources.result.track.track_name;
  delete f.sources.result.track.config_name;
  f.sources.result.session_results = [
    { simsession_number: 0, results: [{ cust_id: 0 }] },
    { simsession_number: -1, results: [driver(7)] },
  ];
  const selected = success(
    await f.call("get_race_result", {
      subsession_id: 100,
      simsession_number: -1,
    }),
  );
  assert.equal(selected.simsession_number, -1);
  assert.equal(selected.items[0].cust_id, 7);
  for (const key of ["start_time", "series_id", "series_name", "season_id"])
    assert.equal(selected[key], null);
  assert.deepEqual(selected.track, {
    track_id: 3,
    track_name: null,
    config_name: null,
  });
});
