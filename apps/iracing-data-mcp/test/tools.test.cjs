const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { Configuration } = require("@iracing-data/api-client-fetch");
const names = [
  "get_my_driver",
  "find_drivers",
  "get_recent_races",
  "lookup_content",
  "list_series_seasons",
  "get_series_schedule",
  "get_race_result",
  "search_driver_races",
];
const hidden = {
  account: "ACCOUNT_SECRET",
  car_packages: ["PACKAGE_SECRET"],
  helmet: "LIVERY_SECRET",
  price: 999,
  asset: "https://example.invalid/SIGNED_SECRET",
};
const driver = (id = 1) => ({
  cust_id: id,
  display_name: `Synthetic Driver ${id}`,
  ...hidden,
});
const car = (id = 1) => ({
  car_id: id,
  car_name: `Synthetic Car ${id}`,
  car_name_abbreviated: `SC${id}`,
  ...hidden,
});
const track = (id = 1) => ({
  track_id: id,
  track_name: "Synthetic Raceway",
  config_name: `Full ${id}`,
  category_id: 2,
  is_oval: false,
  is_dirt: false,
  ...hidden,
});
const race = (id = 1) => ({
  subsession_id: id,
  series_id: 20,
  series_name: "Synthetic Series",
  season_year: 2026,
  season_quarter: 4,
  track: { track_id: 30, track_name: "Synthetic Raceway", ...hidden },
  car_id: 40,
  session_start_time: "2030-01-01T01:00:00Z",
  start_position: -1,
  finish_position: 0,
  laps: 10,
  incidents: 2,
  points: 3,
  oldi_rating: 1500,
  newi_rating: 1502,
  ...hidden,
});
async function fixture(t, data = {}, options = {}) {
  const api = {
    ...(await import("../dist/index.js")),
    ...(await import("@iracing-data/mcp-tools")),
  };
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  let state = "ready",
    now = Date.now();
  t.mock.method(Date, "now", () => now);
  const requests = [],
    logs = [];
  const sources = {
    member: driver(),
    drivers: [driver(2), driver(1)],
    cars: [car(3), car(1), car(2)],
    tracks: [track(2), track(1)],
    recent: {
      cust_id: 1,
      races: Array.from({ length: 12 }, (_, i) => race(i + 1)),
    },
    ...data,
  };
  let continuationScope = {};
  const transport = async (url, init) => {
    requests.push({ url, init });
    if (options.transport) return options.transport(url, init, sources);
    if (url.hostname === "members-ng.iracing.com") {
      const key =
        [
          ["member/info", "member"],
          ["lookup/drivers", "drivers"],
          ["stats/member_recent_races", "recent"],
          ["/car/get", "cars"],
        ].find(([part]) => url.pathname.includes(part))?.[1] ?? "tracks";
      return Response.json({
        link: `https://scorpio-assets.s3.amazonaws.com/synthetic/${key}?secret=SIGNED_SECRET`,
        expires: new Date(now + (options.expiryMs ?? 900000)).toISOString(),
      });
    }
    assert.equal(new Headers(init.headers).has("authorization"), false);
    return Response.json(sources[url.pathname.split("/").pop()]);
  };
  const configuration = new Configuration({
    accessToken: async () => "TOKEN_SECRET",
    fetchApi: (url, init) => transport(new URL(url), init),
  });
  const access = () => ({ configuration, continuationScope });
  const changeScope = () => {
    continuationScope = {};
  };

  const services = {
    oauthClient: {},
    dataApiConfiguration: {},
    getDataApiAccess: () => {
      if (state !== "ready")
        throw new api.ApplicationFailure("AUTHORIZATION_REQUIRED");
      return access();
    },
    authorizationState: () => state,
  };
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
    logger: api.createDiagnosticLogger((line) => logs.push(line)),
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
    { name: "offline-tools", version: "1" },
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
  const call = (name, args = {}) => client.callTool({ name, arguments: args });
  return {
    api,
    app,
    client,
    call,
    access,
    changeScope,
    requests,
    sources,
    logs,
    setState: (value) => {
      state = value;
      changeScope();
    },
    advance: (ms) => (now += ms),
    now: () => now,
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
    /SECRET|https:|account|car_packages|helmet|price|asset/,
  );
  return result.structuredContent;
}
function failure(result, code) {
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, code);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|https:|stack|cause/);
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
}
test("official client identity and recent-performance scenario uses auth-only member/info and the bounded window", async (t) => {
  const f = await fixture(t);
  assert.deepEqual(
    (await f.client.listTools()).tools.map((x) => x.name),
    names,
  );
  assert.equal(f.requests.length, 0);
  assert.deepEqual(success(await f.call("get_my_driver")), {
    cust_id: 1,
    display_name: "Synthetic Driver 1",
  });
  const r = success(await f.call("get_recent_races"));
  assert.equal(r.races.length, 10);
  assert.equal(r.complete, true);
  assert.equal(r.position_basis, "upstream");
  assert.equal(r.races[0].start_position, -1);
  assert.equal(r.races[0].finish_position, 0);
  assert.equal(r.races[0].track_id, 30);
  assert.ok(!("track" in r.races[0]));
  assert.deepEqual(
    f.requests
      .filter((x) => x.url.hostname === "members-ng.iracing.com")
      .map((x) => x.url.pathname),
    ["/data/member/info", "/data/stats/member_recent_races"],
  );
  assert.equal(
    success(await f.call("get_recent_races", { cust_id: 1, limit: 2 }))
      .returned_count,
    2,
  );
  failure(
    await f.call("get_recent_races", { cust_id: 2 }),
    "DATA_RESOLUTION_FAILED",
  );
});
test("strict inputs reject unknown keys, tokens, coercion, contradictory modes and continuation edits before network", async (t) => {
  const f = await fixture(t);
  for (const [name, args] of [
    ["get_my_driver", { token: "TOKEN_SECRET" }],
    ["get_my_driver", { cust_id: 1 }],
    ["find_drivers", { query: "x" }],
    ["find_drivers", { query: "  " }],
    ["find_drivers", { query: "x".repeat(101) }],
    ["find_drivers", { query: "ab", league_id: "1" }],
    ["find_drivers", { query: "ab", limit: 1.5 }],
    ["find_drivers", { cursor: "TOKEN_SECRET", limit: 2 }],
    ["lookup_content", { kind: "cars", ids: [1, 1] }],
    ["lookup_content", { kind: "cars", ids: [] }],
    ["lookup_content", { kind: "cars", ids: ["1"] }],
    ["lookup_content", { kind: "cars", ids: [1], query: "ab" }],
    ["lookup_content", { kind: "boats" }],
    [
      "lookup_content",
      { kind: "cars", ids: Array.from({ length: 51 }, (_, i) => i + 1) },
    ],
    ["lookup_content", { cursor: "TOKEN_SECRET", kind: "cars" }],
    ["get_recent_races", { cust_id: "1" }],
    ["get_recent_races", { limit: 11 }],
    ["get_recent_races", { limit: 0 }],
    ["get_recent_races", { cust_id: -1 }],
  ])
    failure(await f.call(name, args), "INVALID_INPUT");
  assert.equal(f.requests.length, 0);
});
test("driver ambiguity preserves rank, filter mapping, immutable pages and concurrent cursor replay", async (t) => {
  const f = await fixture(t);
  const first = success(
    await f.call("find_drivers", {
      query: " Synthetic ",
      league_id: 3,
      limit: 1,
    }),
  );
  assert.equal(first.items[0].cust_id, 2);
  assert.equal(first.ambiguous, true);
  assert.equal(first.complete, false);
  assert.equal(first.source_total, 2);
  assert.match(first.next_cursor, /^[A-Za-z0-9_-]{43}$/);
  const wire = f.requests[0].url;
  assert.equal(wire.searchParams.get("search_term"), "Synthetic");
  assert.equal(wire.searchParams.get("league_id"), "3");
  f.sources.drivers[1].display_name = "CHANGED";
  const pages = await Promise.all(
    Array.from({ length: 8 }, () =>
      f.call("find_drivers", { cursor: first.next_cursor }),
    ),
  );
  pages.forEach((x) => assert.deepEqual(success(x), success(pages[0])));
  assert.equal(success(pages[0]).items[0].display_name, "Synthetic Driver 1");
  assert.equal(success(pages[0]).next_cursor, null);
  assert.equal(f.requests.length, 2);
  failure(
    await f.call("lookup_content", { cursor: first.next_cursor }),
    "CURSOR_EXPIRED",
  );
  failure(
    await f.call("find_drivers", { cursor: "not-an-opaque-token" }),
    "CURSOR_EXPIRED",
  );
});
test("content scenario sorts IDs, reports missing IDs and searches names/configurations without per-ID requests", async (t) => {
  const f = await fixture(t);
  const all = success(await f.call("lookup_content", { kind: "cars" }));
  assert.deepEqual(
    all.items.map((x) => x.car_id),
    [1, 2, 3],
  );
  const selected = success(
    await f.call("lookup_content", { kind: "cars", ids: [3, 99, 1], limit: 1 }),
  );
  assert.deepEqual(selected.missing_ids, [99]);
  assert.deepEqual(
    selected.items.map((x) => x.car_id),
    [1],
  );
  const next = success(
    await f.call("lookup_content", { cursor: selected.next_cursor }),
  );
  assert.deepEqual(
    next.items.map((x) => x.car_id),
    [3],
  );
  assert.deepEqual(next.missing_ids, [99]);
  assert.equal(f.requests.length, 4);
  const tracks = success(
    await f.call("lookup_content", { kind: "tracks", query: "fUlL 2" }),
  );
  assert.equal(tracks.items.length, 1);
  assert.equal(tracks.items[0].track_id, 2);
  assert.equal(tracks.items[0].is_oval, false);
  const missing = success(
    await f.call("lookup_content", { kind: "cars", ids: [77] }),
  );
  assert.deepEqual(missing.items, []);
  assert.deepEqual(missing.missing_ids, [77]);
});
test("empty sources, absent optional fields and malformed essential fields never fabricate data", async (t) => {
  const f = await fixture(t, {
    drivers: [],
    cars: [],
    recent: { cust_id: 1, races: [] },
  });
  assert.equal(
    success(await f.call("find_drivers", { query: "ab" })).ambiguous,
    false,
  );
  assert.deepEqual(
    success(await f.call("lookup_content", { kind: "cars" })).items,
    [],
  );
  assert.deepEqual(success(await f.call("get_recent_races")).races, []);
  f.sources.drivers = [{ cust_id: 1 }];
  failure(
    await f.call("find_drivers", { query: "ab" }),
    "DATA_RESOLUTION_FAILED",
  );
  f.sources.cars = [{ car_id: 1, car_name: "Synthetic" }];
  assert.equal(
    success(await f.call("lookup_content", { kind: "cars" })).items[0]
      .car_name_abbreviated,
    null,
  );
  f.sources.cars = [car(1), car(1)];
  failure(
    await f.call("lookup_content", { kind: "cars" }),
    "DATA_RESOLUTION_FAILED",
  );
  f.sources.recent = { cust_id: 1, races: [{ subsession_id: 2 }] };
  const r = success(await f.call("get_recent_races"));
  assert.equal(r.races[0].points, null);
  assert.equal(r.races[0].track_id, null);
  f.sources.recent.races[0].points = "SECRET";
  failure(await f.call("get_recent_races"), "DATA_RESOLUTION_FAILED");
});
test("complete result cap includes duplicated text, reduces collection pages and rejects an oversize item", async (t) => {
  const f = await fixture(t, {
    drivers: Array.from({ length: 101 }, (_, i) => ({
      cust_id: i + 1,
      display_name: "x".repeat(900),
    })),
  });
  const p = success(await f.call("find_drivers", { query: "ab", limit: 100 }));
  assert.ok(p.returned_count < 100);
  assert.ok(p.returned_count > 0);
  assert.ok(p.next_cursor);
  const q = success(await f.call("find_drivers", { cursor: p.next_cursor }));
  assert.equal(q.items[0].cust_id, p.returned_count + 1);
  f.sources.drivers = [{ cust_id: 1, display_name: "x".repeat(40000) }];
  failure(
    await f.call("find_drivers", { query: "ab" }),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  f.sources.member = { cust_id: 1, display_name: "x".repeat(40000) };
  failure(await f.call("get_my_driver"), "RESPONSE_LIMIT_EXCEEDED");
  f.sources.recent.races = [{ ...race(), series_name: "x".repeat(40000) }];
  failure(await f.call("get_recent_races"), "RESPONSE_LIMIT_EXCEEDED");
});
test("earliest envelope expiry, scope replacement and authorization loss retire cursors without network replay", async (t) => {
  const f = await fixture(t, {}, { expiryMs: 90000 });
  t.mock.method(Date, "now", () => f.now());
  let p = success(await f.call("find_drivers", { query: "ab", limit: 1 }));
  f.advance(60001);
  // Envelope expiry minus thirty seconds wins over the five-minute policy.
  failure(
    await f.call("find_drivers", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  p = success(await f.call("find_drivers", { query: "ab", limit: 1 }));
  f.setState("authorization_required");
  failure(
    await f.call("find_drivers", { cursor: p.next_cursor }),
    "AUTHORIZATION_REQUIRED",
  );
  f.setState("ready");
  failure(
    await f.call("find_drivers", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  assert.deepEqual(
    (await f.client.listTools()).tools.map((x) => x.name),
    names,
  );
  assert.doesNotMatch(f.logs.join(""), /SECRET|Synthetic Driver|https:/);
});
test("unauthenticated initialize/listing remain available; tools require auth", async (t) => {
  const f = await fixture(t);
  f.setState("authorization_required");
  assert.deepEqual(
    (await f.client.listTools()).tools.map((x) => x.name),
    names,
  );
  for (const [name, args] of [
    ["get_my_driver", {}],
    ["find_drivers", { query: "ab" }],
    ["lookup_content", { kind: "cars" }],
    ["get_recent_races", {}],
  ])
    failure(await f.call(name, args), "AUTHORIZATION_REQUIRED");
  assert.equal(f.requests.length, 0);
});
test("100-item page cap completes on the next cursor and schema listing keeps strict variants", async (t) => {
  const f = await fixture(t, {
    drivers: Array.from({ length: 101 }, (_, i) => driver(i + 1)),
  });
  const tools = (await f.client.listTools()).tools;
  for (const tool of tools) assert.equal(tool.inputSchema.type, "object");
  assert.equal(tools[0].inputSchema.additionalProperties, false);
  const variants = tools[1].inputSchema.anyOf;
  assert.equal(variants.length, 2);
  variants.forEach((v) => assert.equal(v.additionalProperties, false));
  const p = success(await f.call("find_drivers", { query: "ab", limit: 100 }));
  assert.equal(p.returned_count, 100);
  const q = success(await f.call("find_drivers", { cursor: p.next_cursor }));
  assert.equal(q.returned_count, 1);
  assert.equal(q.complete, true);
});
test("tool disconnect passes cancellation into generated requests", async (t) => {
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
        init.signal.addEventListener("abort", () => (aborted = true));
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener(
            "abort",
            () => reject(init.signal.reason),
            { once: true },
          );
        });
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
      params: { name: "get_my_driver", arguments: {} },
    }),
  );
  for (let i = 0; i < 100 && !started; i++) await new Promise(setImmediate);
  assert.equal(started, true);
  req.destroy();
  for (let i = 0; i < 100 && !aborted; i++) await new Promise(setImmediate);
  assert.equal(aborted, true);
});
