const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { Configuration } = require("@iracing-data/api-client-fetch");

const names = ["get_my_driver", "get_recent_races"];

function race(id) {
  return {
    subsession_id: id,
    series_id: 20,
    series_name: "Synthetic Series",
    season_year: 2026,
    season_quarter: 4,
    track: { track_id: 30, track_name: "Synthetic Raceway" },
    car_id: 40,
    session_start_time: "2030-01-01T01:00:00Z",
    start_position: -1,
    finish_position: 0,
    laps: 10,
    incidents: 2,
    points: 3,
    oldi_rating: 1500,
    newi_rating: 1502,
    private: "SECRET",
  };
}

async function fixture(t, data = {}, options = {}) {
  const api = {
    ...(await import("../dist/index.js")),
    ...(await import("@iracing-data/mcp")),
  };
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  const { createDriverQueries } = await import("../dist/adapters/driver.js");
  const { createRecentRaceQueries } =
    await import("../dist/adapters/recent-races.js");

  let state = "ready";
  const requests = [];
  const sources = {
    member: { cust_id: 1, display_name: "Synthetic Driver", secret: "SECRET" },
    recent: {
      cust_id: 1,
      races: Array.from({ length: 12 }, (_, i) => race(i + 1)),
    },
    ...data,
  };
  const transport = async (url, init) => {
    requests.push({ url: new URL(url), init });
    if (options.transport)
      return options.transport(new URL(url), init, sources);
    if (new URL(url).hostname === "members-ng.iracing.com") {
      const key = new URL(url).pathname.includes("recent_races")
        ? "recent"
        : "member";
      return Response.json({
        link: `https://cache.example.test/${key}?signature=SECRET`,
        expires: new Date(Date.now() + 900000).toISOString(),
      });
    }
    assert.equal(new Headers(init.headers).has("authorization"), false);
    assert.equal(init.redirect, "error");
    return Response.json(sources[new URL(url).pathname.slice(1)]);
  };
  const configuration = new Configuration({
    accessToken: async () => "TOKEN_SECRET",
    fetchApi: transport,
  });
  const driverQueries = createDriverQueries(configuration);
  const recentRaceQueries = createRecentRaceQueries(configuration);
  const authorize = () => {
    if (state !== "ready")
      throw new api.ApplicationFailure("AUTHORIZATION_REQUIRED");
  };

  const services = {
    oauthClient: {},
    dataApiConfiguration: configuration,
    authorizationState: () => state,
    getDriverQueries: () => {
      authorize();
      return driverQueries;
    },
    getRecentRaceQueries: () => {
      authorize();
      return recentRaceQueries;
    },
  };
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
  });
  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());

  const request = (method, body, headers = {}, signal) =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port: app.server.address().port,
          path: "/mcp",
          method,
          signal,
          headers: { Host: "127.0.0.1:3000", ...headers },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () =>
            resolve(
              new Response(text || null, {
                status: res.statusCode,
                headers: res.headers,
              }),
            ),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  const client = new Client(
    { name: "offline-tools", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3000/mcp"), {
      fetch: (_url, init) =>
        request(
          init.method,
          init.body,
          Object.fromEntries(new Headers(init.headers)),
          init.signal,
        ),
    }),
  );
  t.after(() => client.close());

  return {
    app,
    client,
    requests,
    sources,
    call: (name, args = {}) => client.callTool({ name, arguments: args }),
    setState: (value) => {
      state = value;
    },
  };
}

function success(result) {
  assert.ok(!result.isError, JSON.stringify(result));
  assert.equal(
    result.content[0].text,
    JSON.stringify(result.structuredContent),
  );
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|signature|private/);
  return result.structuredContent;
}

function failure(result, code) {
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, code);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|stack|cause/);
}

test("only two tools are listed, and both preserve stable projections", async (t) => {
  const f = await fixture(t);
  assert.deepEqual(
    (await f.client.listTools()).tools.map((x) => x.name),
    names,
  );
  assert.deepEqual(success(await f.call("get_my_driver")), {
    cust_id: 1,
    display_name: "Synthetic Driver",
  });
  const recent = success(await f.call("get_recent_races"));
  assert.equal(recent.races.length, 10);
  assert.equal(recent.position_basis, "upstream");
  assert.equal(recent.complete, true);
  assert.equal(recent.races[0].start_position, -1);
  assert.equal(recent.races[0].finish_position, 0);
  assert.equal(recent.races[0].track_id, 30);
  assert.equal("track" in recent.races[0], false);
  assert.equal(
    success(await f.call("get_recent_races", { cust_id: 1, limit: 2 }))
      .returned_count,
    2,
  );
  failure(
    await f.call("get_recent_races", { cust_id: 2 }),
    "DATA_RESOLUTION_FAILED",
  );
  assert.deepEqual(
    f.requests
      .filter((x) => x.url.hostname === "members-ng.iracing.com")
      .map((x) => x.url.pathname),
    [
      "/data/member/info",
      "/data/stats/member_recent_races",
      "/data/stats/member_recent_races",
      "/data/stats/member_recent_races",
    ],
  );
});

test("invalid arguments and authorization failures never reach the network", async (t) => {
  const f = await fixture(t);
  for (const [name, args] of [
    ["get_my_driver", { token: "SECRET" }],
    ["get_my_driver", { cust_id: 1 }],
    ["get_recent_races", { limit: 0 }],
    ["get_recent_races", { limit: 11 }],
    ["get_recent_races", { cust_id: "1" }],
  ])
    failure(await f.call(name, args), "INVALID_INPUT");
  assert.equal(f.requests.length, 0);

  f.setState("authorization_required");
  failure(await f.call("get_my_driver"), "AUTHORIZATION_REQUIRED");
  failure(await f.call("get_recent_races"), "AUTHORIZATION_REQUIRED");
  assert.equal(f.requests.length, 0);
  assert.deepEqual(
    (await f.client.listTools()).tools.map((x) => x.name),
    names,
  );
});

test("invalid upstream payloads, unauthorized upstream and output caps are sanitized", async (t) => {
  const f = await fixture(t, {
    member: { cust_id: "SECRET", display_name: "Driver" },
  });
  failure(await f.call("get_my_driver"), "DATA_RESOLUTION_FAILED");

  const noFields = await fixture(t, {
    recent: { cust_id: 1, races: [{ subsession_id: 100 }] },
  });
  const recent = success(await noFields.call("get_recent_races"));
  assert.equal(recent.races[0].points, null);
  assert.equal(recent.races[0].track_id, null);
  noFields.sources.recent.races[0].points = "SECRET";
  failure(await noFields.call("get_recent_races"), "DATA_RESOLUTION_FAILED");

  const denied = await fixture(
    t,
    {},
    {
      transport: async () => new Response("SECRET", { status: 401 }),
    },
  );
  failure(await denied.call("get_my_driver"), "UPSTREAM_UNAUTHORIZED");

  const large = await fixture(t, {
    member: { cust_id: 1, display_name: "x".repeat(40000) },
  });
  failure(await large.call("get_my_driver"), "RESPONSE_LIMIT_EXCEEDED");
});

test("request cancellation reaches the concrete Fetch dependency", async (t) => {
  let signal;
  let started;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const f = await fixture(
    t,
    {},
    {
      transport: async (_url, init) => {
        signal = init.signal;
        started();
        return new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        });
      },
    },
  );
  const req = http.request({
    host: "127.0.0.1",
    port: f.app.server.address().port,
    path: "/mcp",
    method: "POST",
    headers: {
      Host: "127.0.0.1:3000",
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-11-25",
    },
  });
  req.on("error", () => {});
  req.end(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 99,
      method: "tools/call",
      params: { name: "get_my_driver", arguments: {} },
    }),
  );
  await ready;
  req.destroy();
  for (let i = 0; i < 50 && !signal.aborted; i++)
    await new Promise(setImmediate);
  assert.equal(signal.aborted, true);
});
