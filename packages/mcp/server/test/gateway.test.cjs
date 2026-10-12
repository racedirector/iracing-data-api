const assert = require("node:assert/strict");
const { test } = require("node:test");
const { EventEmitter } = require("node:events");
const { Readable } = require("node:stream");
const { gzipSync, brotliCompressSync, deflateSync } = require("node:zlib");
const { Configuration } = require("@iracing-data/api-client-fetch");
const HOSTS = [
  "scorpio-assets.s3.us-east-1.amazonaws.com",
  "scorpio-assets.s3.amazonaws.com",
];
const flush = async () => {
  for (let i = 0; i < 20; i++) await new Promise(setImmediate);
};
const json = (value) => Response.json(value);
const envelope = (host = HOSTS[0], expiry = Date.now() + 900_000) => ({
  link: `https://${host}/cache/data.json?signature=SIGNED_SECRET`,
  expires: new Date(expiry).toISOString(),
});
const manifest = (rows = 3, changes = {}) => ({
  type: "search_series_results",
  data: {
    success: true,
    params: {},
    chunk_info: {
      chunk_size: 2,
      num_chunks: Math.ceil(rows / 2),
      rows,
      base_download_url: `https://${HOSTS[0]}/results/`,
      chunk_file_names: Array.from(
        { length: Math.ceil(rows / 2) },
        (_, i) => `chunk-${i}.json`,
      ),
      ...changes,
    },
  },
});
async function fixture(handler, options = {}) {
  const api = await import("../dist/index.js");
  const logs = [],
    requests = [];
  const gateway = new api.DataApiGateway({
    configuration: new Configuration({
      accessToken: async () => "TOKEN_SECRET",
      headers: { cookie: "COOKIE_SECRET", "x-secret": "HEADER_SECRET" },
      credentials: "include",
      middleware: [
        {
          pre() {
            throw new Error("middleware must not run");
          },
        },
      ],
    }),
    authorizationState: () => "ready",
    logger: api.createDiagnosticLogger((line) => logs.push(line)),
    transport: async (url, init) => {
      requests.push({ url, init });
      return await handler(url, init);
    },
    ...options,
  });
  return {
    api,
    gateway,
    logs,
    requests,
    call: (work, signal) => gateway.withCall(work, signal),
  };
}
function failure(api, code) {
  return (error) => {
    const result = api.errorEnvelope(error, api.createRequestContext());
    assert.equal(result.error.code, code);
    assert.doesNotMatch(JSON.stringify(result), /SECRET|https:|stack|cause/);
    assert.doesNotMatch(error.message, /SECRET|https:/);
    assert.equal(error.cause, undefined);
    return true;
  };
}

test("direct document/constants bypass links; generated route and raw manifest preserve data", async () => {
  const f = await fixture((url) =>
    url.pathname === "/data/doc"
      ? json({
          car: {
            get: {
              link: "https://members-ng.iracing.com/data/car/get",
              note: "UNTRUSTED_SECRET",
            },
          },
        })
      : url.pathname.includes("constants")
        ? json([])
        : json(manifest(0)),
  );
  assert.deepEqual(await f.call((c) => c.constants()), []);
  assert.ok((await f.call((c) => c.document())).car.get);
  const search = await f.call((c) =>
    c.search({ start_range_begin: new Date("2026-10-01T00:00:00Z") }),
  );
  assert.equal(search.totalRows, 0);
  assert.equal(search.chunks, 0);
  assert.equal(f.requests.length, 3);
  assert.equal(
    f.requests[2].url.searchParams.get("start_range_begin"),
    "2026-10-01T00:00:00.000Z",
  );
  assert.doesNotMatch(
    JSON.stringify(search) + f.logs.join(""),
    /SECRET|https:/,
  );
});
for (const host of HOSTS)
  test(`isolated linked payload through ${host}`, async () => {
    const f = await fixture((url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(envelope(host))
        : json([{ car_id: 1 }]),
    );
    assert.deepEqual(await f.call((c) => c.cars()), [{ car_id: 1 }]);
    assert.equal(f.requests.length, 2);
    for (const { url, init } of f.requests) {
      assert.equal(init.credentials, "omit");
      assert.equal(init.redirect, "error");
      const headers = new Headers(init.headers);
      assert.equal(
        headers.get("authorization"),
        url.hostname === "members-ng.iracing.com"
          ? "Bearer TOKEN_SECRET"
          : null,
      );
      assert.equal(headers.get("cookie"), null);
      assert.equal(headers.get("x-secret"), null);
    }
    assert.doesNotMatch(f.logs.join(""), /SECRET|scorpio|signature/);
  });

test("all bounded linked operations validate their own shapes and canonical inputs", async () => {
  const values = {
    "/data/member/info": { cust_id: 1, display_name: "Fixture" },
    "/data/lookup/drivers": [],
    "/data/car/get": [],
    "/data/track/get": [],
    "/data/stats/member_recent_races": { cust_id: 1, races: [] },
    "/data/series/season_list": { seasons: [] },
    "/data/series/season_schedule": {
      success: true,
      season_id: 1,
      schedules: [],
    },
    "/data/results/get": { session_results: [] },
  };
  const f = await fixture((url) =>
    url.hostname === "members-ng.iracing.com"
      ? json({ ...envelope(), link: `https://${HOSTS[0]}${url.pathname}.json` })
      : json(values[url.pathname.replace(/\.json$/, "")]),
  );
  for (const work of [
    (c) => c.member(),
    (c) => c.drivers({ search_term: "Fixture" }),
    (c) => c.cars(),
    (c) => c.tracks(),
    (c) => c.recent(),
    (c) => c.seasons(),
    (c) => c.schedule({ season_id: 1 }),
    (c) => c.result({ subsession_id: 1 }),
  ])
    await f.call(work);
  const count = f.requests.length;
  await assert.rejects(
    f.call((c) => c.drivers({ bad: true })),
    failure(f.api, "INVALID_INPUT"),
  );
  assert.equal(f.requests.length, count);
});

test("empty/malformed operation responses and recursive links fail safely", async () => {
  for (const body of [
    null,
    {},
    [],
    { link: "https://evil.example", expires: "invalid" },
    { type: "search_series_results", data: {} },
  ]) {
    const f = await fixture(() => json(body));
    await assert.rejects(
      f.call((c) => c.cars()),
      failure(f.api, "DATA_RESOLUTION_FAILED"),
    );
  }
  const f = await fixture((url) =>
    url.hostname === "members-ng.iracing.com"
      ? json(envelope())
      : json(envelope()),
  );
  await assert.rejects(
    f.call((c) => c.cars()),
    failure(f.api, "DATA_RESOLUTION_FAILED"),
  );
  assert.equal(f.requests.length, 2);
  const invalid = await fixture(() => new Response("MALFORMED_SECRET"));
  await assert.rejects(
    invalid.call((c) => c.constants()),
    failure(invalid.api, "DATA_RESOLUTION_FAILED"),
  );
});

test("strict direct manifest counts, success, names and base URL", async () => {
  for (const value of [manifest(0), manifest(1), manifest(3)]) {
    const f = await fixture(() => json(value));
    assert.equal(
      (await f.call((c) => c.search())).totalRows,
      value.data.chunk_info.rows,
    );
  }
  const invalid = [
    manifest(3, { num_chunks: 1 }),
    manifest(3, { rows: -1 }),
    manifest(3, { rows: 500001 }),
    manifest(3, { num_chunks: 1001 }),
    manifest(3, { chunk_size: 0 }),
    manifest(3, { base_download_url: ` https://${HOSTS[0]}/results/` }),
    manifest(3, { base_download_url: `https://${HOSTS[0]}/results/\n` }),
    manifest(3, { chunk_file_names: ["x.json", "x.json"] }),
    manifest(3, { base_download_url: `https://${HOSTS[0]}/results` }),
    manifest(3, { chunk_file_names: ["../secret", "b.json"] }),
    { ...manifest(), data: { ...manifest().data, success: false } },
    envelope(),
  ];
  for (const value of invalid) {
    const f = await fixture(() => json(value));
    await assert.rejects(
      f.call((c) => c.search()),
      failure(f.api, "DATA_RESOLUTION_FAILED"),
    );
    assert.equal(f.requests.length, 1);
  }
});

test("independent chunks preserve order, cache only locally, validate row counts and expire", async () => {
  let now = Date.now();
  const f = await fixture(
    (url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(manifest())
        : json(
            url.pathname.endsWith("chunk-0.json")
              ? [{ subsession_id: 2 }, { subsession_id: 1 }]
              : [{ subsession_id: 3 }],
          ),
    { now: () => now },
  );
  const search = await f.call((c) => c.search());
  const rows = await f.call((c) => c.chunk(search, 0));
  rows[0].subsession_id = 99;
  assert.equal((await f.call((c) => c.chunk(search, 0)))[0].subsession_id, 2);
  assert.deepEqual(await f.call((c) => c.chunk(search, 1)), [
    { subsession_id: 3 },
  ]);
  assert.equal(f.requests.length, 3);
  await assert.rejects(
    f.call((c) => c.chunk(search, 2)),
    failure(f.api, "INVALID_INPUT"),
  );
  await assert.rejects(
    f.call((c) => c.chunk({ ...search }, 0)),
    failure(f.api, "CURSOR_EXPIRED"),
  );
  now += 300001;
  await assert.rejects(
    f.call((c) => c.chunk(search, 0)),
    failure(f.api, "CURSOR_EXPIRED"),
  );
  assert.equal(f.requests.length, 3);
  const bad = await fixture((url) =>
    url.hostname === "members-ng.iracing.com"
      ? json(manifest())
      : json([{ subsession_id: 1 }]),
  );
  const handle = await bad.call((c) => c.search());
  await assert.rejects(
    bad.call((c) => c.chunk(handle, 0)),
    failure(bad.api, "DATA_RESOLUTION_FAILED"),
  );
});

test("first-page envelope reacquisition is once only; continuation never restarts search", async () => {
  for (const status of [403, 404]) {
    let downloads = 0;
    const f = await fixture((url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(envelope())
        : ++downloads === 1
          ? new Response("SIGNED_SECRET", { status })
          : json([]),
    );
    assert.deepEqual(await f.call((c) => c.cars()), []);
    assert.equal(f.requests.length, 4);
    const continuation = await fixture((url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(manifest())
        : new Response("SECRET", { status }),
    );
    const handle = await continuation.call((c) => c.search());
    await assert.rejects(
      continuation.call((c) => c.chunk(handle, 0)),
      failure(continuation.api, "CURSOR_EXPIRED"),
    );
    assert.equal(continuation.requests.length, 2);
  }
  const f = await fixture(() => json(envelope(HOSTS[0], Date.now() - 1)));
  await assert.rejects(
    f.call((c) => c.cars()),
    failure(f.api, "CURSOR_EXPIRED"),
  );
  assert.equal(f.requests.length, 2);
  let apiCalls = 0;
  const recovered = await fixture((url) =>
    url.hostname === "members-ng.iracing.com"
      ? json(
          envelope(
            HOSTS[0],
            ++apiCalls === 1 ? Date.now() - 1 : Date.now() + 900000,
          ),
        )
      : json([]),
  );
  assert.deepEqual(await recovered.call((c) => c.cars()), []);
  assert.equal(recovered.requests.length, 3);
});

test("URL/path attack matrix is rejected without a cache request", async () => {
  const host = HOSTS[0];
  for (const url of [
    `https://${host}/x\n`,
    ` https://${host}/x`,
    `https://${host}/x\t?signature=SECRET`,
    `http://${host}/x`,
    `https://user:SECRET@${host}/x`,
    `https://${host}:444/x`,
    `https://${host}/x#SECRET`,
    `https://${host}.evil/x`,
    "https://127.0.0.1/x",
    "https://[::1]/x",
    `https://${host}/a/../x`,
    `https://${host}/%2e%2e/x`,
    `https://${host}/%252f/x`,
    `https://${host}/a\\x`,
    `https://${host}/a//x`,
  ]) {
    const f = await fixture(() => json({ ...envelope(), link: url }));
    await assert.rejects(
      f.call((c) => c.cars()),
      failure(f.api, "DATA_RESOLUTION_FAILED"),
    );
    assert.equal(f.requests.length, 1);
  }
  const { chunkUrl } = await import("../dist/gateway/policy.js");
  for (const name of [
    "..",
    ".x",
    "a/b",
    "a?x",
    "a#x",
    "https://evil",
    "%2f",
    "a\\b",
    "../x",
    "x%00.json",
  ])
    assert.throws(() => chunkUrl(`https://${host}/results/`, name));
});

test("redirects rejected for API and cache, including deceptive redirected responses", async () => {
  for (const cache of [false, true])
    for (const status of [301, 302, 307, 308]) {
      const f = await fixture((url) =>
        cache && url.hostname === "members-ng.iracing.com"
          ? json(envelope())
          : new Response(null, {
              status,
              headers: { location: "https://evil/SECRET" },
            }),
      );
      await assert.rejects(
        f.call((c) => c.cars()),
        failure(f.api, "DATA_RESOLUTION_FAILED"),
      );
      assert.equal(f.requests.length, cache ? 2 : 1);
    }
  const f = await fixture(() => {
    const r = json([]);
    Object.defineProperty(r, "redirected", { value: true });
    return r;
  });
  await assert.rejects(
    f.call((c) => c.constants()),
    failure(f.api, "DATA_RESOLUTION_FAILED"),
  );
});

test("DNS checks reject mixed/private/mapped/transition answers and pin public TLS lookup", async () => {
  const { createGatewayTransport } =
    await import("../dist/gateway/transport.js");
  const { isPublicAddress } = await import("../dist/gateway/policy.js");
  for (const address of [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.1.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "198.18.1.1",
    "224.0.0.1",
    "::",
    "::1",
    "::ffff:8.8.8.8",
    "fe80::1",
    "fc00::1",
    "2002:7f00::1",
    "2001:db8::1",
  ]) {
    assert.equal(isPublicAddress(address), false, address);
    let connections = 0;
    const transport = createGatewayTransport(
      async () => [
        { address: "8.8.8.8", family: 4 },
        { address, family: address.includes(":") ? 6 : 4 },
      ],
      () => {
        connections++;
        throw new Error("SECRET");
      },
    );
    await assert.rejects(transport(new URL(`https://${HOSTS[0]}/x`), {}));
    assert.equal(connections, 0);
  }
  let lookups = 0;
  const connect = (_url, options, callback) => {
    assert.equal(options.agent, false);
    assert.equal(options.rejectUnauthorized, true);
    options.lookup("ignored", {}, (error, address, family) => {
      assert.equal(error, null);
      assert.equal(address, "8.8.8.8");
      assert.equal(family, 4);
    });
    const req = new EventEmitter();
    req.destroy = () => {};
    req.end = () => {
      const incoming = Readable.from([Buffer.from("[]")]);
      incoming.headers = {};
      incoming.statusCode = 200;
      incoming.complete = true;
      callback(incoming);
    };
    return req;
  };
  const transport = createGatewayTransport(async () => {
    lookups++;
    return [{ address: "8.8.8.8", family: 4 }];
  }, connect);
  assert.deepEqual(
    await (await transport(new URL(`https://${HOSTS[0]}/x`), {})).json(),
    [],
  );
  assert.equal(lookups, 1);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});

test("response cap counts decoded streaming bytes regardless of Content-Length", async () => {
  for (const headers of [
    {},
    { "content-length": "1" },
    { "content-length": "999999999" },
  ]) {
    let canceled = false;
    const f = await fixture(
      () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(8 * 1024 * 1024));
              controller.enqueue(new Uint8Array(1));
            },
            cancel() {
              canceled = true;
            },
          }),
          { headers },
        ),
    );
    await assert.rejects(
      f.call((c) => c.constants()),
      failure(f.api, "RESPONSE_LIMIT_EXCEEDED"),
    );
    assert.equal(canceled, true);
  }
  const exact = Buffer.alloc(8 * 1024 * 1024, 32);
  exact.write("[]");
  const f = await fixture(() => new Response(exact));
  assert.deepEqual(await f.call((c) => c.constants()), []);
});

test("production gzip/br/deflate decoding enforces the decoded cap", async () => {
  const { createGatewayTransport } =
    await import("../dist/gateway/transport.js");
  for (const [encoding, compress] of [
    ["gzip", gzipSync],
    ["br", brotliCompressSync],
    ["deflate", deflateSync],
  ]) {
    const compressed = compress(Buffer.alloc(8 * 1024 * 1024 + 1, 32));
    const transport = createGatewayTransport(
      async () => [{ address: "8.8.8.8", family: 4 }],
      (_url, _options, callback) => {
        const req = new EventEmitter();
        req.destroy = () => {};
        req.end = () => {
          const incoming = Readable.from([compressed]);
          incoming.headers = {
            "content-encoding": encoding,
            "content-length": String(compressed.length),
          };
          incoming.statusCode = 200;
          incoming.complete = true;
          callback(incoming);
        };
        return req;
      },
    );
    const f = await fixture(
      () => {
        throw new Error("unused");
      },
      { transport },
    );
    await assert.rejects(
      f.call((c) => c.constants()),
      failure(f.api, "RESPONSE_LIMIT_EXCEEDED"),
    );
  }
});

test("one call shares API/cache fetch count and cumulative byte budgets", async () => {
  const big = Buffer.alloc(6 * 1024 * 1024, 32);
  big.write("[]");
  const bytes = await fixture(() => new Response(big));
  await assert.rejects(
    bytes.call(async (c) => {
      await c.constants();
      await c.constants();
      await c.constants();
    }),
    failure(bytes.api, "RESPONSE_LIMIT_EXCEEDED"),
  );
  assert.equal(bytes.requests.length, 3);
  const fetches = await fixture((url) =>
    url.hostname === "members-ng.iracing.com" ? json(envelope()) : json([]),
  );
  await assert.rejects(
    fetches.call(async (c) => {
      for (let i = 0; i < 5; i++)
        await c.drivers({ search_term: `Fixture-${i}` });
    }),
    failure(fetches.api, "RESPONSE_LIMIT_EXCEEDED"),
  );
  assert.equal(fetches.requests.length, 8);
});

test("shared cooldown handles seconds/date/invalid headers without retry amplification", async () => {
  let now = Date.now();
  for (const header of [
    "2",
    new Date(now + 2000).toUTCString(),
    "SECRET",
    "9999999",
    "-1",
  ]) {
    const f = await fixture(
      () =>
        new Response("SECRET", {
          status: 429,
          headers: { "retry-after": header },
        }),
      { now: () => now },
    );
    await assert.rejects(
      f.call((c) => c.constants()),
      failure(f.api, "RATE_LIMITED"),
    );
    await assert.rejects(
      f.call((c) => c.cars()),
      failure(f.api, "RATE_LIMITED"),
    );
    assert.equal(f.requests.length, 1);
    now += 3601000;
    await assert.rejects(
      f.call((c) => c.constants()),
      failure(f.api, "RATE_LIMITED"),
    );
    assert.equal(f.requests.length, 2);
  }
  for (const status of [401, 403, 404, 500, 503]) {
    const f = await fixture(() => new Response("SECRET", { status }));
    await assert.rejects(
      f.call((c) => c.constants()),
      failure(
        f.api,
        status === 401 || status === 403
          ? "UPSTREAM_UNAUTHORIZED"
          : status === 404
            ? "NOT_FOUND"
            : "UPSTREAM_UNAVAILABLE",
      ),
    );
    assert.equal(f.requests.length, 1);
  }
});

test("global two-operation cap and eight-call admission reject promptly without a queue", async () => {
  const f = await fixture(
    (_url, init) =>
      new Promise((_resolve, reject) =>
        init.signal.addEventListener("abort", () =>
          reject(new Error("SECRET")),
        ),
      ),
  );
  const controller = new AbortController();
  const first = f.call((c) => c.constants(), controller.signal);
  const second = f.call((c) => c.document(), controller.signal);
  await flush();
  await assert.rejects(
    f.call((c) => c.member()),
    failure(f.api, "RATE_LIMITED"),
  );
  assert.equal(f.requests.length, 2);
  controller.abort();
  await Promise.allSettled([first, second]);
  const gates = [],
    controller2 = new AbortController();
  const calls = Array.from({ length: 8 }, () =>
    f.call(
      () => new Promise((resolve) => gates.push(resolve)),
      controller2.signal,
    ),
  );
  await flush();
  await assert.rejects(
    f.call((c) => c.constants()),
    failure(f.api, "RATE_LIMITED"),
  );
  controller2.abort();
  await Promise.allSettled(calls);
  await f.call(async () => "released");
});

test("in-flight dedup shares work, one caller cancellation keeps peer alive, last cancellation aborts", async () => {
  let release,
    aborted = 0;
  const f = await fixture(
    (_url, init) =>
      new Promise((resolve) => {
        release = () => resolve(json([]));
        init.signal.addEventListener("abort", () => aborted++);
      }),
  );
  const a = new AbortController(),
    b = new AbortController();
  const first = f.call((c) => c.constants(), a.signal);
  const second = f.call((c) => c.constants(), b.signal);
  await flush();
  assert.equal(f.requests.length, 1);
  a.abort();
  await assert.rejects(first, failure(f.api, "UPSTREAM_UNAVAILABLE"));
  assert.equal(aborted, 0);
  release();
  assert.deepEqual(await second, []);
  assert.equal(aborted, 1);
  const third = f.call((c) => c.constants(), b.signal);
  await flush();
  b.abort();
  await assert.rejects(third, failure(f.api, "UPSTREAM_UNAVAILABLE"));
  await flush();
  assert.equal(aborted, 2);
});

test("fetch timeout and call deadline cancel even transports/work that ignore abort", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const f = await fixture(() => new Promise(() => {}));
  const timed = f.call((c) => c.constants());
  await flush();
  t.mock.timers.tick(10000);
  await assert.rejects(timed, failure(f.api, "UPSTREAM_UNAVAILABLE"));
  const deadline = f.call(() => new Promise(() => {}));
  await flush();
  t.mock.timers.tick(30000);
  await assert.rejects(deadline, failure(f.api, "UPSTREAM_UNAVAILABLE"));
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(f.call((c) => c.constants(), aborted.signal));
  assert.equal(f.requests.length, 1);
});

test("cursor capacity, session loss, restart and invalidation are bounded and account local", async () => {
  let state = "ready";
  const f = await fixture(() => json(manifest(0)), {
    authorizationState: () => state,
  });
  const handles = [];
  for (let i = 0; i < 32; i++) handles.push(await f.call((c) => c.search()));
  await assert.rejects(
    f.call((c) => c.search()),
    failure(f.api, "RESPONSE_LIMIT_EXCEEDED"),
  );
  state = "authorization_required";
  await assert.rejects(
    f.call((c) => c.chunk(handles[0], 0)),
    failure(f.api, "AUTHORIZATION_REQUIRED"),
  );
  state = "ready";
  await assert.rejects(
    f.call((c) => c.chunk(handles[0], 0)),
    failure(f.api, "CURSOR_EXPIRED"),
  );
  const other = await fixture(() => json(manifest(0)));
  await assert.rejects(
    other.call((c) => c.chunk(handles[1], 0)),
    failure(other.api, "CURSOR_EXPIRED"),
  );
  assert.equal(other.requests.length, 0);
});

test("configuration cannot authorize another origin; OAuth failures remain fail-closed", async () => {
  const api = await import("../dist/index.js");
  assert.throws(
    () =>
      new api.DataApiGateway({
        configuration: new Configuration({
          basePath: "https://evil/SECRET",
          accessToken: "SECRET",
        }),
      }),
    failure(api, "CONFIGURATION_ERROR"),
  );
  let grants = 0;
  const f = await fixture(
    () => {
      throw new Error("must not contact network");
    },
    {
      configuration: new Configuration({
        accessToken: async () => {
          grants++;
          throw new api.ApplicationFailure("TOKEN_REFRESH_FAILED", {
            reason: "rotation_uncertain",
          });
        },
      }),
    },
  );
  await assert.rejects(
    f.call((c) => c.constants()),
    failure(api, "TOKEN_REFRESH_FAILED"),
  );
  assert.equal(grants, 1);
  assert.equal(f.requests.length, 0);
});

test("retained manifest/chunk bytes have a global 32 MiB bound and expiry reclaims capacity", async () => {
  let now = Date.now();
  const largeRows = [
    { subsession_id: 1, padding: "x".repeat(6 * 1024 * 1024) },
  ];
  const f = await fixture(
    (url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(manifest(1))
        : json(largeRows),
    { now: () => now },
  );
  const handles = [];
  for (let i = 0; i < 6; i++) handles.push(await f.call((c) => c.search()));
  for (let i = 0; i < 5; i++) await f.call((c) => c.chunk(handles[i], 0));
  await assert.rejects(
    f.call((c) => c.chunk(handles[5], 0)),
    failure(f.api, "RESPONSE_LIMIT_EXCEEDED"),
  );
  // Cached reads are charged to the consuming call too.
  await assert.rejects(
    f.call(async (c) => {
      await c.chunk(handles[0], 0);
      await c.chunk(handles[1], 0);
      await c.chunk(handles[2], 0);
    }),
    failure(f.api, "RESPONSE_LIMIT_EXCEEDED"),
  );
  now += 300001;
  const fresh = await f.call((c) => c.search());
  await f.call((c) => c.chunk(fresh, 0));
});

test("chunk dedup across calls retains one entry and cancellation cannot mix pages", async () => {
  let release;
  const f = await fixture((url) =>
    url.hostname === "members-ng.iracing.com"
      ? json(manifest(1))
      : new Promise((resolve) => {
          release = () => resolve(json([{ subsession_id: 1 }]));
        }),
  );
  const handle = await f.call((c) => c.search());
  const controller = new AbortController();
  const first = f.call((c) => c.chunk(handle, 0), controller.signal);
  const second = f.call((c) => c.chunk(handle, 0));
  await flush();
  assert.equal(f.requests.length, 2);
  controller.abort();
  await assert.rejects(first, failure(f.api, "UPSTREAM_UNAVAILABLE"));
  release();
  assert.deepEqual(await second, [{ subsession_id: 1 }]);
  await f.call((c) => c.chunk(handle, 0));
  assert.equal(f.requests.length, 2);
});

test("slow bodies, late expiry and authorization loss fail before publishing cache state", async () => {
  let now = Date.now(),
    state = "ready",
    source;
  const f = await fixture(
    (url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(envelope(HOSTS[0], now + 900000))
        : new Response(
            new ReadableStream({
              start(controller) {
                source = controller;
                controller.enqueue(Buffer.from("["));
              },
            }),
          ),
    { now: () => now, authorizationState: () => state },
  );
  const abort = new AbortController();
  const pending = f.call((c) => c.cars(), abort.signal);
  await flush();
  assert.ok(source);
  abort.abort();
  await assert.rejects(pending, failure(f.api, "UPSTREAM_UNAVAILABLE"));
  const late = await fixture(
    (url) => {
      if (url.hostname === "members-ng.iracing.com")
        return json(envelope(HOSTS[0], now + 60000));
      now += 60000;
      return json([]);
    },
    { now: () => now },
  );
  await assert.rejects(
    late.call((c) => c.cars()),
    failure(late.api, "CURSOR_EXPIRED"),
  );
  assert.equal(late.requests.length, 4);
  let release;
  const loss = await fixture(
    (url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(manifest(1))
        : new Promise((resolve) => {
            release = () => resolve(json([{ subsession_id: 1 }]));
          }),
    { authorizationState: () => state },
  );
  const handle = await loss.call((c) => c.search());
  const chunk = loss.call((c) => c.chunk(handle, 0));
  await flush();
  state = "authorization_required";
  release();
  await assert.rejects(chunk, failure(loss.api, "AUTHORIZATION_REQUIRED"));
  state = "ready";
  await assert.rejects(
    loss.call((c) => c.chunk(handle, 0)),
    failure(loss.api, "CURSOR_EXPIRED"),
  );
});

test("known envelope expiry is available for collection cursors without exposing links", async () => {
  const now = Date.now();
  const f = await fixture(
    (url) =>
      url.hostname === "members-ng.iracing.com"
        ? json(envelope(HOSTS[0], now + 90000))
        : json([]),
    { now: () => now },
  );
  const result = await f.call(async (c) => ({
    items: await c.cars(),
    expiresAt: c.expiresAt,
  }));
  assert.deepEqual(result, { items: [], expiresAt: now + 60000 });
  assert.doesNotMatch(JSON.stringify(result), /SECRET|https:/);
});

test("deduplicated consumers each enforce their own cumulative streaming budget", async () => {
  let release,
    hold = false;
  const body = Buffer.alloc(6 * 1024 * 1024, 32);
  body.write("[]");
  const f = await fixture(() =>
    hold
      ? new Promise((resolve) => {
          release = () => resolve(new Response(body));
        })
      : new Response(body),
  );
  const first = f.call(async (c) => {
    await c.constants();
    await c.constants();
    hold = true;
    return c.constants();
  });
  await flush();
  const peer = f.call((c) => c.constants());
  await flush();
  assert.equal(f.requests.length, 3);
  release();
  await assert.rejects(first, failure(f.api, "RESPONSE_LIMIT_EXCEEDED"));
  assert.deepEqual(await peer, []);
});

test("expired download retires its search; escaped call handles cannot do later work", async () => {
  const f = await fixture((url) =>
    url.hostname === "members-ng.iracing.com"
      ? json(manifest(1))
      : new Response(null, { status: 403 }),
  );
  const search = await f.call((c) => c.search());
  await assert.rejects(
    f.call((c) => c.chunk(search, 0)),
    failure(f.api, "CURSOR_EXPIRED"),
  );
  await assert.rejects(
    f.call((c) => c.chunk(search, 0)),
    failure(f.api, "CURSOR_EXPIRED"),
  );
  assert.equal(f.requests.length, 2);
  let escaped;
  await f.call(async (c) => {
    escaped = c;
  });
  await assert.rejects(
    escaped.constants(),
    failure(f.api, "UPSTREAM_UNAVAILABLE"),
  );
  assert.equal(f.requests.length, 2);
});

test("concurrent generated errors retain their own safe codes after a handled failure", async () => {
  const f = await fixture((url) =>
    url.pathname.includes("constants")
      ? new Response("SECRET", { status: 401 })
      : new Response("SECRET", { status: 503 }),
  );
  const settled = await f.call((c) =>
    Promise.allSettled([c.constants(), c.document()]),
  );
  assert.equal(
    f.api.errorEnvelope(settled[0].reason, f.api.createRequestContext()).error
      .code,
    "UPSTREAM_UNAUTHORIZED",
  );
  assert.equal(
    f.api.errorEnvelope(settled[1].reason, f.api.createRequestContext()).error
      .code,
    "UPSTREAM_UNAVAILABLE",
  );
  await assert.rejects(
    f.call(async (c) => {
      try {
        await c.constants();
      } catch {}
      throw new f.api.ApplicationFailure("INVALID_INPUT");
    }),
    failure(f.api, "INVALID_INPUT"),
  );
});
