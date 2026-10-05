const assert = require("node:assert/strict");
const test = require("node:test");
const { createRouter } = require("../dist");

test("router validates wire queries and calls corrected upstream paths offline", async (t) => {
  const saved = global.fetch;
  t.after(() => {
    global.fetch = saved;
  });
  const urls = [];
  global.fetch = async (url, init) => {
    assert.equal(
      new Headers(init.headers).get("authorization"),
      "Bearer synthetic",
    );
    urls.push(new URL(url));
    return Response.json({
      link: "https://example.com/cache.json",
      expires: "2026-10-05T01:00:00Z",
    });
  };
  const router = createRouter();
  const headers = { "X-IRACING-ACCESS-TOKEN": "synthetic" };
  for (const path of [
    "/data/stats/season_tt_results?season_id=1&car_class_id=2&race_week_num=0",
    "/data/stats/member_recap?year=2026",
    "/data/season/spectator_subsessionids_detail?event_types=2,3&season_ids=513,937",
    "/data/league/directory?restrict_to_member=false",
  ]) {
    const response = await router.handler(
      new Request(`http://localhost${path}`, { headers }),
    );
    assert.equal(response.status, 200, await response.text());
  }
  assert.equal(urls[0].pathname, "/data/stats/season_tt_results");
  assert.equal(urls[1].searchParams.get("year"), "2026");
  assert.deepEqual(urls[2].searchParams.getAll("event_types"), ["2,3"]);
  assert.equal(urls[3].searchParams.get("restrict_to_member"), "false");
  for (const query of [
    "event_types=1",
    "event_types=2,,5",
    "event_types=",
    "season_ids=invalid",
  ]) {
    const response = await router.handler(
      new Request(
        `http://localhost/data/season/spectator_subsessionids_detail?${query}`,
        { headers },
      ),
    );
    assert.equal(response.status, 400);
  }
  const invalid = await router.handler(
    new Request(
      "http://localhost/data/league/directory?restrict_to_member=invalid",
      { headers },
    ),
  );
  assert.equal(invalid.status, 400);
  assert.equal(urls.length, 4);
});
