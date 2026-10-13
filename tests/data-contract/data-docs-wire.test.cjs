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
  if (parsed.pathname === "/data/member/get") {
    assert.deepEqual(parsed.searchParams.getAll("cust_ids"), ["2,3,2"]);
    assert.deepEqual(parsed.searchParams.getAll("include_licenses"), ["false"]);
  }
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
  await new fetchClient.MemberApi(configuration).getMember({
    cust_ids: ["2", "3", "2"],
    include_licenses: false,
  });
  assert.equal(urls.length, 6);
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
  await new axiosClient.MemberApi(configuration, undefined, instance).getMember(
    { cust_ids: ["2", "3", "2"], include_licenses: false },
  );
  assert.equal(urls.length, 6);
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

test("generated Fetch returns direct search-series manifests without losing chunk data", async () => {
  for (const [names, rows, success] of [
    [[], 0, true],
    [["chunk-0.json"], 3, true],
    [["chunk-0.json", "chunk-1.json"], 750, true],
    [[], 0, false],
  ]) {
    const manifest = {
      type: "search_series_results",
      data: {
        success,
        chunk_info: {
          chunk_size: 500,
          num_chunks: names.length,
          rows,
          base_download_url: "https://example.com/results/",
          chunk_file_names: names,
        },
        params: {
          cust_id: 7,
          category_ids: [1, 2],
          nested: { retained: true },
        },
      },
    };
    let calls = 0;
    const api = new fetchClient.ResultsApi(
      new fetchClient.Configuration({
        accessToken: async () => "synthetic",
        fetchApi: async (url, options) => {
          calls++;
          const parsed = new URL(url);
          assert.equal(parsed.pathname, "/data/results/search_series");
          assert.equal(parsed.searchParams.get("cust_id"), "7");
          assert.equal(options.headers.Authorization, "Bearer synthetic");
          return Response.json(manifest);
        },
      }),
    );
    const decoded = await api.getResultsSearchSeries({ cust_id: 7 });
    assert.equal(decoded.type, "search_series_results");
    assert.equal(decoded.data.success, success);
    assert.deepEqual(decoded.data.chunkInfo, {
      chunkSize: 500,
      numChunks: names.length,
      rows,
      baseDownloadUrl: manifest.data.chunk_info.base_download_url,
      chunkFileNames: names,
    });
    assert.deepEqual(decoded.data.params, manifest.data.params);
    assert.deepEqual(
      fetchClient.ResultsSearchSeriesResponseToJSON(decoded),
      manifest,
    );
    assert.equal(calls, 1);
  }
});

test("generated Axios exposes the direct manifest while sibling results keep link envelopes", async () => {
  const manifest = {
    type: "search_series_results",
    data: {
      success: true,
      chunk_info: {
        chunk_size: 500,
        num_chunks: 1,
        rows: 1,
        base_download_url: "https://example.com/results/",
        chunk_file_names: ["chunk-0.json"],
      },
      params: { cust_id: 7 },
    },
  };
  const instance = axios.create({
    adapter: async (config) => {
      const parsed = new URL(instance.getUri(config));
      assert.equal(parsed.pathname, "/data/results/search_series");
      return {
        data: manifest,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    },
  });
  assert.deepEqual(
    (
      await new axiosClient.ResultsApi(
        undefined,
        undefined,
        instance,
      ).getResultsSearchSeries({ cust_id: 7 })
    ).data,
    manifest,
  );
  const api = new fetchClient.ResultsApi(
    new fetchClient.Configuration({
      fetchApi: async () => Response.json(envelope),
    }),
  );
  assert.equal(
    (await api.getResults({ subsession_id: 1 })).link,
    envelope.link,
  );
});
