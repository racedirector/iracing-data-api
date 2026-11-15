const assert = require("node:assert/strict");
const test = require("node:test");

test("signed-link expiry and rejection are bounded resolution failures, not cursors", async () => {
  const { readLinkedData } =
    await import("../dist/adapters/linked-response.js");
  const { errorEnvelope, createRequestContext } =
    await import("@iracing-data/mcp");
  for (const status of [403, 404, "expired"]) {
    let fetched = false;
    try {
      await readLinkedData(
        {
          link: "https://cache.example.test/data?signature=SECRET",
          expires: new Date(Date.now() + (status === "expired" ? -1 : 900000)),
        },
        new AbortController().signal,
        async (_url, init) => {
          fetched = true;
          assert.equal(init.headers, undefined);
          assert.equal(init.redirect, "error");
          return new Response("SECRET", { status });
        },
      );
      assert.fail("Expected failure");
    } catch (error) {
      const result = errorEnvelope(error, createRequestContext());
      assert.equal(result.error.code, "DATA_RESOLUTION_FAILED");
      assert.equal(
        result.error.reason,
        status === "expired" ? "link_expired" : "link_rejected",
      );
      assert.equal(result.error.retryable, false);
      assert.doesNotMatch(
        JSON.stringify(result),
        /SECRET|signature|cache.example/,
      );
    }
    assert.equal(fetched, status !== "expired");
  }
});
