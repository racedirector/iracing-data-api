const assert = require("node:assert/strict");
const test = require("node:test");

const day = 24 * 60 * 60 * 1000;
const now = Date.parse("2026-11-17T12:00:00Z");
const iso = (timestamp) => new Date(timestamp).toISOString();
const recent = iso(now - day);

async function fixture(t, { forbidCapability = false } = {}) {
  const { createIracingMcpServer } = await import("../dist/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");

  const calls = { capability: 0, search: 0 };

  const services = {
    getDriverQueries: () => ({
      getCurrent: async () => ({ cust_id: 1, display_name: "Fixture" }),
    }),
    getRecentRaceQueries: () => ({
      getRecent: async () => ({ cust_id: 1, races: [] }),
    }),
    getRaceSearchQueries: () => {
      calls.capability++;

      if (forbidCapability) {
        throw new Error("CAPABILITY_INVOKED");
      }

      return {
        search: async (input) => {
          calls.search++;
          return {
            source: input.source,
            criteria: {},
            total_matches: 0,
            total_chunks: 0,
            chunk_index: input.chunk_index,
            returned_count: 0,
            query_complete: true,
            results: [],
            position_basis: "upstream",
          };
        },
      };
    },
  };

  const server = createIracingMcpServer({
    serverInfo: { name: "search-diagnostics-fixture", version: "1" },
    services,
  });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({
    name: "search-diagnostics-client",
    version: "1",
  });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  return {
    calls,
    call: (args) =>
      client.callTool({ name: "search_race_results", arguments: args }),
  };
}

function details(result) {
  return result.structuredContent.error.details ?? [];
}

function assertDetail(result, field, reason) {
  assert.ok(
    details(result).some(
      (detail) => detail.field === field && detail.reason === reason,
    ),
    `missing {field:${field}, reason:${reason}} in ${JSON.stringify(details(result))}`,
  );
}

test("source-incompatible filters report field-level diagnostics before any capability use", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });

  const cases = [
    ["series", "track_id", 101],
    ["series", "car_id", 7],
    ["series", "session_name", "Bristol"],
    ["series", "host_cust_id", 12],
    ["series", "league_id", 8579],
    ["series", "league_season_id", 42],
    ["hosted", "season_year", 2024],
    ["hosted", "season_quarter", 2],
    ["hosted", "series_id", 491],
    ["hosted", "race_week_num", 3],
    ["hosted", "official_only", true],
    ["hosted", "event_types", "5"],
  ];

  for (const [source, key, value] of cases) {
    const scope =
      source === "series"
        ? { source, start_range_begin: recent }
        : { source, cust_id: 1, start_range_begin: recent };
    const result = await f.call({ ...scope, [key]: value });

    assert.equal(result.isError, true);
    assert.equal(result.structuredContent.error.code, "INVALID_INPUT");
    assertDetail(result, key, "unsupported_for_source");
    assert.deepEqual(
      JSON.parse(result.content[0].text),
      result.structuredContent,
    );
  }

  assert.equal(f.calls.capability, 0);
  assert.equal(f.calls.search, 0);
});

test("series track_id is rejected with the documented repro details", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });
  const result = await f.call({
    source: "series",
    track_id: 101,
    start_range_begin: recent,
  });

  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, "INVALID_INPUT");
  assert.deepEqual(details(result), [
    { field: "track_id", reason: "unsupported_for_source" },
  ]);
  assert.equal(
    result.structuredContent.error.message,
    "Correct the tool input and try again.",
  );
  assert.equal(f.calls.capability, 0);
  assert.equal(f.calls.search, 0);
});

test("hosted search requires one documented participant or host selector", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });
  const result = await f.call({
    source: "hosted",
    start_range_begin: recent,
  });

  assert.equal(result.structuredContent.error.code, "INVALID_INPUT");
  for (const field of ["cust_id", "team_id", "host_cust_id", "session_name"]) {
    assertDetail(result, field, "required_for_source");
  }
  assert.equal(f.calls.capability, 0);
});

test("missing scope and unpaired seasons report deterministic reasons", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });

  const missing = await f.call({ source: "series" });
  assert.deepEqual(details(missing), [
    { field: "start_range_begin", reason: "missing_range" },
  ]);

  const unpaired = await f.call({ source: "series", season_year: 2024 });
  assert.deepEqual(details(unpaired), [
    { field: "season_year", reason: "required_together" },
  ]);

  assert.equal(f.calls.capability, 0);
});

test("time window failures report their specific reasons", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });
  const historical = Date.parse("2019-01-01T00:00:00Z");

  const tooWide = await f.call({
    source: "series",
    start_range_begin: iso(historical),
    start_range_end: iso(historical + 90 * day + 1),
  });
  assertDetail(tooWide, "start_range_end", "range_too_wide");

  const reversed = await f.call({
    source: "series",
    finish_range_begin: iso(now - day),
    finish_range_end: iso(now - day),
  });
  assertDetail(reversed, "finish_range_end", "range_end_before_begin");

  const future = await f.call({
    source: "series",
    start_range_begin: iso(now + day),
  });
  assertDetail(future, "start_range_begin", "begin_in_future");

  const oldOpen = await f.call({
    source: "series",
    finish_range_begin: iso(now - 90 * day),
  });
  assertDetail(oldOpen, "finish_range_end", "missing_range");

  assert.equal(f.calls.capability, 0);
});

test("unknown top-level keys are reported as unknown_field", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });
  const result = await f.call({
    source: "series",
    season_year: 2024,
    season_quarter: 2,
    bogus_filter: 1,
  });

  assert.deepEqual(details(result), [
    { field: "bogus_filter", reason: "unknown_field" },
  ]);
  assert.equal(f.calls.capability, 0);
});

test("supported hosted and series filters remain accepted", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });

  const hosted = await fixture(t);
  const hostedResult = await hosted.call({
    source: "hosted",
    cust_id: 1,
    track_id: 101,
    session_name: "Bristol",
    start_range_begin: recent,
  });
  assert.ok(!hostedResult.isError);
  assert.equal(hostedResult.structuredContent.source, "hosted");
  assert.equal(hosted.calls.capability, 1);
  assert.equal(hosted.calls.search, 1);

  const series = await fixture(t);
  const seriesResult = await series.call({
    source: "series",
    season_year: 2024,
    season_quarter: 2,
    event_types: "5",
    official_only: true,
    series_id: 491,
    race_week_num: 3,
  });
  assert.equal(seriesResult.isError, undefined);
  assert.equal(seriesResult.structuredContent.source, "series");
  assert.equal(series.calls.capability, 1);
  assert.equal(series.calls.search, 1);
});

test("more than eight issues stay bounded and deterministically ordered", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });
  const arguments_ = {
    source: "series",
    host_cust_id: 12,
    session_name: "Bristol",
    league_id: 8579,
    league_season_id: 42,
    car_id: 7,
    track_id: 101,
    unknown_a: 1,
    unknown_b: 1,
    unknown_c: 1,
    unknown_d: 1,
  };

  const first = await f.call(arguments_);
  const second = await f.call(arguments_);
  const firstDetails = details(first);

  assert.equal(firstDetails.length, 8);
  assert.deepEqual(firstDetails, details(second));

  const ordered = [...firstDetails].sort((left, right) => {
    if (left.field !== right.field) {
      return left.field < right.field ? -1 : 1;
    }

    if (left.reason !== right.reason) {
      return left.reason < right.reason ? -1 : 1;
    }

    return 0;
  });
  assert.deepEqual(firstDetails, ordered);
  assert.equal(f.calls.capability, 0);
});

test("rejected values and raw schema text never cross the error boundary", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const f = await fixture(t, { forbidCapability: true });

  for (const arguments_ of [
    {
      source: "series",
      season_year: 2024,
      season_quarter: "LEAK_CANARY",
      LEAK_CANARY: "LEAK_CANARY",
    },
    { source: "LEAK_CANARY" },
    {
      source: "series",
      start_range_begin: "LEAK_CANARY",
    },
  ]) {
    const result = await f.call(arguments_);
    assert.equal(result.structuredContent.error.code, "INVALID_INPUT");
    assert.doesNotMatch(JSON.stringify(result), /LEAK_CANARY/);
    assert.doesNotMatch(
      JSON.stringify(result),
      /Invalid input|Invalid option|Zod|received string/,
    );
  }

  assert.equal(f.calls.capability, 0);
});

test("the error envelope rejects details outside INVALID_INPUT and unknown detail shapes", async () => {
  const { randomUUID } = require("node:crypto");
  const { ErrorEnvelopeSchema, errorPolicy } = await import("../dist/index.js");
  const envelope = (code, extra = {}) => ({
    error: {
      code,
      message: errorPolicy[code][0],
      retryable: code === "RATE_LIMITED",
      request_id: randomUUID(),
      ...extra,
    },
  });
  const detail = { field: "track_id", reason: "unsupported_for_source" };

  assert.equal(
    ErrorEnvelopeSchema.safeParse(
      envelope("INVALID_INPUT", { details: [detail] }),
    ).success,
    true,
  );

  for (const code of ["RATE_LIMITED", "DATA_RESOLUTION_FAILED", "NOT_FOUND"]) {
    assert.equal(
      ErrorEnvelopeSchema.safeParse(envelope(code, { details: [detail] }))
        .success,
      false,
    );
  }

  for (const invalid of [
    { field: "track_id", reason: "secret_reason" },
    { field: "Track ID", reason: "invalid_value" },
    { field: "track-id", reason: "invalid_value" },
    { field: "a".repeat(65), reason: "invalid_value" },
  ]) {
    assert.equal(
      ErrorEnvelopeSchema.safeParse(
        envelope("INVALID_INPUT", { details: [invalid] }),
      ).success,
      false,
    );
  }

  assert.equal(
    ErrorEnvelopeSchema.safeParse(
      envelope("INVALID_INPUT", {
        details: [
          { field: "track_id", reason: "invalid_value" },
          { field: "car_id", reason: "invalid_value" },
        ],
      }),
    ).success,
    false,
  );

  assert.equal(
    ErrorEnvelopeSchema.safeParse(
      envelope("INVALID_INPUT", {
        details: Array.from({ length: 9 }, (_, index) => ({
          field: `field_${index}`,
          reason: "invalid_value",
        })),
      }),
    ).success,
    false,
  );
});
