const assert = require("node:assert/strict");
const test = require("node:test");

const expired = (error) =>
  error.message.includes("cursor") ||
  error.constructor.name === "ApplicationFailure";

test("collection and search continuations share token capacity and expiry reclamation", async () => {
  const { Configuration } = require("@iracing-data/api-client-fetch");
  const { CollectionCursors } = await import("../dist/tools/collections.js");
  const { SearchCursors } =
    await import("../dist/tools/search-driver-races/cursor.js");
  const { RetentionBudget } = await import("../dist/retention.js");
  let now = 1000;
  const budget = new RetentionBudget();
  const collections = new CollectionCursors(() => now, budget);
  const search = new SearchCursors(budget, () => now);
  const access = {
    continuationScope: {},
    configuration: new Configuration({
      fetchApi: async (target) =>
        new URL(target).hostname === "members-ng.iracing.com"
          ? Response.json({
              type: "search_series_results",
              data: {
                success: true,
                params: {},
                chunk_info: {
                  chunk_size: 2,
                  rows: 2,
                  num_chunks: 1,
                  base_download_url: "https://cache.example.test/",
                  chunk_file_names: ["chunk"],
                },
              },
            })
          : Response.json(
              [1, 2].map((id) => ({
                subsession_id: id,
                start_time: "2026-10-01T00:00:00Z",
                event_type: 5,
                track: { track_id: 30 },
              })),
            ),
    }),
  };
  for (let i = 0; i < 32; i++)
    collections.start({
      tool: "test",
      filters: {},
      items: [{ id: 1 }, { id: 2 }],
      limit: 1,
      expiresAt: now + 1000,
    });
  const filters = {
    cust_id: 7,
    range: { season_year: 2026, season_quarter: 4 },
    limit: 1,
  };
  await assert.rejects(
    search.start(filters, access, new AbortController().signal),
    (error) =>
      error.name === "ApplicationFailure" && error.message.includes("exceeds"),
  );
  now += 1000;
  const first = await search.start(
    filters,
    access,
    new AbortController().signal,
  );
  const next = await search.resume(
    first.structuredContent.next_cursor,
    access,
    new AbortController().signal,
  );
  assert.equal(next.structuredContent.items[0].subsession_id, 2);
  assert.deepEqual(
    await search.resume(
      first.structuredContent.next_cursor,
      access,
      new AbortController().signal,
    ),
    next,
  );
});
test("opaque collections enforce TTL, immutable input/results, scope, restart, replay and global capacity", async () => {
  const { CollectionCursors, COLLECTION_LIMITS } =
    await import("../dist/tools/collections.js");
  let now = 1000;
  const owner = new CollectionCursors(() => now),
    items = Array.from({ length: 4 }, (_, i) => ({ id: i + 1 }));
  const start = (extra = {}) =>
    owner.start({
      tool: "test",
      filters: { q: "a" },
      items,
      limit: 1,
      expiresAt: now + 900000,
      ...extra,
    });
  const p = start();
  p.structuredContent.items[0].id = 99;
  items[1].id = 88;
  const q = owner.resume("test", p.structuredContent.next_cursor);
  assert.equal(q.structuredContent.items[0].id, 2);
  q.structuredContent.items[0].id = 77;
  assert.equal(
    owner.resume("test", p.structuredContent.next_cursor).structuredContent
      .items[0].id,
    2,
  );

  assert.throws(
    () =>
      new CollectionCursors(() => now).resume(
        "test",
        p.structuredContent.next_cursor,
      ),
    expired,
  );
  assert.throws(
    () => owner.resume("other", p.structuredContent.next_cursor),
    expired,
  );
  now += 300001;
  assert.throws(
    () => owner.resume("test", p.structuredContent.next_cursor),
    expired,
  );
  const short = start({ expiresAt: now + 1000 });
  now += 1000;
  assert.throws(
    () => owner.resume("test", short.structuredContent.next_cursor),
    expired,
  );
  owner.invalidate();
  for (let i = 0; i < COLLECTION_LIMITS.cursors; i++) start();
  assert.throws(() => start());
  now += 300001;
  assert.ok(start().structuredContent.next_cursor);
});
test("retained collection bytes are bounded and expiry reclaims capacity", async () => {
  const { CollectionCursors } = await import("../dist/tools/collections.js");
  let now = 1000;
  const owner = new CollectionCursors(() => now);
  const items = [
    { id: 1 },
    ...Array.from({ length: 6 }, (_, i) => ({
      id: i + 2,
      label: "x".repeat(1024 * 1024),
    })),
  ];
  const start = () =>
    owner.start({
      tool: "test",
      filters: {},
      items,
      limit: 1,
      expiresAt: now + 1000,
    });
  for (let i = 0; i < 5; i++) start();
  assert.throws(start);
  now += 1000;
  assert.ok(start().structuredContent.next_cursor);
});
