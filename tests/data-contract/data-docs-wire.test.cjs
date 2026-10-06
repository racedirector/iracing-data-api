const assert = require("node:assert/strict");
const { test } = require("node:test");
const fetchClient = require("../../packages/api/client/fetch/dist");
const axiosClient = require("../../packages/api/client/axios/dist");
const axios =
  require("../../packages/api/client/axios/node_modules/axios").default;
const docs = {
  car: {
    assets: {
      link: "https://members-ng.iracing.com/data/car/assets",
      note: "text note",
    },
    get: {
      link: "https://members-ng.iracing.com/data/car/get",
      note: ["retained note"],
    },
  },
};
const constants = [{ value: 1, label: "Example", extra: { nested: true } }];
const envelope = {
  link: "https://example.com/cache.json",
  expires: "2026-10-05T01:00:00Z",
};

function checkUrl(url) {
  const parsed = new URL(url);
  if (parsed.pathname.includes("spectator")) {
    assert.deepEqual(parsed.searchParams.getAll("event_types"), ["2,3"]);
    assert.deepEqual(parsed.searchParams.getAll("season_ids"), ["513,937"]);
  }
  if (parsed.pathname.includes("season_tt"))
    assert.equal(parsed.pathname, "/data/stats/season_tt_results");
  if (parsed.pathname.includes("member_recap"))
    assert.equal(parsed.searchParams.get("year"), "2026");
  return parsed;
}
function body(url) {
  if (url.pathname === "/data/doc") return docs;
  if (url.pathname.includes("/constants/")) return constants;
  return envelope;
}
const filters = { event_types: [2, 3], season_ids: [513, 937] };
const tt = { season_id: 1, car_class_id: 2, race_week_num: 0 };

test("Fetch consumer preserves docs notes, parses constants arrays and uses corrected query/path contracts", async () => {
  const urls = [];
  const configuration = new fetchClient.Configuration({
    accessToken: "synthetic",
    fetchApi: async (url, options) => {
      const parsed = checkUrl(url);
      urls.push(parsed.pathname);
      assert.equal(options.headers.Authorization, "Bearer synthetic");
      return Response.json(body(parsed));
    },
  });
  assert.deepEqual(await new fetchClient.DocApi(configuration).getDocs(), docs);
  assert.deepEqual(
    await new fetchClient.ConstantsApi(configuration).getConstantsCategories(),
    constants,
  );
  await new fetchClient.SeasonApi(
    configuration,
  ).getSeasonSpectatorSubsessionIdsDetail(filters);
  await new fetchClient.StatsApi(configuration).getStatsSeasonTimeTrialResults(
    tt,
  );
  await new fetchClient.StatsApi(configuration).getStatsMemberRecap({
    year: 2026,
  });
  assert.equal(urls.length, 5);
});
test("Axios consumer returns constants arrays and serializes CSV filters without repeated keys", async () => {
  const urls = [];
  const instance = axios.create({
    adapter: async (config) => {
      const parsed = checkUrl(instance.getUri(config));
      urls.push(parsed.pathname);
      return {
        data: body(parsed),
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    },
  });
  const configuration = new axiosClient.Configuration({
    accessToken: "synthetic",
  });
  assert.deepEqual(
    (await new axiosClient.DocApi(configuration, undefined, instance).getDocs())
      .data,
    docs,
  );
  assert.deepEqual(
    (
      await new axiosClient.ConstantsApi(
        configuration,
        undefined,
        instance,
      ).getConstantsCategories()
    ).data,
    constants,
  );
  await new axiosClient.SeasonApi(
    configuration,
    undefined,
    instance,
  ).getSeasonSpectatorSubsessionIdsDetail(filters);
  await new axiosClient.StatsApi(
    configuration,
    undefined,
    instance,
  ).getStatsSeasonTimeTrialResults(tt);
  await new axiosClient.StatsApi(
    configuration,
    undefined,
    instance,
  ).getStatsMemberRecap({ year: 2026 });
  assert.equal(urls.length, 5);
});

test("schema array inputs are assignable to both generated clients", () => {
  const ts = require("typescript");
  const program = ts.createProgram(
    [require("node:path").join(__dirname, "spectator-inputs.ts")],
    {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
  );
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")),
    [],
  );
});
