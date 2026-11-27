const assert = require("node:assert/strict");
const test = require("node:test");

async function fixture({
  rows = 1,
  numChunks = 1,
  downloadStatus = 200,
  names = ["chunk.json"],
  payload = [
    { subsession_id: 1, start_time: "2026-11-01T00:00:00Z", secret: "SECRET" },
  ],
} = {}) {
  const { Configuration } = await import("@iracing-data/api-client-fetch");
  const { createRaceSearchQueries } =
    await import("../dist/adapters/race-search.js");
  const calls = [];
  const configuration = new Configuration({
    accessToken: async () => "TOKEN",
    fetchApi: async (url, options) => {
      calls.push({ url: String(url), options });
      // The manifest client is authenticated. It must not fetch chunks.
      assert.equal(
        new Headers(options.headers).get("authorization"),
        "Bearer TOKEN",
      );
      return Response.json({
        type: String(url).includes("search_series")
          ? "search_series_results"
          : "search_hosted_results",
        data: {
          success: true,
          params: {},
          chunk_info: {
            rows,
            num_chunks: numChunks,
            chunk_size: 500,
            base_download_url: "https://assets.example/search/",
            chunk_file_names: names,
          },
        },
      });
    },
  });
  // A separate transport deliberately has no actor token, headers or cookies.
  const downloadFetch = async (url, options) => {
    calls.push({ url: String(url), options });
    assert.equal(options.headers, undefined);
    assert.equal(options.credentials, undefined);
    return Response.json(payload, { status: downloadStatus });
  };
  const queries = createRaceSearchQueries(configuration, downloadFetch);
  return { queries, calls };
}

const input = {
  source: "hosted",
  cust_id: 42,
  league_id: 8579,
  start_range_begin: "2026-11-01T00:00:00Z",
  start_range_end: "2026-11-15T00:00:00Z",
};
const context = () => ({ signal: new AbortController().signal });

test("hosted league filters reach upstream; chunk downloads carry no credentials", async () => {
  const { queries, calls } = await fixture();
  const result = await queries.search(input, context());
  const url = new URL(calls[0].url);
  assert.equal(url.searchParams.get("league_id"), "8579");
  assert.equal(url.searchParams.get("cust_id"), "42");
  assert.equal(
    url.searchParams.get("start_range_begin"),
    "2026-11-01T00:00:00.000Z",
  );
  assert.equal(calls[1].options.headers, undefined);
  assert.equal(calls[1].options.redirect, "error");
  assert.equal(result.query_complete, true);
  assert.equal(result.returned_count, 1);
  assert.equal(result.results[0].secret, undefined);
});

test("series search forwards explicit season, participant and event filters", async () => {
  const { queries, calls } = await fixture();
  const result = await queries.search(
    {
      source: "series",
      season_year: 2026,
      season_quarter: 4,
      cust_id: 99,
      team_id: 7,
      official_only: false,
      event_types: "2,5,2",
      category_ids: "5,6,5",
    },
    context(),
  );
  const url = new URL(calls[0].url);
  assert.ok(url.pathname.endsWith("/results/search_series"));
  assert.equal(url.searchParams.get("team_id"), "7");
  assert.equal(url.searchParams.get("official_only"), "false");
  assert.deepEqual(url.searchParams.getAll("event_types"), ["2,5,2"]);
  assert.deepEqual(url.searchParams.getAll("category_ids"), ["5,6,5"]);
  assert.equal(result.source, "series");
});

test("hosted CSV category IDs keep one ordered query value", async () => {
  const { queries, calls } = await fixture();
  await queries.search({ ...input, category_ids: "1,5,1" }, context());
  const url = new URL(calls[0].url);
  assert.deepEqual(url.searchParams.getAll("category_ids"), ["1,5,1"]);
});

test("selected chunk does not claim whole-query completeness", async () => {
  const { queries, calls } = await fixture({
    rows: 501,
    numChunks: 2,
    names: ["first.json", "second.json"],
  });
  const result = await queries.search({ ...input, chunk_index: 1 }, context());
  assert.equal(calls[1].url, "https://assets.example/search/second.json");
  assert.equal(result.total_matches, 501);
  assert.equal(result.query_complete, false);
  assert.equal(result.returned_count, 1);
});

test("empty query is complete without downloading", async () => {
  const { queries, calls } = await fixture({
    rows: 0,
    numChunks: 0,
    names: [],
  });
  const result = await queries.search(input, context());
  assert.equal(result.query_complete, true);
  assert.deepEqual(result.results, []);
  assert.equal(calls.length, 1);
});

test("search without a participant does not inject the authenticated driver", async () => {
  const { queries, calls } = await fixture();
  await queries.search(
    { source: "series", season_year: 2026, season_quarter: 4 },
    context(),
  );
  assert.equal(new URL(calls[0].url).searchParams.has("cust_id"), false);
});

test("unassigned league-season IDs are preserved in projected results", async () => {
  const { queries } = await fixture({
    payload: [
      {
        subsession_id: 1,
        start_time: "2026-11-01T00:00:00Z",
        league_season_id: 0,
      },
    ],
  });
  const result = await queries.search(input, context());
  assert.equal(result.results[0].league_season_id, 0);
});

test("pre-cancelled searches perform no HTTP requests", async () => {
  const { queries, calls } = await fixture();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(queries.search(input, { signal: controller.signal }));
  assert.equal(calls.length, 0);
});

test("rejected search input returns bounded INVALID_INPUT details before API or chunk requests", async () => {
  const { createRequestContext, errorEnvelope } =
    await import("@iracing-data/mcp");

  const windows = [
    [
      {
        start_range_begin: "2019-01-01T00:00:00Z",
        start_range_end: "2026-11-17T00:00:00Z",
      },
      "start_range_end",
      "range_too_wide",
    ],
    [
      {
        finish_range_begin: "2019-01-01T00:00:00Z",
        finish_range_end: "2026-11-17T00:00:00Z",
      },
      "finish_range_end",
      "range_too_wide",
    ],
    [
      { start_range_begin: "2019-01-01T00:00:00Z" },
      "start_range_end",
      "missing_range",
    ],
  ];

  for (const [window, field, reason] of windows) {
    for (const base of [
      { source: "hosted", cust_id: 42 },
      { source: "series", season_year: 2026, season_quarter: 4 },
    ]) {
      const { queries, calls } = await fixture();
      await assert.rejects(
        queries.search({ ...base, ...window }, context()),
        (error) => {
          assert.equal(error.name, "ApplicationFailure");
          const envelope = errorEnvelope(error, createRequestContext()).error;
          assert.equal(envelope.code, "INVALID_INPUT");
          assert.deepEqual(envelope.details, [{ field, reason }]);
          return true;
        },
      );
      assert.equal(calls.length, 0);
    }
  }
});

test("reject mismatched rows and unsafe chunk URLs", async () => {
  for (const options of [
    { rows: 2 },
    { names: ["https://other.example/chunk"] },
    { names: ["../escape"] },
  ]) {
    const { queries } = await fixture(options);
    await assert.rejects(queries.search(input, context()), /safely resolved/);
  }
});

test("search input rejects unsupported filters and invalid scopes", async () => {
  const { SearchInput } = await import("@iracing-data/mcp");
  for (const value of [
    { source: "hosted" },
    { ...input, series_id: 1 },
    { ...input, source: "series", league_id: 1 },
    { source: "series", season_year: 2026 },
    { ...input, start_range_end: "2026-10-01T00:00:00Z" },
    { ...input, token: "SECRET" },
  ])
    assert.equal(SearchInput.safeParse(value).success, false);
});

test("signed chunk rejections preserve safe error categories", async () => {
  const { createRequestContext, errorEnvelope } =
    await import("@iracing-data/mcp");
  for (const [status, code, reason] of [
    [403, "DATA_RESOLUTION_FAILED", "link_rejected"],
    [404, "DATA_RESOLUTION_FAILED", "link_rejected"],
    [429, "RATE_LIMITED", undefined],
    [503, "UPSTREAM_UNAVAILABLE", undefined],
  ]) {
    const { queries } = await fixture({ downloadStatus: status });
    await assert.rejects(queries.search(input, context()), (error) => {
      const result = errorEnvelope(error, createRequestContext()).error;
      assert.equal(result.code, code);
      assert.equal(result.reason, reason);
      assert.doesNotMatch(JSON.stringify(result), /SECRET|signature/);
      return true;
    });
  }
});
