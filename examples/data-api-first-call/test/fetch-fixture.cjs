const assert = require("node:assert/strict");
let requests = 0;
globalThis.fetch = async (input, init) => {
  requests++;
  if (requests === 1) {
    assert.equal(String(input), "https://members-ng.iracing.com/data/car/get");
    assert.equal(init.method, "GET");
    assert.equal(
      new Headers(init.headers).get("authorization"),
      "Bearer synthetic-token",
    );
    if (process.env.FIXTURE_MODE === "unauthorized")
      return new Response("{}", { status: 401 });
    return Response.json({
      link: "https://cache.example.test/cars",
      expires: "2030-01-01T00:00:00Z",
    });
  }
  assert.equal(requests, 2);
  assert.equal(String(input), "https://cache.example.test/cars");
  assert.equal(new Headers(init?.headers).get("authorization"), null);
  if (process.env.FIXTURE_MODE === "cache-error")
    return new Response("failure", { status: 503 });
  return Response.json([{ car_id: 1, car_name: "Fixture car" }]);
};
process.on("exit", () =>
  assert.equal(
    requests,
    process.env.FIXTURE_MODE === "missing"
      ? 0
      : process.env.FIXTURE_MODE === "unauthorized"
        ? 1
        : 2,
  ),
);
