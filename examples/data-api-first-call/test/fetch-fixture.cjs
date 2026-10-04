const assert = require("node:assert/strict");
let requests = 0;
globalThis.fetch = async (input, init) => {
  requests++;
  assert.equal(requests, 1);
  assert.equal(String(input), "https://members-ng.iracing.com/data/doc");
  assert.equal(init.method, "GET");
  assert.equal(
    new Headers(init.headers).get("authorization"),
    "Bearer synthetic-token",
  );
  const status = {
    unauthorized: 401,
    forbidden: 403,
    "server-error": 503,
  }[process.env.FIXTURE_MODE];
  if (status) return new Response("{}", { status });
  return Response.json({
    car: {
      get: {
        link: "https://members-ng.iracing.com/data/car/get",
        parameters: {},
      },
      assets: {
        link: "https://members-ng.iracing.com/data/car/assets",
        parameters: {},
      },
    },
    track: {
      get: {
        link: "https://members-ng.iracing.com/data/track/get",
        parameters: {},
      },
    },
  });
};
process.on("exit", () =>
  assert.equal(requests, process.env.FIXTURE_MODE === "missing" ? 0 : 1),
);
