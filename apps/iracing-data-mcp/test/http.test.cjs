const assert = require("node:assert/strict");
const test = require("node:test");
const http = require("node:http");

function timers() {
  const jobs = new Set();
  return {
    schedule(fn, ms) {
      const job = { fn, ms };
      jobs.add(job);
      return () => jobs.delete(job);
    },
    fire(ms) {
      for (const job of [...jobs])
        if (job.ms === ms) {
          jobs.delete(job);
          job.fn();
        }
    },
    jobs,
  };
}
async function fixture(t, registerTools, clock = timers()) {
  const api = await import("../dist/index.js");
  const logs = [];
  const services = new Proxy(
    {},
    {
      get(_target, key) {
        if (
          key === "authorizationState" ||
          key === "shutdownAuthorizationOwner"
        )
          return undefined;
        throw new Error("Unexpected upstream service access");
      },
    },
  );
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
    registerTools,
    schedule: clock.schedule,
    logger: api.createDiagnosticLogger((line) => logs.push(line)),
  });
  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());
  const port = app.server.address().port;
  function request({
    path = "/mcp",
    method = "POST",
    headers = {},
    body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  } = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          port,
          host: "127.0.0.1",
          path,
          method,
          headers: {
            Host: "127.0.0.1:3000",
            Accept: "application/json, text/event-stream",
            "Content-Type": "application/json",
            "MCP-Protocol-Version": "2025-11-25",
            ...headers,
          },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: res.headers,
              text,
              json: () => JSON.parse(text),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  }
  return { api, app, clock, logs, request, port };
}
const call = (name = "probe", args = {}) =>
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name, arguments: args },
  });
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function until(predicate) {
  for (let i = 0; i < 200 && !predicate(); i++) await tick();
  assert.ok(predicate());
}

test("listen defaults to loopback and preserves explicit host overrides", async (t) => {
  const { app } = await fixture(t);
  await new Promise((resolve, reject) =>
    app.server.close((error) => (error ? reject(error) : resolve())),
  );
  await app.listen(0);
  assert.equal(app.server.address().address, "127.0.0.1");
  await new Promise((resolve, reject) =>
    app.server.close((error) => (error ? reject(error) : resolve())),
  );
  await app.listen(0, "0.0.0.0");
  assert.equal(app.server.address().address, "0.0.0.0");
});

test("exact HTTP Host and Origin protections on all routes", async (t) => {
  const { request } = await fixture(t);
  for (const host of ["localhost:3000", "127.0.0.1:3000"])
    assert.equal((await request({ headers: { Host: host } })).status, 200);
  for (const host of [
    "evil.example:3000",
    "localhost:3001",
    "localhost.evil:3000",
    "evil-localhost:3000",
    "127.0.0.1:3000@evil",
    "LOCALHOST:3000",
  ])
    assert.equal(
      (
        await request({
          headers: {
            Host: host,
            "X-Forwarded-Host": "localhost:3000",
            Forwarded: 'host="localhost:3000"',
          },
        })
      ).status,
      403,
    );
  assert.equal(
    (await request({ headers: { "X-Forwarded-Host": "evil.example" } })).status,
    200,
  );
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000"])
    assert.equal((await request({ headers: { Origin: origin } })).status, 200);
  for (const origin of [
    "null",
    "garbage",
    "http://localhost:3000/",
    "https://localhost:3000",
    "http://localhost.evil:3000",
    "http://evil-localhost:3000",
    "http://user@localhost:3000",
    "http://localhost:3001",
    "http://*",
  ])
    assert.equal((await request({ headers: { Origin: origin } })).status, 403);
});

test("methods, unknown paths, safe health and body limits", async (t) => {
  const { request, logs } = await fixture(t);
  for (const method of ["GET", "DELETE", "PUT"])
    assert.equal((await request({ method, body: "" })).status, 405);
  assert.equal((await request({ path: "/auth/iracing" })).status, 404);
  assert.equal((await request({ path: "/missing" })).status, 404);
  const health = await request({ path: "/healthz", method: "GET", body: "" });
  assert.deepEqual(health.json(), {
    name: "iracing-data-mcp",
    version: "0.0.0",
    live: true,
    auth_state: "configuration_error",
  });
  assert.equal(
    (await request({ path: "/healthz", headers: { Host: "evil:3000" } }))
      .status,
    403,
  );
  const base = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  assert.equal((await request({ body: base.padEnd(65536, " ") })).status, 200);
  assert.equal((await request({ body: base.padEnd(65537, " ") })).status, 413);
  assert.equal(
    (await request({ body: '{"secret":"SYNTHETIC_TOKEN",' })).status,
    400,
  );
  assert.ok(!logs.join("").includes("SYNTHETIC_TOKEN"));
});

test("chunked oversize is rejected before request completion", async (t) => {
  const { port } = await fixture(t);
  await new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/mcp",
        method: "POST",
        headers: { Host: "localhost:3000", "Transfer-Encoding": "chunked" },
      },
      (res) => {
        assert.equal(res.statusCode, 413);
        res.resume();
        res.on("end", resolve);
      },
    );
    req.on("error", reject);
    req.write(Buffer.alloc(65537, 32)); // deliberately never end the upload
    t.after(() => req.destroy());
  });
});

test("official MCP client initializes, lists and calls stateless JSON tools", async (t) => {
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  let seenServices;
  const { app, request } = await fixture(t, (server, services) => {
    seenServices = services;
    server.registerTool("probe", {}, () => ({
      content: [{ type: "text", text: "ok" }],
    }));
  });
  const transport = new StreamableHTTPClientTransport(
    new URL("http://127.0.0.1:3000/mcp"),
    {
      fetch: async (_url, init) => {
        const response = await request({
          method: init.method,
          headers: Object.fromEntries(new Headers(init.headers)),
          body: init.body ?? "",
        });
        return new Response(response.text || null, {
          status: response.status,
          headers: response.headers,
        });
      },
    },
  );
  const client = new Client(
    { name: "offline-test", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  t.after(() => client.close());
  await client.connect(transport);
  assert.equal(transport.sessionId, undefined);
  assert.deepEqual(
    (await client.listTools()).tools.map((x) => x.name),
    [
      "get_my_driver",
      "find_drivers",
      "get_recent_races",
      "lookup_content",
      "list_series_seasons",
      "get_series_schedule",
      "get_race_result",
      "search_driver_races",
      "probe",
    ],
  );
  assert.equal(
    (await client.callTool({ name: "probe", arguments: {} })).content[0].text,
    "ok",
  );
  assert.ok(seenServices);
  assert.equal(app.admittedTools, 0);
  const init = await request({
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1" },
      },
    }),
  });
  assert.equal(init.json().result.protocolVersion, "2025-11-25");
  assert.equal(init.headers["mcp-session-id"], undefined);
  assert.match(init.headers["content-type"], /application\/json/);
  assert.equal(
    (await request({ headers: { "MCP-Protocol-Version": "not-supported" } }))
      .status,
    400,
  );
});

test("bearer tokens do not authorize or bypass the local boundary; errors are redacted", async (t) => {
  const { request, logs } = await fixture(t, (server) =>
    server.registerTool("probe", {}, () => {
      throw new Error("SYNTHETIC_TOKEN raw stack body");
    }),
  );
  const authorized = await request({
    body: call(),
    headers: { Authorization: "Bearer SYNTHETIC_TOKEN" },
  });
  assert.equal(authorized.status, 200);
  assert.equal(
    authorized.json().result.structuredContent.error.code,
    "INTERNAL_ERROR",
  );
  assert.equal(
    (
      await request({
        body: call(),
        headers: { Authorization: "Bearer SYNTHETIC_TOKEN", Host: "evil:3000" },
      })
    ).status,
    403,
  );
  const unknown = await request({ body: call("SYNTHETIC_TOKEN") });
  assert.ok(unknown.json().error);
  assert.ok(
    ![authorized.text, unknown.text, ...logs]
      .join("")
      .includes("SYNTHETIC_TOKEN"),
  );
});

test("eight admitted tools, immediate overload, release after success and deadline", async (t) => {
  const work = [];
  const { request, app, clock, logs } = await fixture(t, (server) =>
    server.registerTool(
      "probe",
      {},
      (ctx) =>
        new Promise((resolve) => {
          work.push({ resolve, signal: ctx.mcpReq.signal });
        }),
    ),
  );
  const calls = Array.from({ length: 8 }, () => request({ body: call() }));
  await until(() => work.length === 8);
  assert.equal(app.admittedTools, 8);
  const excess = await request({ body: call() });
  assert.equal(
    excess.json().result.structuredContent.error.code,
    "RATE_LIMITED",
  );
  assert.equal(work.length, 8);
  assert.equal(
    excess.json().result.structuredContent.error.message,
    "Request capacity is temporarily limited. Wait before retrying.",
  );
  work[0].resolve({ content: [] });
  await calls[0];
  assert.equal(app.admittedTools, 7);
  clock.fire(30000);
  for (const result of await Promise.all(calls.slice(1)))
    assert.equal(
      result.json().result.structuredContent.error.code,
      "INTERNAL_ERROR",
    );
  await until(() => work.slice(1).every((x) => x.signal.aborted));
  assert.equal(app.admittedTools, 0);
  assert.ok(!logs.join("").includes("arguments"));
});

test("shutdown drains admitted work and rejects new admission", async (t) => {
  let finish;
  const { request, app, clock } = await fixture(t, (server) =>
    server.registerTool(
      "probe",
      {},
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
  );
  const callPromise = request({ body: call() });
  await until(() => app.admittedTools === 1 && finish);
  const shutdown = app.shutdown();
  assert.equal(app.stopping, true);
  assert.strictEqual(app.shutdown(), shutdown);
  assert.ok([...clock.jobs].some((x) => x.ms === 10000));
  finish({ content: [] });
  assert.equal((await callPromise).status, 200);
  await shutdown;
  assert.equal(app.admittedTools, 0);
  assert.equal(clock.jobs.size, 0);
});

test("shutdown forcibly cancels remaining work at ten seconds", async (t) => {
  let signal;
  const { request, app, clock } = await fixture(t, (server) =>
    server.registerTool("probe", {}, (ctx) => {
      signal = ctx.mcpReq.signal;
      return new Promise(() => {});
    }),
  );
  const pending = request({ body: call() }).catch(() => undefined);
  await until(() => signal);
  const shutdown = app.shutdown();
  clock.fire(10000);
  await shutdown;
  await pending;
  await until(() => signal.aborted);
  assert.equal(app.admittedTools, 0);
});

test("disconnect aborts SDK tool work, frees capacity, and ignores late failures", async (t) => {
  let signal, rejectTool;
  const { app, port, logs } = await fixture(t, (server) =>
    server.registerTool("probe", {}, (ctx) => {
      signal = ctx.mcpReq.signal;
      return new Promise((_resolve, reject) => {
        rejectTool = reject;
      });
    }),
  );
  const req = http.request({
    host: "127.0.0.1",
    port,
    path: "/mcp",
    method: "POST",
    headers: {
      Host: "localhost:3000",
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-11-25",
    },
  });
  req.on("error", () => {});
  req.end(call());
  await until(() => signal && app.admittedTools === 1);
  req.destroy();
  await until(() => signal.aborted && app.admittedTools === 0);
  rejectTool(new Error("SYNTHETIC_TOKEN"));
  await tick();
  assert.ok(!logs.join("").includes("SYNTHETIC_TOKEN"));
});

test("safe application envelopes and error completion release admission", async (t) => {
  const { request, app, api } = await fixture(t, (server) =>
    server.registerTool("probe", {}, () =>
      api.toolError(
        new api.ApplicationFailure("AUTHORIZATION_REQUIRED", {
          reason: "missing_session",
        }),
        api.createRequestContext(),
      ),
    ),
  );
  const result = await request({ body: call() });
  assert.equal(
    result.json().result.structuredContent.error.code,
    "AUTHORIZATION_REQUIRED",
  );
  assert.equal(app.admittedTools, 0);
});

test("initialize negotiates unknown proposals; unsupported headers and batches fail", async (t) => {
  const { request } = await fixture(t);
  const init = await request({
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "unknown",
        capabilities: {},
        clientInfo: { name: "test", version: "1" },
      },
    }),
  });
  // Official initialize contract offers a supported version when the proposal is unknown.
  assert.equal(init.json().result.protocolVersion, "2025-11-25");
  assert.equal((await request({ body: "[]" })).status, 400);
  assert.equal(
    (await request({ headers: { "MCP-Protocol-Version": "2026-07-28" } }))
      .status,
    400,
  );
  const unknown = await request({ body: call("unknown") });
  assert.ok(unknown.json().error);
  assert.equal(unknown.headers["mcp-session-id"], undefined);
});

test("shutdown rejects partially read new work and cancels incomplete uploads", async (t) => {
  const { port, app, clock } = await fixture(t);
  let response;
  const received = new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/mcp",
        method: "POST",
        headers: {
          Host: "localhost:3000",
          Accept: "application/json, text/event-stream",
          "Content-Type": "application/json",
        },
      },
      (res) => {
        response = res;
        res.resume();
        res.on("end", resolve);
      },
    );
    req.on("error", reject);
    req.write("{");
    t.after(() => req.destroy());
    app.server.once("request", async () => {
      await tick();
      const stopped = app.shutdown();
      req.end("}");
      await stopped;
    });
  });
  await received;
  assert.equal(response.statusCode, 503);
  assert.equal(app.admittedTools, 0);
  assert.equal(clock.jobs.size, 0);
});

test("duplicate Host is rejected and shutdown bounds incomplete uploads", async (t) => {
  const { app, clock, port } = await fixture(t);
  const net = require("node:net");
  await new Promise((resolve, reject) => {
    const socket = net.connect(port, "127.0.0.1", () =>
      socket.write(
        "GET /healthz HTTP/1.1\r\nHost: localhost:3000\r\nHost: evil:3000\r\nConnection: close\r\n\r\n",
      ),
    );
    let text = "";
    socket.on("data", (chunk) => (text += chunk));
    socket.on("error", reject);
    socket.on("end", () => {
      assert.match(text, /403 Forbidden/);
      resolve();
    });
  });
  const req = http.request({
    host: "127.0.0.1",
    port,
    path: "/mcp",
    method: "POST",
    headers: { Host: "localhost:3000" },
  });
  const closed = new Promise((resolve) => {
    req.on("error", resolve);
  });
  const started = new Promise((resolve) => app.server.once("request", resolve));
  req.write("{");
  await started;
  const shutdown = app.shutdown();
  clock.fire(10000);
  await shutdown;
  await closed;
  assert.equal(app.admittedTools, 0);
});

test("signal handlers install explicitly and can be removed", async (t) => {
  const { api, app } = await fixture(t);
  const before = process.listenerCount("SIGTERM");
  const remove = api.installTerminationHandlers(app);
  assert.equal(process.listenerCount("SIGTERM"), before + 1);
  remove();
  assert.equal(process.listenerCount("SIGTERM"), before);
});

test("SDK HTTP error text cannot echo secret-bearing protocol headers", async (t) => {
  const { request, logs } = await fixture(t);
  const result = await request({
    headers: { "MCP-Protocol-Version": "SYNTHETIC_TOKEN" },
  });
  assert.equal(result.status, 400);
  assert.ok(![result.text, ...logs].join("").includes("SYNTHETIC_TOKEN"));
});
