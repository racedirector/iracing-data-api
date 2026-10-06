const assert = require("node:assert/strict");
const test = require("node:test");
const http = require("node:http");
const { Configuration } = require("@iracing-data/api-client-fetch");
const race = (id, track = 30, changes = {}) => ({
  subsession_id: id,
  start_time: "2026-10-01T00:00:00Z",
  end_time: "2026-10-01T00:30:00Z",
  season_id: 2,
  series_id: 3,
  series_name: "Synthetic series",
  track: {
    track_id: track,
    track_name: "Synthetic track",
    config_name: "Full",
  },
  event_type: 5,
  num_drivers: 20,
  official_session: true,
  raw_url: "SECRET",
  finish_position: 1,
  ...changes,
});
const manifest = (chunks, changes = {}) => ({
  type: "search_series_results",
  data: {
    success: true,
    params: {},
    chunk_info: {
      chunk_size: chunks[0]?.length ?? 0,
      rows: chunks.reduce((n, c) => n + c.length, 0),
      num_chunks: chunks.length,
      base_download_url: "https://scorpio-assets.s3.amazonaws.com/search/",
      chunk_file_names: chunks.map((_, i) => `${i}.json`),
      ...changes,
    },
  },
});
const initial = { cust_id: 7, range: { season_year: 2026, season_quarter: 4 } };
async function fixture(t, data = {}, options = {}) {
  const api = await import("../dist/index.js");
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  let now = Date.now();
  const requests = [];
  let ready = true;
  const sources = { chunks: [[race(30), race(10)], [race(20)]], ...data };
  const gateway = new api.DataApiGateway({
    configuration: new Configuration({
      accessToken: async () => "TOKEN_SECRET",
    }),
    authorizationState: () => (ready ? "ready" : "authorization_required"),
    now: () => now,
    logger: api.createDiagnosticLogger(() => {}),
    transport:
      options.transport ??
      (async (url, init) => {
        requests.push({ url, init });
        if (url.hostname === "members-ng.iracing.com") {
          if (url.pathname.endsWith("/member/info"))
            return Response.json({
              link: "https://scorpio-assets.s3.amazonaws.com/member",
              expires: new Date(
                now + (options.expiryMs ?? 900000),
              ).toISOString(),
            });
          assert.equal(url.pathname, "/data/results/search_series");
          return Response.json({
            ...manifest(sources.chunks, sources.manifest),
            data: {
              ...manifest(sources.chunks, sources.manifest).data,
              params: sources.params ?? {},
            },
          });
        }
        assert.equal(new Headers(init.headers).has("authorization"), false);
        if (url.pathname === "/member")
          return Response.json({
            cust_id: 7,
            display_name: "Synthetic driver",
          });
        const index = Number(url.pathname.split("/").pop().split(".")[0]);
        if (sources.status)
          return new Response(null, { status: sources.status });
        return Response.json(sources.chunks[index]);
      }),
  });
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services: {
      oauthClient: {},
      dataApiConfiguration: {},
      dataApiGateway: gateway,
      authorizationState: () => (ready ? "ready" : "authorization_required"),
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
    app,
    gateway,
    client,
    requests,
    sources,
    call: (name, args = {}) => client.callTool({ name, arguments: args }),
    advance: (ms) => (now += ms),
    now: () => now,
    unauthorize: () => {
      ready = false;
    },
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
    /SECRET|raw_url|finish_position|https:/,
  );
  return result.structuredContent;
}
function failure(result, code) {
  assert.equal(result.isError, true, JSON.stringify(result));
  assert.equal(result.structuredContent.error.code, code);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|https:|stack|cause/);
}
test("official search preserves manifest rows, projects only summaries, and replays concurrently", async (t) => {
  const f = await fixture(t);
  const p = success(
    await f.call("search_driver_races", { ...initial, limit: 1 }),
  );
  assert.deepEqual(
    p.items.map((x) => x.subsession_id),
    [30],
  );
  assert.equal(p.source_total, 3);
  assert.equal(p.order, "subsession_id");
  const args = { cursor: p.next_cursor };
  const [a, b] = await Promise.all([
    f.call("search_driver_races", args),
    f.call("search_driver_races", args),
  ]);
  assert.deepEqual(success(a), success(b));
  const q = success(
    await f.call("search_driver_races", { cursor: success(a).next_cursor }),
  );
  assert.deepEqual(
    q.items.map((x) => x.subsession_id),
    [20],
  );
  assert.equal(q.complete, true);
  assert.deepEqual(
    success(await f.call("search_driver_races", args)),
    success(a),
  );
  assert.equal(
    f.requests.filter((r) => r.url.hostname === "members-ng.iracing.com")
      .length,
    1,
  );
  const wire = f.requests[0].url.searchParams;
  assert.equal(wire.get("cust_id"), "7");
  assert.equal(wire.get("event_types"), "5");
  assert.equal(wire.has("track_ids"), false);
});
test("self default, canonical UTC Date mapping, season and optional wire filters", async (t) => {
  const f = await fixture(t);
  const p = success(
    await f.call("search_driver_races", {
      range: {
        start: "2026-10-01T00:00:00Z",
        start_end: "2026-10-02T00:00:00Z",
      },
      series_id: 3,
      official_only: false,
      track_ids: [30],
    }),
  );
  assert.equal(p.cust_id, 7);
  assert.equal(p.complete, true);
  const request = f.requests.find((r) =>
    r.url.pathname.endsWith("search_series"),
  ).url.searchParams;
  assert.equal(request.get("start_range_begin"), "2026-10-01T00:00:00.000Z");
  assert.equal(request.get("start_range_end"), "2026-10-02T00:00:00.000Z");
  assert.equal(request.get("official_only"), "false");
  assert.equal(request.get("series_id"), "3");
});
test("four distinct chunk scan boundary permits zero matches and honest source total", async (t) => {
  const f = await fixture(t, {
    chunks: Array.from({ length: 6 }, (_, i) => [
      race(i + 1, i === 5 ? 99 : 30),
    ]),
  });
  const p = success(
    await f.call("search_driver_races", { ...initial, track_ids: [99] }),
  );
  assert.equal(p.items.length, 0);
  assert.equal(p.complete, false);
  assert.equal(p.source_total, 6);
  assert.equal(
    f.requests.filter((r) => r.url.pathname.startsWith("/search/")).length,
    4,
  );
  const q = success(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
  );
  assert.deepEqual(
    q.items.map((x) => x.subsession_id),
    [6],
  );
  assert.equal(q.complete, true);
});
test("strict initial/cursor union rejects unsafe or unbounded inputs before network", async (t) => {
  const f = await fixture(t);
  for (const input of [
    {},
    { ...initial, cust_id: "7" },
    { ...initial, track_ids: [30, 30] },
    { ...initial, team_id: 1 },
    { ...initial, limit: 101 },
    { ...initial, range: { season_year: 2026 } },
    {
      ...initial,
      range: {
        start: "2026-01-01T00:00:00Z",
        start_end: "2026-10-01T00:00:00Z",
      },
    },
    {
      ...initial,
      range: {
        start: "2026-10-01T00:00:00+01:00",
        start_end: "2026-10-02T00:00:00Z",
      },
    },
    { ...initial, cursor: "x" },
  ])
    failure(await f.call("search_driver_races", input), "INVALID_INPUT");
  assert.equal(f.requests.length, 0);
});
test("empty source completes; byte limit preserves offset and source order", async (t) => {
  const empty = await fixture(t, { chunks: [] });
  const p = success(await empty.call("search_driver_races", initial));
  assert.equal(p.complete, true);
  assert.equal(p.source_total, 0);
  const f = await fixture(t, {
    chunks: [
      [
        race(1, 30, { series_name: "x".repeat(18000) }),
        race(2, 30, { series_name: "x".repeat(18000) }),
        race(3),
      ],
    ],
  });
  const first = success(await f.call("search_driver_races", initial));
  assert.equal(first.returned_count, 1);
  const next = success(
    await f.call("search_driver_races", { cursor: first.next_cursor }),
  );
  assert.deepEqual(
    next.items.map((x) => x.subsession_id),
    [2, 3],
  );
});
test("expiry, account invalidation, cross-tool and restart cursors never restart manifests", async (t) => {
  const f = await fixture(t);
  const p = success(
    await f.call("search_driver_races", { ...initial, limit: 1 }),
  );
  failure(
    await f.call("find_drivers", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  f.advance(300001);
  failure(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  assert.equal(
    f.requests.filter((r) => r.url.pathname.endsWith("search_series")).length,
    1,
  );
  const p2 = success(
    await f.call("search_driver_races", { ...initial, limit: 1 }),
  );
  f.gateway.invalidate();
  failure(
    await f.call("search_driver_races", { cursor: p2.next_cursor }),
    "CURSOR_EXPIRED",
  );
  const other = await fixture(t);
  failure(
    await other.call("search_driver_races", { cursor: p2.next_cursor }),
    "CURSOR_EXPIRED",
  );
  const p3 = success(
    await f.call("search_driver_races", { ...initial, limit: 1 }),
  );
  f.unauthorize();
  failure(
    await f.call("search_driver_races", { cursor: p3.next_cursor }),
    "AUTHORIZATION_REQUIRED",
  );
});
test("missing chunk and manifest mismatches fail safely without snapshot replacement", async (t) => {
  const f = await fixture(t);
  const p = success(
    await f.call("search_driver_races", { ...initial, limit: 2 }),
  );
  f.sources.status = 404;
  failure(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  failure(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  assert.equal(
    f.requests.filter((r) => r.url.pathname.endsWith("search_series")).length,
    1,
  );
  for (const changes of [
    { rows: 4 },
    { num_chunks: 3 },
    { chunk_file_names: ["0.json", "0.json"] },
  ]) {
    const bad = await fixture(t, { manifest: changes });
    failure(
      await bad.call("search_driver_races", initial),
      "DATA_RESOLUTION_FAILED",
    );
  }
  const bad = await fixture(t);
  const first = success(
    await bad.call("search_driver_races", { ...initial, limit: 2 }),
  );
  bad.sources.chunks[1] = [];
  failure(
    await bad.call("search_driver_races", { cursor: first.next_cursor }),
    "DATA_RESOLUTION_FAILED",
  );
  bad.sources.chunks[1] = [race(20)];
  assert.equal(
    success(
      await bad.call("search_driver_races", { cursor: first.next_cursor }),
    ).items[0].subsession_id,
    20,
  );
});
test("100 item cap and oversized single item fail without unbounded aggregation", async (t) => {
  const f = await fixture(t, {
    chunks: [Array.from({ length: 101 }, (_, i) => race(i + 1))],
  });
  const p = success(
    await f.call("search_driver_races", { ...initial, limit: 100 }),
  );
  assert.equal(p.returned_count, 100);
  assert.equal(
    success(await f.call("search_driver_races", { cursor: p.next_cursor }))
      .returned_count,
    1,
  );
  const big = await fixture(t, {
    chunks: [[race(1, 30, { series_name: "x".repeat(65536) })]],
  });
  failure(
    await big.call("search_driver_races", initial),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  const bad = await fixture(t, {
    chunks: [[race(1, 30, { subsession_id: 0 })]],
  });
  failure(
    await bad.call("search_driver_races", initial),
    "DATA_RESOLUTION_FAILED",
  );
});
test("earliest member envelope expiry applies to initial search and all replay pages", async (t) => {
  const f = await fixture(t, {}, { expiryMs: 90000 });
  t.mock.method(Date, "now", () => f.now());
  const p = success(
    await f.call("search_driver_races", { range: initial.range, limit: 1 }),
  );
  f.advance(60001);
  failure(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  assert.equal(
    f.requests.filter((r) => r.url.pathname.endsWith("search_series")).length,
    1,
  );
});
test("combined token budget characterizes existing collections and reclaims invalidated owners", async (t) => {
  const f = await fixture(t);
  const owner = new f.api.CollectionCursors(
    () => f.now(),
    f.gateway.retention,
    () => f.gateway.generation,
  );
  const start = () =>
    owner.start({
      tool: "characterization",
      filters: {},
      generation: f.gateway.generation,
      items: [{ id: 1 }, { id: 2 }],
      limit: 1,
      expiresAt: f.now() + 300000,
    });
  const cursors = Array.from({ length: 31 }, start);
  const p = success(
    await f.call("search_driver_races", { ...initial, limit: 1 }),
  );
  failure(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  assert.deepEqual(
    owner.resume(
      "characterization",
      cursors[0].structuredContent.next_cursor,
      f.gateway.generation,
    ).structuredContent.items,
    [{ id: 2 }],
  );
  f.gateway.invalidate();
  const fresh = success(
    await f.call("search_driver_races", { ...initial, limit: 1 }),
  );
  assert.equal(fresh.items[0].subsession_id, 30);
  assert.throws(() =>
    owner.resume(
      "characterization",
      cursors[1].structuredContent.next_cursor,
      f.gateway.generation,
    ),
  );
});
test("combined serialized byte budget includes projected collections, manifests, chunks and replay", async (t) => {
  const f = await fixture(t, {
    chunks: [[race(1, 30, { raw_url: "x".repeat(3 * 1024 * 1024) }), race(2)]],
  });
  const owner = new f.api.CollectionCursors(
    () => f.now(),
    f.gateway.retention,
    () => f.gateway.generation,
  );
  const start = () =>
    owner.start({
      tool: "characterization",
      filters: {},
      generation: f.gateway.generation,
      items: [
        { id: 1 },
        ...Array.from({ length: 6 }, (_, i) => ({
          id: i + 2,
          hidden: "x".repeat(1024 * 1024),
        })),
      ],
      limit: 1,
      expiresAt: f.now() + 1000,
    });
  for (let i = 0; i < 5; i++) start();
  failure(
    await f.call("search_driver_races", initial),
    "RESPONSE_LIMIT_EXCEEDED",
  );
  f.advance(1001);
  assert.equal(
    success(await f.call("search_driver_races", initial)).returned_count,
    2,
  );
  // Reverse direction: expired search manifests/chunks release space for a collection reservation.
  f.advance(300001);
  assert.ok(start().structuredContent.next_cursor);
});
test("cache 403 retires the exact search handle and explicit release never invalidates peers", async (t) => {
  const f = await fixture(t);
  const p = success(
    await f.call("search_driver_races", { ...initial, limit: 2 }),
  );
  f.sources.status = 403;
  failure(
    await f.call("search_driver_races", { cursor: p.next_cursor }),
    "CURSOR_EXPIRED",
  );
  const [one, two] = await f.gateway.withCall(async (call) => [
    await call.search({ cust_id: 7, event_types: "5" }),
    await call.search({ cust_id: 8, event_types: "5" }),
  ]);
  f.gateway.releaseSearch(one);
  f.gateway.releaseSearch(one);
  assert.equal(f.gateway.hasSearch(one), false);
  assert.equal(f.gateway.hasSearch(two), true);
  assert.equal(f.gateway.hasSearch({ ...two }), false);
});
test("canceling a search continuation does not advance or publish its offset", async (t) => {
  const { SearchCursors } = await import("../dist/tools/search.js");
  const f = await fixture(t);
  const owner = new SearchCursors(f.gateway, () => f.now());
  const ready = new AbortController();
  const p = await f.gateway.withCall((call) =>
    owner.start({ ...initial, limit: 2 }, call, ready.signal),
  );
  const canceled = new AbortController();
  canceled.abort();
  await assert.rejects(
    f.gateway.withCall((call) =>
      owner.resume(p.structuredContent.next_cursor, call, canceled.signal),
    ),
    (error) => error instanceof f.api.ApplicationFailure,
  );
  const q = await f.gateway.withCall((call) =>
    owner.resume(p.structuredContent.next_cursor, call, ready.signal),
  );
  assert.deepEqual(
    q.structuredContent.items.map((x) => x.subsession_id),
    [20],
  );
});
test("optional manifest echoes accept normalization and reject contradictory search identity", async (t) => {
  for (const params of [
    { cust_id: 8 },
    { event_types: [2] },
    { season_year: 2025 },
    { season_quarter: 3 },
    { series_id: 99 },
    { official_only: false },
    { team_id: 10 },
  ]) {
    const f = await fixture(t, { params });
    failure(
      await f.call("search_driver_races", {
        ...initial,
        series_id: 3,
        official_only: true,
      }),
      "DATA_RESOLUTION_FAILED",
    );
    assert.equal(f.requests.length, 1);
  }
  const good = await fixture(t, {
    params: {
      cust_id: "7",
      team_id: "0",
      event_types: [5],
      season_year: "2026",
      season_quarter: 4,
      official_only: "1",
      series_id: 3,
    },
  });
  assert.equal(
    success(
      await good.call("search_driver_races", {
        ...initial,
        series_id: 3,
        official_only: true,
      }),
    ).complete,
    true,
  );
  const neutral = await fixture(t, { params: { team_id: 0 } });
  assert.equal(
    success(await neutral.call("search_driver_races", initial)).complete,
    true,
  );
  const dates = await fixture(t, {
    params: {
      start_range_begin: "2026-10-01T00:00:00.000Z",
      start_range_end: "2026-10-02T00:00:00Z",
    },
  });
  assert.equal(
    success(
      await dates.call("search_driver_races", {
        cust_id: 7,
        range: {
          start: "2026-10-01T00:00:00Z",
          start_end: "2026-10-02T00:00:00Z",
        },
      }),
    ).complete,
    true,
  );
  const bad = await fixture(t, {
    params: { start_range_end: "2026-10-03T00:00:00Z" },
  });
  failure(
    await bad.call("search_driver_races", {
      cust_id: 7,
      range: {
        start: "2026-10-01T00:00:00Z",
        start_end: "2026-10-02T00:00:00Z",
      },
    }),
    "DATA_RESOLUTION_FAILED",
  );
});
