const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

test("live runner requires explicit opt-in without accessing credentials or network", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "live/run.mjs")],
    {
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, "NOT_RUN");
});

test("invalid live input is blocked before effects", async () => {
  const { runHostedContract } = await import("./live/hosted-contract.mjs");
  const result = await runHostedContract({
    query: { track_id: "invalid" },
    async fetch() {
      assert.fail("must not fetch");
    },
  });
  assert.equal(result.status, "BLOCKED");
});

test("null operator query reports BLOCKED rather than silently succeeding", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "live/run.mjs"), "--run"],
    {
      encoding: "utf8",
      env: { ...process.env, IRACING_LIVE_HOSTED_QUERY: "null" },
    },
  );
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, "BLOCKED");
});

const query = {
  start_range_begin: "2023-10-08T00:00:00Z",
  start_range_end: "2023-10-11T00:00:00Z",
  session_name: "FTR",
  track_id: 192,
};
const manifest = {
  type: "search_hosted_results",
  data: {
    success: true,
    chunk_info: {
      chunk_size: 500,
      num_chunks: 1,
      rows: 1,
      base_download_url: "https://cache.example/private",
      chunk_file_names: ["private.json"],
    },
    params: query,
  },
};

for (const scenario of [
  "pass",
  "shape",
  "unsuccessful",
  "auth",
  "rate-limit",
  "network",
  "content-type",
  "decode",
]) {
  test(`scoped live contract runner classifies ${scenario} offline`, async () => {
    const { runHostedContract } = await import("./live/hosted-contract.mjs");
    let calls = 0;
    const result = await runHostedContract({
      query,
      accessToken: "synthetic-token",
      async fetch() {
        calls++;
        if (scenario === "network") throw new Error("private-secret");
        if (scenario === "auth") return Response.json({}, { status: 401 });
        if (scenario === "rate-limit")
          return Response.json({}, { status: 429 });
        if (calls === 1)
          return Response.json({
            results: {
              search_hosted: {
                link: "https://members-ng.iracing.com/data/results/search_hosted",
              },
            },
          });
        if (scenario === "content-type") return new Response("private-secret");
        if (scenario === "decode")
          return new Response("private-secret", {
            headers: { "content-type": "application/json" },
          });
        if (scenario === "shape")
          return Response.json({ private_field: "private-secret" });
        if (scenario === "unsuccessful")
          return Response.json({
            ...manifest,
            data: { ...manifest.data, success: false },
          });
        return Response.json(manifest);
      },
    });
    let expected = "BLOCKED";
    if (scenario === "pass") expected = "PASS";
    if (["shape", "unsuccessful"].includes(scenario))
      expected = "CONTRACT_MISMATCH";
    assert.equal(result.status, expected);
    assert.equal(
      calls,
      ["auth", "rate-limit", "network"].includes(scenario) ? 1 : 2,
    );
    assert.doesNotMatch(
      JSON.stringify(result),
      /private-secret|private\.json|https:|synthetic-token/,
    );
  });
}
