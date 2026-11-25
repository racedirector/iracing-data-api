const assert = require("node:assert/strict");
const test = require("node:test");

const day = 24 * 60 * 60 * 1000;
const now = Date.parse("2026-11-17T12:00:00Z");
const iso = (timestamp) => new Date(timestamp).toISOString();
const ranges = [
  ["start_range_begin", "start_range_end"],
  ["finish_range_begin", "finish_range_end"],
];

// Upstream hosted search requires one of cust_id, team_id, host_cust_id or
// session_name, so hosted fixtures need a selector to isolate date behavior.
const scope = (source, criteria) =>
  source === "hosted"
    ? { source, cust_id: 1, ...criteria }
    : { source, ...criteria };

test("each explicit search range permits 90 days exactly and rejects 90 days plus one millisecond", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const { SearchInput } = await import("../dist/index.js");
  const historical = Date.parse("2019-01-01T00:00:00Z");
  for (const source of ["series", "hosted"]) {
    for (const [begin, end] of ranges) {
      const input = scope(source, {
        [begin]: iso(historical),
        [end]: iso(historical + 90 * day),
      });
      assert.equal(SearchInput.safeParse(input).success, true);
      const tooLong = SearchInput.safeParse({
        ...input,
        [end]: iso(historical + 90 * day + 1),
      });
      assert.equal(tooLong.success, false);
      assert.ok(
        tooLong.error.issues.some(
          (issue) => issue.path[0] === end && issue.message.includes("90 days"),
        ),
      );
      for (const timestamp of [historical, historical - 1]) {
        const reversed = SearchInput.safeParse({
          ...input,
          [end]: iso(timestamp),
        });
        assert.equal(reversed.success, false);
        assert.ok(reversed.error.issues.some((issue) => issue.path[0] === end));
      }
      const noBegin = SearchInput.safeParse(
        scope(source, { [end]: iso(historical + day) }),
      );
      assert.equal(noBegin.success, false);
      assert.ok(noBegin.error.issues.some((issue) => issue.path[0] === end));
    }
  }
});

test("omitted ends require begins less than 90 days old and not in the future", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const { SearchInput } = await import("../dist/index.js");
  for (const source of ["series", "hosted"]) {
    for (const [begin, end] of ranges) {
      assert.equal(
        SearchInput.safeParse(
          scope(source, { [begin]: iso(now - 90 * day + 1) }),
        ).success,
        true,
      );
      assert.equal(
        SearchInput.safeParse(scope(source, { [begin]: iso(now - day) }))
          .success,
        true,
      );
      for (const timestamp of [
        now - 90 * day,
        now - 90 * day - 1,
        Date.parse("2019-01-01T00:00:00Z"),
      ]) {
        const invalid = SearchInput.safeParse(
          scope(source, { [begin]: iso(timestamp) }),
        );
        assert.equal(invalid.success, false);
        assert.ok(invalid.error.issues.some((issue) => issue.path[0] === end));
      }
      const future = SearchInput.safeParse(
        scope(source, { [begin]: iso(now + 1) }),
      );
      assert.equal(future.success, false);
      assert.ok(future.error.issues.some((issue) => issue.path[0] === begin));
    }
  }
});

test("a season or a valid companion range cannot bypass an overlong date filter", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const { SearchInput } = await import("../dist/index.js");
  const season = { source: "series", season_year: 2019, season_quarter: 1 };
  assert.equal(SearchInput.safeParse(season).success, true);
  assert.equal(
    SearchInput.safeParse({
      ...season,
      start_range_begin: "2019-01-01T00:00:00Z",
      start_range_end: "2019-01-02T00:00:00Z",
    }).success,
    true,
  );
  assert.equal(
    SearchInput.safeParse({
      ...season,
      start_range_begin: "2019-01-01T00:00:00Z",
      start_range_end: iso(now),
    }).success,
    false,
  );
  for (const [begin, end] of ranges) {
    const other = begin.startsWith("start") ? ranges[1] : ranges[0];
    const result = SearchInput.safeParse({
      source: "series",
      series_id: 491,
      [begin]: "2019-01-01T00:00:00Z",
      [end]: iso(now),
      [other[0]]: iso(now - day),
      [other[1]]: iso(now),
    });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some((issue) => issue.path[0] === end));
  }
});
