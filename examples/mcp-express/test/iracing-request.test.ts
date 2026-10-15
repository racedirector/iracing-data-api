import assert from "node:assert/strict";
import test from "node:test";
import { Configuration } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import {
  createIRacingRequestResolver,
  type IRacingRequest,
} from "../src/iracing/request";

const schema = z.object({
  cust_id: z.number().int().positive(),
  display_name: z.string().min(1),
});

const value = { cust_id: 123, display_name: "Driver" };

function createRequest(
  calls: string[],
): IRacingRequest<{ link: string }, z.infer<typeof schema>> {
  return {
    cache: { key: "member:self:v1" },
    schema,
    async execute(configuration, context) {
      calls.push("execute");
      assert.ok(configuration instanceof Configuration);
      assert.equal(context.signal.aborted, false);

      return { link: "https://example.invalid/data" };
    },
    async materialize(response, context) {
      calls.push("materialize");
      assert.equal(response.link, "https://example.invalid/data");
      assert.equal(context.schema, schema);
      assert.equal(context.signal.aborted, false);

      return {
        value: { ...value, ignored: "field" },
        expiresAt: 2000,
      };
    },
  };
}

test("valid cached data bypasses configuration and upstream work", async () => {
  const controller = new AbortController();
  const calls: string[] = [];
  const resolver = createIRacingRequestResolver({
    resolveConfiguration() {
      assert.fail("configuration should not resolve on a cache hit");
    },
    cache: {
      async get(key, options) {
        calls.push("get");
        assert.equal(key, "member:self:v1");
        assert.equal(options?.signal, controller.signal);

        return { ...value, ignored: "field" };
      },
      async set() {
        assert.fail("cache hits must not write");
      },
    },
  });

  const result = await resolver.resolve(createRequest(calls), {
    signal: controller.signal,
  });

  assert.deepEqual(result, value);
  assert.deepEqual(calls, ["get"]);
});

test("cache misses execute and materialize once, then cache the validated value", async () => {
  const controller = new AbortController();
  const configuration = new Configuration();
  const calls: string[] = [];
  const resolver = createIRacingRequestResolver({
    resolveConfiguration(context) {
      calls.push("configuration");
      assert.equal(context.signal, controller.signal);

      return configuration;
    },
    cache: {
      async get() {
        calls.push("get");

        return undefined;
      },
      async set(key, received, expiresAt, options) {
        calls.push("set");
        assert.equal(key, "member:self:v1");
        assert.deepEqual(received, value);
        assert.equal(expiresAt, 2000);
        assert.equal(options?.signal, controller.signal);
      },
    },
  });

  const result = await resolver.resolve(createRequest(calls), {
    signal: controller.signal,
  });

  assert.deepEqual(result, value);
  assert.deepEqual(calls, [
    "get",
    "configuration",
    "execute",
    "materialize",
    "set",
  ]);
});

test("requests without cache policy perform no cache IO", async () => {
  const controller = new AbortController();
  const calls: string[] = [];
  const request = createRequest(calls);
  delete request.cache;

  const resolver = createIRacingRequestResolver({
    resolveConfiguration() {
      calls.push("configuration");

      return new Configuration();
    },
    cache: {
      async get() {
        assert.fail("uncached requests must not read");
      },
      async set() {
        assert.fail("uncached requests must not write");
      },
    },
  });

  assert.deepEqual(
    await resolver.resolve(request, { signal: controller.signal }),
    value,
  );
  assert.deepEqual(calls, ["configuration", "execute", "materialize"]);
});

test("an already-aborted request starts no work", async () => {
  const controller = new AbortController();
  const reason = new Error("cancelled");
  const calls: string[] = [];
  const resolver = createIRacingRequestResolver({
    resolveConfiguration() {
      assert.fail("configuration should not resolve after cancellation");
    },
    cache: {
      async get() {
        assert.fail("cache should not read after cancellation");
      },
      async set() {
        assert.fail("cache should not write after cancellation");
      },
    },
  });

  controller.abort(reason);

  await assert.rejects(
    resolver.resolve(createRequest(calls), { signal: controller.signal }),
    (error) => error === reason,
  );
  assert.deepEqual(calls, []);
});
