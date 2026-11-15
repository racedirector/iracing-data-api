const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

function docsFor(routes) {
  const docs = {};
  for (const route of routes) {
    const [, , service, ...rest] = route.split("/");
    const method = rest.join("/").replace("{category}", "sports_car");
    docs[service] ??= {};
    docs[service][method] = { link: "https://example.invalid/doc" };
  }
  return docs;
}

test("live shape runner requires explicit opt-in", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "live/run-all.mjs")],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, "NOT_RUN");
});

test("every generated runtime route binds a canonical response schema", async () => {
  const { responseSchemaFor, runtimeRoutes } =
    await import("./live/contract-lookup.mjs");
  const routes = runtimeRoutes();
  assert.ok(routes.length > 0);
  const unbound = routes.filter((route) => !responseSchemaFor(route));
  assert.deepEqual(unbound, []);
});

test("unchanged routes PASS against contract-bound Zod schemas", async () => {
  const { runContractShapes } =
    await import("./live/all-endpoints-contract.mjs");
  const { runtimeRoutes } = await import("./live/contract-lookup.mjs");
  const routes = ["/data/constants/categories", "/data/member/awards"];
  const result = await runContractShapes({
    routes,
    docs: docsFor(runtimeRoutes()),
    accessToken: "synthetic-token",
    delayMs: 0,
    transport: async (input) => {
      const { pathname } = new URL(String(input));
      if (pathname === "/data/constants/categories")
        return Response.json([{ label: "Example", value: 1 }]);
      if (pathname === "/data/member/awards")
        return Response.json({
          type: "member_awards",
          data: { success: true, cust_id: 1, award_count: 1 },
          data_url: "https://cache.example/private",
        });
      assert.fail(`unexpected route ${pathname}`);
    },
  });
  assert.equal(result.coverage.ok, true);
  assert.equal(result.summary.pass, 2);
  assert.equal(result.status, "Compatible");
});

test("shape rejection reports sanitized field paths", async () => {
  const { runContractShapes } =
    await import("./live/all-endpoints-contract.mjs");
  const { runtimeRoutes } = await import("./live/contract-lookup.mjs");
  const result = await runContractShapes({
    routes: ["/data/league/get"],
    inputs: { league_id: 1 },
    docs: docsFor(runtimeRoutes()),
    accessToken: "synthetic-token",
    delayMs: 0,
    transport: async () => Response.json({ private_field: "private-secret" }),
  });
  assert.equal(result.summary.mismatch, 1);
  assert.match(result.results[0].schema, /APIResponseSchema$/);
  assert.deepEqual(result.results[0].fields.map((field) => field.path).sort(), [
    "expires",
    "link",
  ]);
  assert.doesNotMatch(JSON.stringify(result), /private-secret|https:/);
});

test("unsuccessful manifests are mismatches even when the shape parses", async () => {
  const { runContractShapes } =
    await import("./live/all-endpoints-contract.mjs");
  const { runtimeRoutes } = await import("./live/contract-lookup.mjs");
  const result = await runContractShapes({
    routes: ["/data/results/search_hosted"],
    docs: docsFor(runtimeRoutes()),
    accessToken: "synthetic-token",
    delayMs: 0,
    transport: async () =>
      Response.json({
        type: "search_hosted_results",
        data: {
          success: false,
          chunk_info: {
            chunk_size: 500,
            num_chunks: 0,
            rows: 0,
            base_download_url: "https://cache.example/chunks/",
            chunk_file_names: [],
          },
          params: {},
        },
      }),
  });
  assert.equal(result.summary.mismatch, 1);
  assert.equal(result.results[0].status, "CONTRACT_MISMATCH");
});

test("missing required inputs are NOT_RUN without a request", async () => {
  const { runContractShapes } =
    await import("./live/all-endpoints-contract.mjs");
  const { runtimeRoutes } = await import("./live/contract-lookup.mjs");
  let calls = 0;
  const result = await runContractShapes({
    routes: ["/data/league/get"],
    docs: docsFor(runtimeRoutes()),
    accessToken: "synthetic-token",
    delayMs: 0,
    transport: async () => {
      calls++;
      return Response.json({});
    },
  });
  assert.equal(calls, 0);
  assert.equal(result.results[0].status, "NOT_RUN");
  assert.match(result.results[0].reason, /league_id/);
});

test("authentication preflight failure stops the batch", async () => {
  const { runContractShapes } =
    await import("./live/all-endpoints-contract.mjs");
  const result = await runContractShapes({
    accessToken: "synthetic-token",
    delayMs: 0,
    transport: async () =>
      Response.json({ error: "unauthorized" }, { status: 401 }),
  });
  assert.equal(result.status, "Unable to verify part of the contract");
  assert.equal(result.results.length, 0);
  assert.doesNotMatch(JSON.stringify(result), /synthetic-token/);
});

test("documentation coverage gaps are reported, not counted as passes", async () => {
  const { runContractShapes } =
    await import("./live/all-endpoints-contract.mjs");
  const { runtimeRoutes } = await import("./live/contract-lookup.mjs");
  const docs = docsFor(runtimeRoutes());
  delete docs.carclass;
  const result = await runContractShapes({
    routes: ["/data/constants/categories"],
    docs,
    accessToken: "synthetic-token",
    delayMs: 0,
    transport: async () => Response.json([]),
  });
  assert.equal(result.coverage.ok, false);
  assert.deepEqual(result.coverage.missing, ["/data/carclass/get"]);
  assert.equal(result.status, "Unable to verify part of the contract");
});
