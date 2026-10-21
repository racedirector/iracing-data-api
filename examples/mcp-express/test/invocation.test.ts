import assert from "node:assert/strict";
import test from "node:test";
import { Configuration } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { createNoopLogger } from "../src/logger";
import { createToolInvocation } from "../src/mcp/tools/invocation";
import { createBestEffortCacheResolver } from "../src/services/cache";
import type { CacheResolver } from "../src/mcp/tools/resolvers/cache";

const schema = z.object({ cust_id: z.number(), display_name: z.string() });
const value = { cust_id: 123, display_name: "Driver" };

function setup(
  cache?: CacheResolver,
  controller = new AbortController(),
  abortAt?: string,
) {
  const calls: string[] = [];
  const reason = new Error("cancelled");
  const record = (name: string) => {
    calls.push(name);
    if (abortAt === name) {
      controller.abort(reason);
    }
  };
  const configuration = new Configuration();
  const response = {
    link: "https://example.invalid/data",
    expires: new Date(2000),
  };
  const invoke = createToolInvocation(
    {
      cacheKey: "get_my_driver:v1",
      outputSchema: schema,
      request: async (received, options) => {
        assert.equal(received, configuration);
        assert.equal(options.signal, controller.signal);
        record("request");

        return response;
      },
    },
    {
      cache,
      resolveConfiguration: ({ signal }) => {
        assert.equal(signal, controller.signal);
        record("configuration");

        return configuration;
      },
      resolveLink: async (options) => {
        assert.equal(options.response, response);
        assert.equal(options.schema, schema);
        assert.equal(options.signal, controller.signal);
        record("link");

        return { value, expiresAt: 2000 };
      },
      resolveResponse: {
        success: (received) => {
          record("success");

          return { content: [], structuredContent: received };
        },
        error: (cause) => {
          record("error");
          throw new Error("Unexpected tool error", { cause });
        },
      },
    },
  );

  // Only the request signal is consumed by this unit boundary.
  const context = { mcpReq: { signal: controller.signal } } as Parameters<
    typeof invoke
  >[1];

  return { run: () => invoke({}, context), calls, controller, reason };
}

test("optional cache executes the authoritative path", async () => {
  const fixture = setup();

  assert.deepEqual((await fixture.run()).structuredContent, value);
  assert.deepEqual(fixture.calls, [
    "configuration",
    "request",
    "link",
    "success",
  ]);
});

test("valid cache hit normalizes unknown data and avoids all upstream work", async () => {
  const reads: unknown[][] = [];
  const cached = { ...value, secret: "stripped" };
  const fixture = setup({
    async get(...args) {
      reads.push(args);

      return cached;
    },
    async set() {
      assert.fail("Cache hits must not write");
    },
  });
  const result = await fixture.run();

  assert.deepEqual(result.structuredContent, value);
  assert.notEqual(result.structuredContent, cached);
  assert.deepEqual(fixture.calls, ["success"]);
  assert.deepEqual(reads, [
    ["get_my_driver:v1", { signal: fixture.controller.signal }],
  ]);
});

for (const cached of [
  undefined,
  { cust_id: "invalid", display_name: "Driver" },
]) {
  test(`cache ${cached === undefined ? "miss" : "invalid shape"} repopulates with resolved payload and absolute expiration`, async () => {
    const writes: unknown[][] = [];
    const fixture = setup({
      async get() {
        fixture.calls.push("get");

        return cached;
      },
      async set(...args) {
        fixture.calls.push("set");
        writes.push(args);
      },
    });

    assert.deepEqual((await fixture.run()).structuredContent, value);
    assert.deepEqual(fixture.calls, [
      "get",
      "configuration",
      "request",
      "link",
      "set",
      "success",
    ]);
    assert.deepEqual(writes, [
      ["get_my_driver:v1", value, 2000, { signal: fixture.controller.signal }],
    ]);
    assert.equal(writes[0][1], value);
  });
}

for (const operation of ["get", "set"]) {
  test(`best-effort ${operation} failure preserves successful invocation`, async () => {
    const warnings: unknown[] = [];
    const cache = createBestEffortCacheResolver({
      cache: {
        async get() {
          if (operation === "get") {
            throw new Error("backend");
          }
        },
        async set() {
          if (operation === "set") {
            throw new Error("backend");
          }
        },
      },
      logger: { ...createNoopLogger(), warn: (...args) => warnings.push(args) },
    });
    const fixture = setup(cache);

    assert.deepEqual((await fixture.run()).structuredContent, value);
    assert.deepEqual(fixture.calls, [
      "configuration",
      "request",
      "link",
      "success",
    ]);
    assert.equal(warnings.length, 1);
  });
}

test("already aborted invocation starts no work", async () => {
  const fixture = setup({
    async get() {
      assert.fail("read");
    },
    async set() {
      assert.fail("write");
    },
  });

  fixture.controller.abort(fixture.reason);
  await assert.rejects(fixture.run(), (error) => error === fixture.reason);
  assert.deepEqual(fixture.calls, []);
});

for (const cached of [undefined, value]) {
  test(`abort during cache lookup prevents ${cached ? "cached success" : "upstream work"}`, async () => {
    const fixture = setup({
      async get() {
        fixture.controller.abort(fixture.reason);

        return cached;
      },
      async set() {
        assert.fail("write");
      },
    });

    await assert.rejects(fixture.run(), (error) => error === fixture.reason);
    assert.deepEqual(fixture.calls, []);
  });
}

test("abort after link resolution prevents cache write and success", async () => {
  const fixture = setup(
    {
      async get() {},
      async set() {
        assert.fail("write");
      },
    },
    new AbortController(),
    "link",
  );

  await assert.rejects(fixture.run(), (error) => error === fixture.reason);
  assert.deepEqual(fixture.calls, ["configuration", "request", "link"]);
});

test("abort during cache write escapes without tool error or success", async () => {
  const fixture = setup({
    async get() {},
    async set() {
      fixture.calls.push("set");
      fixture.controller.abort(fixture.reason);
      throw fixture.reason;
    },
  });

  await assert.rejects(fixture.run(), (error) => error === fixture.reason);
  assert.deepEqual(fixture.calls, ["configuration", "request", "link", "set"]);
});
