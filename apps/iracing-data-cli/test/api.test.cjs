const assert = require("node:assert/strict");
const test = require("node:test");

test("facade lazily exposes a cached generated client without I/O", async (t) => {
  const { IRacingAPI } = await import("../dist/api.js");
  const { DocApi } = await import("@iracing-data/api-client-fetch");
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    assert.fail("no HTTP during facade construction or client access");
  });
  const api = IRacingAPI.withAccessToken("synthetic");
  assert.ok(api.doc instanceof DocApi);
  assert.equal(api.doc, api.doc);
  assert.notEqual(api.doc, IRacingAPI.withAccessToken("another").doc);
  assert.equal(fetch.mock.callCount(), 0);
});

test("facade passes shared SDK configuration to the generated client", async () => {
  const { IRacingAPI } = await import("../dist/api.js");
  const { Configuration } = await import("@iracing-data/api-client-fetch");
  const requests = [];
  const api = new IRacingAPI(
    new Configuration({
      basePath: "https://example.test",
      accessToken: "synthetic",
      headers: { "x-test": "shared" },
      fetchApi: async (url, init) => {
        requests.push({ url, init });
        return new Response("{}");
      },
    }),
  );
  await api.doc.getDocs();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://example.test/data/doc");
  assert.equal(
    new Headers(requests[0].init.headers).get("authorization"),
    "Bearer synthetic",
  );
  assert.equal(new Headers(requests[0].init.headers).get("x-test"), "shared");
});
