import assert from "node:assert/strict";
import test from "node:test";
import { createNoopLogger } from "../src/logger";
import {
  createBestEffortCacheResolver,
  createScopedCacheResolver,
  createMemoryCacheStore,
} from "../src/services/cache";
import type { CacheResolver } from "../src/mcp/tools/resolvers/cache";

function setup(cache: CacheResolver) {
  const logs: unknown[] = [];
  const resolver = createBestEffortCacheResolver({
    cache,
    logger: {
      ...createNoopLogger(),
      warn: (message, fields) => logs.push({ message, fields }),
    },
  });

  return { resolver, logs };
}

test("best-effort forwards successful operations and normal misses unchanged", async () => {
  const value = { driver: 123 };
  const options = { signal: new AbortController().signal };
  const calls: unknown[][] = [];
  const { resolver, logs } = setup({
    async get(...args) {
      calls.push(args);

      return args[0] === "miss" ? undefined : value;
    },
    async set(...args) {
      calls.push(args);
    },
  });

  assert.equal(await resolver.get("driver", options), value);
  assert.equal(await resolver.get("miss"), undefined);
  await resolver.set("driver", value, 12345, options);
  assert.deepEqual(calls, [
    ["driver", options],
    ["miss", undefined],
    ["driver", value, 12345, options],
  ]);
  assert.deepEqual(logs, []);
});

test("memory cache misses, replaces values and expires at the exact absolute boundary", async () => {
  let now = 1000;
  const cache = createMemoryCacheStore({ now: () => now });

  assert.equal(await cache.get("missing"), undefined);
  await cache.set("key", "first", 2000);
  assert.equal(await cache.get("key"), "first");
  await cache.set("key", "second", 2000);
  assert.equal(await cache.get("key"), "second");
  now = 2000;
  assert.equal(await cache.get("key"), undefined);
  await cache.set("key", "replacement", 3000);
  assert.equal(await cache.get("key"), "replacement");
  now = 3001;
  assert.equal(await cache.get("key"), undefined);
  await cache.set("key", "fresh", 4000);
  assert.equal(await cache.get("key"), "fresh");
  for (const expiresAt of [now, now - 1]) {
    await cache.set("key", "expired", expiresAt);
    assert.equal(await cache.get("key"), undefined);
  }
});

test("memory cache rejects already aborted reads and writes without replacing a value", async () => {
  const cache = createMemoryCacheStore({ now: () => 1000 });

  await cache.set("key", "original", 2000);
  const controller = new AbortController();
  const reason = new Error("cancelled");

  controller.abort(reason);
  await assert.rejects(
    cache.get("key", { signal: controller.signal }),
    (error) => error === reason,
  );
  await assert.rejects(
    cache.set("key", "changed", 2000, { signal: controller.signal }),
    (error) => error === reason,
  );
  assert.equal(await cache.get("key"), "original");
});

test("scoped best-effort memory composition isolates principals and preserves expiration and validation", async () => {
  let now = 1000;
  const { resolver, logs } = setup(createMemoryCacheStore({ now: () => now }));
  const a = createScopedCacheResolver({ cache: resolver, scope: "a:b /%" });
  const same = createScopedCacheResolver({ cache: resolver, scope: "a:b /%" });
  const b = createScopedCacheResolver({ cache: resolver, scope: "a%3Ab /%" });

  await a.set("key", "A", 2000);
  await b.set("key", "B", 3000);
  assert.equal(await same.get("key"), "A");
  assert.equal(await b.get("key"), "B");
  now = 2000;
  assert.equal(await a.get("key"), undefined);
  assert.equal(await b.get("key"), "B");
  for (const key of ["", "   ", "\t\n"]) {
    assert.throws(() => a.get(key), /key/i);
    assert.throws(() => a.set(key, "value", 4000), /key/i);
  }

  assert.throws(
    () => createScopedCacheResolver({ cache: resolver, scope: " " }),
    /scope/i,
  );
  assert.deepEqual(logs, []);
});

test("best-effort logs backend failures without keys, values or raw error secrets", async () => {
  const { resolver, logs } = setup({
    get() {
      throw new Error("connection-secret");
    },
    async set() {
      throw new Error("connection-secret");
    },
  });

  assert.equal(await resolver.get("principal-secret"), undefined);
  await resolver.set("principal-secret", "value-secret", 12345);
  assert.deepEqual(logs, [
    {
      message: "Cache operation failed",
      fields: { operation: "get", error: "Error" },
    },
    {
      message: "Cache operation failed",
      fields: { operation: "set", error: "Error" },
    },
  ]);
});

for (const operation of ["get", "set"] as const) {
  test(`best-effort ${operation} rejects pre-aborted signals without accessing cache`, async () => {
    const controller = new AbortController();
    const reason = { cancelled: true };

    controller.abort(reason);
    let calls = 0;
    const { resolver, logs } = setup({
      async get() {
        calls++;
      },
      async set() {
        calls++;
      },
    });
    const options = { signal: controller.signal };

    await assert.rejects(
      operation === "get"
        ? resolver.get("key", options)
        : resolver.set("key", {}, 1, options),
      (error) => error === reason,
    );
    assert.equal(calls, 0);
    assert.deepEqual(logs, []);
  });

  for (const rejects of [true, false]) {
    test(`best-effort ${operation} preserves abort during ${rejects ? "failed" : "successful"} backend work`, async () => {
      const controller = new AbortController();
      const reason = { cancelled: true };
      const abort = () => {
        controller.abort(reason);
        if (rejects) {
          throw new Error("backend failure");
        }
      };
      const { resolver, logs } = setup({
        async get() {
          abort();

          return "value";
        },
        async set() {
          abort();
        },
      });
      const options = { signal: controller.signal };

      await assert.rejects(
        operation === "get"
          ? resolver.get("key", options)
          : resolver.set("key", {}, 1, options),
        (error) => error === reason,
      );
      assert.deepEqual(logs, []);
    });
  }
}

test("scoping is deterministic, isolated, encoded and symmetric; payloads pass through", async () => {
  const calls: unknown[][] = [];
  const value = { driver: 123 };
  const options = { signal: new AbortController().signal, extra: "unchanged" };
  const backing: CacheResolver = {
    async get(...args) {
      calls.push(args);

      return value;
    },
    async set(...args) {
      calls.push(args);
    },
  };
  const a = createScopedCacheResolver({ cache: backing, scope: "principal-a" });
  const b = createScopedCacheResolver({ cache: backing, scope: "principal-b" });
  const encoded = createScopedCacheResolver({
    cache: backing,
    scope: "a:b /%",
  });

  assert.equal(await a.get("get_my_driver:v1", options), value);
  await a.get("get_my_driver:v1", options);
  await a.set("get_my_driver:v1", value, 12345, options);
  await b.get("get_my_driver:v1", options);
  await encoded.get("get_my_driver:v1", options);
  assert.deepEqual(calls, [
    ["iracing-data:principal-a:get_my_driver:v1", options],
    ["iracing-data:principal-a:get_my_driver:v1", options],
    ["iracing-data:principal-a:get_my_driver:v1", value, 12345, options],
    ["iracing-data:principal-b:get_my_driver:v1", options],
    ["iracing-data:a%3Ab%20%2F%25:get_my_driver:v1", options],
  ]);
  assert.equal(calls[0][1], options);
  assert.equal(calls[2][1], value);
  assert.equal(calls[2][3], options);
});

test("scoping rejects empty and whitespace-only scopes during construction", () => {
  const backing: CacheResolver = { async get() {}, async set() {} };

  for (const scope of ["", "   ", "\t\n"]) {
    assert.throws(
      () => createScopedCacheResolver({ cache: backing, scope }),
      /scope/i,
    );
  }
});

test("scoped best-effort composition namespaces before access and tolerates failures", async () => {
  const keys: string[] = [];
  const { resolver: bestEffort, logs } = setup({
    async get(key) {
      keys.push(key);
      throw new Error("unavailable");
    },
    async set(key) {
      keys.push(key);
      throw new Error("unavailable");
    },
  });
  const scoped = createScopedCacheResolver({
    cache: bestEffort,
    scope: "principal-a",
  });

  assert.equal(await scoped.get("get_my_driver:v1"), undefined);
  await scoped.set("get_my_driver:v1", {}, 12345);
  assert.deepEqual(
    keys,
    Array(2).fill("iracing-data:principal-a:get_my_driver:v1"),
  );
  assert.equal(logs.length, 2);
  assert.doesNotMatch(JSON.stringify(logs), /principal-a/);
});
