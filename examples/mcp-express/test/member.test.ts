import assert from "node:assert/strict";
import test from "node:test";
import { Configuration } from "@iracing-data/api-client-fetch";
import { createMemberResolver } from "../src/iracing/member";
import { createIRacingRequestResolver } from "../src/iracing/request";

const member = { cust_id: 123, display_name: "Driver" };

for (const cached of [undefined, { cust_id: -1, display_name: "" }]) {
  test(`member lookup resolves and caches a projected identity after ${cached ? "invalid cache data" : "a cache miss"}`, async () => {
    const signal = new AbortController().signal;
    const calls: string[] = [];
    const expiresAt = 2000;
    const resolver = createMemberResolver({
      requests: createIRacingRequestResolver({
        resolveConfiguration: (context) => {
          assert.equal(context.signal, signal);
          calls.push("configuration");

          return new Configuration({
            fetchApi: async (url, options) => {
              assert.equal(new URL(String(url)).pathname, "/data/member/info");
              assert.equal(options?.signal, signal);
              calls.push("request");

              return Response.json({
                link: "https://example.invalid/member",
                expires: new Date(expiresAt).toISOString(),
              });
            },
          });
        },
        cache: {
          async get(key) {
            assert.equal(key, "get_my_driver:v1");
            calls.push("get");

            return cached;
          },
          async set(key, value, expires, options) {
            assert.equal(key, "get_my_driver:v1");
            assert.deepEqual(value, member);
            assert.equal(expires, expiresAt);
            assert.equal(options?.signal, signal);
            calls.push("set");
          },
        },
      }),
      materialize: async (response, context) => {
        assert.equal(response.link, "https://example.invalid/member");
        assert.equal(context.signal, signal);
        calls.push("materialize");

        return { value: { ...member, private_field: "stripped" }, expiresAt };
      },
    });

    assert.deepEqual(await resolver.getCurrent({ signal }), member);
    assert.deepEqual(calls, [
      "get",
      "configuration",
      "request",
      "materialize",
      "set",
    ]);
  });
}

test("member cache hit bypasses credentials and materialization", async () => {
  const resolver = createMemberResolver({
    requests: createIRacingRequestResolver({
      resolveConfiguration: () => assert.fail("must not resolve credentials"),
      cache: {
        get: async () => ({ ...member, private_field: "stripped" }),
        set: async () => assert.fail("must not write on a hit"),
      },
    }),
    materialize: async () => assert.fail("must not materialize on a hit"),
  });

  assert.deepEqual(
    await resolver.getCurrent({ signal: new AbortController().signal }),
    member,
  );
});

test("invalid member payload cannot populate the cache", async () => {
  const resolver = createMemberResolver({
    requests: createIRacingRequestResolver({
      resolveConfiguration: () =>
        new Configuration({
          fetchApi: async () =>
            Response.json({
              link: "https://example.invalid/member",
              expires: new Date(2000).toISOString(),
            }),
        }),
      cache: {
        get: async () => undefined,
        set: async () => assert.fail("invalid data must not be cached"),
      },
    }),
    materialize: async () => ({ value: { cust_id: 123 }, expiresAt: 2000 }),
  });

  await assert.rejects(
    resolver.getCurrent({ signal: new AbortController().signal }),
    { name: "ZodError" },
  );
});
