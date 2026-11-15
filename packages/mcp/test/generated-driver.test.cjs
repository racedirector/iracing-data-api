const assert = require("node:assert/strict");
const test = require("node:test");

test("generated adapters acquire independent tokens lazily and isolate signed-link requests", async () => {
  const { createGeneratedDriverQueries } = await import("../dist/generated-driver.js");
  const calls = [];
  const make = (token, id) => {
    let acquired = 0;
    const driver = createGeneratedDriverQueries({
      accessTokenProvider: {
        async getAccessToken() {
          acquired++;
          return token;
        },
      },
      fetchApi: async (url, init) => {
        const target = new URL(url);
        const authorization = new Headers(init.headers).get("authorization");
        calls.push({ url: target.href, authorization, redirect: init.redirect });
        if (target.hostname === "members-ng.iracing.com") {
          assert.equal(authorization, "Bearer " + token);
          return Response.json({
            link: "https://cache.example.test/driver?signature=SIGNED_SECRET",
            expires: new Date(Date.now() + 900000).toISOString(),
          });
        }
        assert.equal(authorization, null);
        assert.equal(init.redirect, "error");
        return Response.json({ cust_id: id, display_name: "Driver " + id, secret: token });
      },
    });
    return { driver, acquired: () => acquired };
  };

  const a = make("TOKEN_A", 1);
  const b = make("TOKEN_B", 2);
  assert.equal(a.acquired(), 0);
  assert.equal(b.acquired(), 0);
  const signal = new AbortController().signal;
  assert.deepEqual(await a.driver.getCurrent({ signal }), {
    cust_id: 1, display_name: "Driver 1",
  });
  assert.equal(a.acquired(), 1);
  assert.equal(b.acquired(), 0);
  assert.deepEqual(await b.driver.getCurrent({ signal }), {
    cust_id: 2, display_name: "Driver 2",
  });
  assert.equal(b.acquired(), 1);
  assert.equal(calls.length, 4);
  assert.deepEqual(calls.map((call) => call.authorization), [
    "Bearer TOKEN_A", null, "Bearer TOKEN_B", null,
  ]);
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(a.driver.getCurrent({ signal: aborted.signal }));
  assert.equal(a.acquired(), 1);
});

test("unsafe signed links never trigger a second fetch", async () => {
  const { createGeneratedDriverQueries } = await import("../dist/generated-driver.js");
  for (const link of ["http://cache.example.test/driver", "https://x:y@cache.example.test/"]) {
    let requests = 0;
    const driver = createGeneratedDriverQueries({
      accessTokenProvider: { getAccessToken: async () => "TOKEN_SECRET" },
      fetchApi: async () => {
        requests++;
        return Response.json({
          link,
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      },
    });
    await assert.rejects(driver.getCurrent({ signal: new AbortController().signal }));
    assert.equal(requests, 1);
  }
});
