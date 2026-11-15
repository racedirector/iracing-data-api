const assert = require("node:assert/strict");
const test = require("node:test");
const { Configuration } = require("@iracing-data/api-client-fetch");

test("independent concrete Fetch adapters acquire their own tokens on demand", async () => {
  const { createDriverQueries } = await import("../dist/adapters/driver.js");
  const calls = [];
  const make = (token, id) => {
    let acquired = 0;
    const configuration = new Configuration({
      accessToken: async () => {
        acquired++;
        return token;
      },
      fetchApi: async (input, init) => {
        const url = new URL(input);
        const bearer = new Headers(init.headers).get("authorization");
        calls.push({ token, url: url.href, bearer, redirect: init.redirect });
        if (url.hostname === "members-ng.iracing.com") {
          assert.equal(bearer, "Bearer " + token);
          return Response.json({
            link: "https://cache.example.test/member?signature=SIGNED_SECRET",
            expires: new Date(Date.now() + 900000).toISOString(),
          });
        }
        assert.equal(bearer, null);
        assert.equal(init.redirect, "error");
        return Response.json({
          cust_id: id,
          display_name: "Driver " + id,
          private: token,
        });
      },
    });
    return {
      queries: createDriverQueries(configuration),
      acquired: () => acquired,
    };
  };
  const first = make("TOKEN_ONE", 1);
  const second = make("TOKEN_TWO", 2);
  assert.equal(first.acquired(), 0);
  assert.equal(second.acquired(), 0);

  const signal = new AbortController().signal;
  assert.deepEqual(await first.queries.getCurrent({ signal }), {
    cust_id: 1,
    display_name: "Driver 1",
  });
  assert.equal(first.acquired(), 1);
  assert.equal(second.acquired(), 0);
  assert.deepEqual(await second.queries.getCurrent({ signal }), {
    cust_id: 2,
    display_name: "Driver 2",
  });
  assert.equal(second.acquired(), 1);
  assert.deepEqual(
    calls.map(({ bearer }) => bearer),
    ["Bearer TOKEN_ONE", null, "Bearer TOKEN_TWO", null],
  );
});

test("reject unsafe signed links before any linked fetch", async () => {
  const { createDriverQueries } = await import("../dist/adapters/driver.js");
  for (const link of [
    "http://cache.example.test/member",
    "https://user:password@cache.example.test/member",
    "not-a-url",
  ]) {
    let requests = 0;
    const configuration = new Configuration({
      accessToken: async () => "TOKEN_SECRET",
      fetchApi: async () => {
        requests++;
        return Response.json({
          link,
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      },
    });
    const driver = createDriverQueries(configuration);
    await assert.rejects(
      driver.getCurrent({ signal: new AbortController().signal }),
      (error) => error.name === "ApplicationFailure",
    );
    assert.equal(requests, 1);
  }
});

test("request cancellation prevents credential acquisition and network effects", async () => {
  const { createDriverQueries } = await import("../dist/adapters/driver.js");
  let called = 0;
  const configuration = new Configuration({
    accessToken: async () => {
      called++;
      return "SECRET";
    },
    fetchApi: async () => {
      called++;
      throw new Error("unexpected network");
    },
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    createDriverQueries(configuration).getCurrent({
      signal: controller.signal,
    }),
  );
  assert.equal(called, 0);
});
