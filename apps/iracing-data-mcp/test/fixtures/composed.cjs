// Runs only as an isolated child: builtin interception never leaks into sibling tests.
// The real session store, generated client, DNS-pinned transport, gateway, HTTP server,
// and official MCP client remain composed. Only external wire boundaries are synthetic.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const dns = require("node:dns/promises");
const { EventEmitter } = require("node:events");
const { Readable } = require("node:stream");
const { syncBuiltinESMExports } = require("node:module");
const oauth = require("@iracing-data/oauth-client");
const outputFields = require("./output-fields.json");
function assertFields(value, fields) {
  assert.deepEqual(Object.keys(value).sort(), Object.keys(fields).sort());
  for (const [key, expected] of Object.entries(fields)) {
    if (typeof expected === "object") assertFields(value[key], expected);
    else
      assert.ok(
        expected
          .split("|")
          .includes(value[key] === null ? "null" : typeof value[key]),
        `unexpected field type: ${key}`,
      );
  }
}
let checks = 0,
  clockOffset = 0;
const realNow = () => Date.UTC(2030, 0, 1);
Date.now = () => realNow() + clockOffset;
const routes = [],
  output = [],
  unexpected = [];
let mode = "normal",
  wireCount = 0;
const held = [];
let abortedWires = 0;
async function until(predicate) {
  for (let i = 0; i < 1000 && !predicate(); i++)
    await new Promise(setImmediate);
  assert.ok(predicate(), "event gate did not settle");
}
const driver = {
  cust_id: 7,
  display_name: "Synthetic Driver",
  private: "SECRET",
};
const sources = {
  member: driver,
  drivers: [driver, { cust_id: 8, display_name: "Synthetic Other" }],
  cars: [{ car_id: 1, car_name: "Synthetic Car", car_name_abbreviated: "SC" }],
  tracks: [
    {
      track_id: 30,
      track_name: "Watkins Glen",
      config_name: "Full",
      category_id: 2,
      is_oval: false,
      is_dirt: false,
    },
  ],
  recent: {
    cust_id: 7,
    races: [{ subsession_id: 100, finish_position: 1, incidents: 2 }],
  },
};
sources.seasons = {
  seasons: [
    {
      season_id: 10,
      series_id: 20,
      season_name: "Synthetic Season",
      season_year: 2026,
      season_quarter: 4,
      active: true,
    },
  ],
};
sources.schedule = {
  success: true,
  season_id: 10,
  schedules: [
    {
      race_week_num: 0,
      start_date: "2026-10-01",
      week_end_time: "2026-10-07T23:59:59Z",
      series_id: 20,
      series_name: "Synthetic Series",
      track: { track_id: 30, track_name: "Watkins Glen", config_name: "Full" },
    },
  ],
};
const result = (id, finish) => ({
  subsession_id: id,
  track: { track_id: 30, track_name: "Watkins Glen" },
  session_results: [
    {
      simsession_number: 0,
      results: [
        {
          cust_id: 7,
          display_name: "Synthetic Driver",
          starting_position: 0,
          finish_position: finish,
          incidents: 2,
        },
      ],
    },
  ],
});
sources.result100 = result(100, 1);
sources.result101 = result(101, 2);
sources.chunk = [100, 101].map((id) => ({
  subsession_id: id,
  start_time: "2026-10-01T00:00:00Z",
  event_type: 5,
  track: { track_id: 30, track_name: "Watkins Glen" },
}));
const mapping = {
  "/data/series/season_list": "seasons",
  "/data/series/season_schedule": "schedule",
  "/data/results/get": "result",
  "/data/member/info": "member",
  "/data/lookup/drivers": "drivers",
  "/data/car/get": "cars",
  "/data/track/get": "tracks",
  "/data/stats/member_recent_races": "recent",
};
dns.lookup = async (hostname, options) => {
  assert.ok(
    ["members-ng.iracing.com", "scorpio-assets.s3.amazonaws.com"].includes(
      hostname,
    ),
  );
  assert.deepEqual(options, { all: true });
  return [{ address: "8.8.8.8", family: 4 }];
};
https.request = (url, options, callback) => {
  const request = new EventEmitter();
  request.destroy = () => {};
  request.end = () =>
    queueMicrotask(() => {
      try {
        if (mode === "hold") {
          const onAbort = () => {
            abortedWires++;
            request.emit("error", new Error("synthetic cancellation"));
          };
          held.push(() => {
            options.signal.removeEventListener("abort", onAbort);
            request.end();
          });
          options.signal.addEventListener("abort", onAbort, { once: true });
          return;
        }
        wireCount++;
        if (mode === "rate") {
          const incoming = Readable.from([Buffer.from("SECRET upstream")]);
          incoming.statusCode = 429;
          incoming.headers = { "retry-after": "2" };
          callback(incoming);
          return;
        }
        assert.equal(options.method, "GET");
        assert.equal(options.rejectUnauthorized, true);
        assert.equal(options.agent, false);
        assert.equal(options.headers.cookie, undefined);
        if (url.hostname === "members-ng.iracing.com") {
          const queries = {
            "/data/member/info": {},
            "/data/lookup/drivers": { search_term: "Synthetic" },
            "/data/stats/member_recent_races": {},
            "/data/car/get": {},
            "/data/track/get": {},
            "/data/series/season_list": { include_series: "false" },
            "/data/series/season_schedule": { season_id: "10" },
            "/data/results/search_series": {
              cust_id: "7",
              season_year: "2026",
              season_quarter: "4",
              event_types: "5",
            },
            "/data/results/get": {
              subsession_id: url.searchParams.get("subsession_id"),
              include_licenses: "false",
            },
          };
          assert.ok(
            Object.hasOwn(queries, url.pathname),
            "unadvertised API route",
          );
          assert.deepEqual(
            Object.fromEntries(url.searchParams),
            queries[url.pathname],
          );
          if (url.pathname === "/data/results/get")
            assert.ok(
              ["100", "101"].includes(url.searchParams.get("subsession_id")),
            );
        }
        let value;
        if (url.hostname === "members-ng.iracing.com") {
          if (url.pathname === "/data/results/search_series") {
            assert.match(options.headers.authorization, /^Bearer /);
            routes.push(url.pathname + url.search);
            const incoming = Readable.from([
              Buffer.from(
                JSON.stringify({
                  type: "search_series_results",
                  data: {
                    success: true,
                    params: {},
                    chunk_info: {
                      chunk_size: 2,
                      rows: 2,
                      num_chunks: 1,
                      base_download_url:
                        "https://scorpio-assets.s3.amazonaws.com/",
                      chunk_file_names: ["chunk"],
                    },
                  },
                }),
              ),
            ]);
            incoming.statusCode = 200;
            incoming.headers = {};
            callback(incoming);
            return;
          }
          let key = mapping[url.pathname];
          if (key === "result") key += url.searchParams.get("subsession_id");
          assert.ok(key, "unexpected canonical API method");
          assert.match(options.headers.authorization, /^Bearer /);
          routes.push(url.pathname + url.search);
          value = {
            link: `https://scorpio-assets.s3.amazonaws.com/${key}?signature=SECRET`,
            expires: new Date(Date.now() + 900000).toISOString(),
          };
        } else {
          assert.equal(url.hostname, "scorpio-assets.s3.amazonaws.com");
          assert.equal(options.headers.authorization, undefined);
          value = sources[url.pathname.slice(1)];
          assert.ok(value, "unexpected cache route");
        }
        const incoming = Readable.from([Buffer.from(JSON.stringify(value))]);
        incoming.statusCode = 200;
        incoming.headers = { "content-type": "application/json" };
        callback(incoming);
      } catch (error) {
        unexpected.push(error.message);
        request.emit("error", error);
      }
    });
  return request;
};
syncBuiltinESMExports();
global.fetch = () => {
  throw new Error("unexpected external fetch");
};
async function main() {
  const api = await import("../../dist/index.js");
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-contract-"));
  await fs.chmod(dir, 0o700);
  const file = path.join(dir, "credentials.json");
  const jwt = `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.SECRET`;
  await oauth.writeOAuthTokenDocument(file, {
    access_token: jwt,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "REFRESH_SECRET",
    scope: "iracing.auth",
  });
  const services = await api.createMcpServices({
    credentialFile: file,
    clientMetadata: {
      clientId: "fixture",
      redirectUri: "http://127.0.0.1:0/callback",
      scopes: ["iracing.auth"],
    },
  });
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services,
  });
  await app.listen(0, "127.0.0.1");
  let targetPort = app.server.address().port;
  const request = (method, body, headers = {}, route = "/mcp") =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port: targetPort,
          path: route,
          method,
          headers: { Host: "127.0.0.1:3000", ...headers },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () => {
            output.push(text);
            resolve(
              new Response(text || null, {
                status: res.statusCode,
                headers: res.headers,
              }),
            );
          });
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  const client = new Client(
    { name: "contract-fixture", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3000/mcp"), {
        fetch: (_url, init) =>
          request(
            init.method,
            init.body,
            Object.fromEntries(new Headers(init.headers)),
          ),
      }),
    );
    const tools = (await client.listTools()).tools;
    assert.deepEqual(
      tools,
      JSON.parse(
        await fs.readFile(path.join(__dirname, "tool-list.json"), "utf8"),
      ),
    );
    assert.deepEqual(
      tools.map((t) => t.name),
      [
        "get_my_driver",
        "find_drivers",
        "get_recent_races",
        "lookup_content",
        "list_series_seasons",
        "get_series_schedule",
        "get_race_result",
        "search_driver_races",
      ],
    );
    checks++;
    for (const tool of tools) {
      assert.equal(tool.inputSchema.type, "object");
      for (const schema of tool.inputSchema.anyOf ?? [tool.inputSchema])
        assert.equal(schema.additionalProperties, false);
      assert.equal(tool.annotations.readOnlyHint, true);
      checks++;
    }
    const call = async (name, args = {}) => {
      const result = await client.callTool({ name, arguments: args });
      output.push(JSON.stringify(result));
      assert.ok(!result.isError);
      assert.deepEqual(
        JSON.parse(result.content[0].text),
        result.structuredContent,
      );
      assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
      const value = result.structuredContent;
      const kind = {
        get_my_driver: "driver",
        find_drivers: "driver",
        get_recent_races: "recent",
        lookup_content: args.kind === "tracks" ? "track" : "car",
        list_series_seasons: "season",
        get_series_schedule: "schedule",
        get_race_result: "participant",
        search_driver_races: "search",
      }[name];
      if (name === "get_my_driver") assertFields(value, outputFields[kind]);
      else {
        assert.equal(typeof value.returned_count, "number");
        assert.equal(typeof value.complete, "boolean");
        const rows = value.items ?? value.races;
        rows.forEach((row) => assertFields(row, outputFields[kind]));
      }
      checks++;
      return value;
    };
    assert.deepEqual(await call("get_my_driver"), {
      cust_id: 7,
      display_name: "Synthetic Driver",
    });
    const first = await call("find_drivers", { query: "Synthetic", limit: 1 });
    assert.equal(first.ambiguous, true);
    const next = await call("find_drivers", { cursor: first.next_cursor });
    assert.equal(next.items[0].cust_id, 8);
    assert.deepEqual(
      await call("find_drivers", { cursor: first.next_cursor }),
      next,
    );
    assert.equal((await call("get_recent_races")).races[0].subsession_id, 100);
    assert.equal(
      (await call("lookup_content", { kind: "cars", ids: [1] })).items[0]
        .car_name,
      "Synthetic Car",
    );
    assert.equal(
      (await call("lookup_content", { kind: "tracks", query: "Watkins Glen" }))
        .items[0].track_id,
      30,
    );
    assert.deepEqual(routes, [
      "/data/member/info",
      "/data/lookup/drivers?search_term=Synthetic",
      "/data/stats/member_recent_races",
      "/data/car/get",
      "/data/track/get",
    ]);
    assert.equal((await call("list_series_seasons")).items[0].season_id, 10);
    assert.equal(
      (await call("get_series_schedule", { season_id: 10 })).items[0].track
        .track_id,
      30,
    );
    const search = await call("search_driver_races", {
      cust_id: 7,
      range: { season_year: 2026, season_quarter: 4 },
      track_ids: [30],
    });
    assert.equal(search.complete, true);
    assert.equal(search.source_total, 2);
    assert.ok(search.items.every((row) => !("finish_position" in row)));
    const raceA = await call("get_race_result", {
      subsession_id: 100,
      cust_ids: [7],
    });
    const raceB = await call("get_race_result", {
      subsession_id: 101,
      cust_ids: [7],
    });
    assert.equal(raceA.items[0].finish_position, 2);
    assert.equal(raceB.items[0].finish_position, 3);
    assert.equal(raceA.position_basis, "one_based");
    assert.ok(
      routes.includes(
        "/data/results/get?subsession_id=100&include_licenses=false",
      ),
    );
    for (const route of ["/oauth/login", "/oauth/callback"]) {
      assert.equal((await request("GET", undefined, {}, route)).status, 404);
      checks++;
    }
    assert.equal(
      (await request("POST", "{}", { Host: "evil.invalid" })).status,
      403,
    );
    checks++;
    const headers = {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-11-25",
    };
    for (const [body, changes, status] of [
      ["{}", { Origin: "http://evil.invalid" }, 403],
      ["[]", {}, 400],
      ["{", {}, 400],
      ["{}", { "MCP-Protocol-Version": "unsupported" }, 400],
      [" ".repeat(65537), {}, 413],
    ]) {
      assert.equal(
        (await request("POST", body, { ...headers, ...changes })).status,
        status,
      );
      checks++;
    }
    const negotiate = await request(
      "POST",
      JSON.stringify({
        jsonrpc: "2.0",
        id: 700,
        method: "initialize",
        params: {
          protocolVersion: "unknown",
          capabilities: {},
          clientInfo: { name: "fixture", version: "1" },
        },
      }),
      headers,
    );
    assert.equal((await negotiate.json()).result.protocolVersion, "2025-11-25");
    checks++;
    const before = routes.length;
    for (const tool of tools) {
      const invalid = await client.callTool({
        name: tool.name,
        arguments: { token: "SECRET" },
      });
      assert.equal(invalid.isError, true);
      assert.equal(invalid.structuredContent.error.code, "INVALID_INPUT");
      output.push(JSON.stringify(invalid));
      checks++;
    }
    assert.equal(routes.length, before);
    sources.drivers = Array.from({ length: 101 }, (_, i) => ({
      cust_id: i + 1,
      display_name: "x".repeat(900),
    }));
    const capped = await call("find_drivers", {
      query: "Synthetic",
      limit: 100,
    });
    assert.ok(capped.returned_count < 100);
    assert.ok(capped.next_cursor);
    sources.drivers = [{ cust_id: 7, display_name: "x".repeat(40000) }];
    const oversized = await client.callTool({
      name: "find_drivers",
      arguments: { query: "Synthetic" },
    });
    assert.equal(
      oversized.structuredContent.error.code,
      "RESPONSE_LIMIT_EXCEEDED",
    );
    output.push(JSON.stringify(oversized));
    checks++;
    const missing = await api.createMcpServices({
      credentialFile: path.join(dir, "missing.json"),
      clientMetadata: {
        clientId: "fixture",
        redirectUri: "http://127.0.0.1:0/callback",
      },
    });
    assert.equal(missing.authorizationState(), "authorization_required");
    await assert.rejects(missing.dataApiConfiguration.accessToken());
    checks++;
    await fs.writeFile(file, "corrupt SECRET", { mode: 0o600 });
    const corrupt = await api.createMcpServices({
      credentialFile: file,
      clientMetadata: {
        clientId: "fixture",
        redirectUri: "http://127.0.0.1:0/callback",
      },
    });
    assert.equal(corrupt.authorizationState(), "authorization_required");
    checks++;

    clockOffset = 300001;
    const expiredCursor = await client.callTool({
      name: "find_drivers",
      arguments: { cursor: first.next_cursor },
    });
    assert.equal(expiredCursor.structuredContent.error.code, "CURSOR_EXPIRED");
    output.push(JSON.stringify(expiredCursor));
    checks++;
    clockOffset = 0;
    const expiredJwt = `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from('{"exp":1}').toString("base64url")}.SECRET`;
    const token = {
      access_token: expiredJwt,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "REFRESH_SECRET",
      scope: "iracing.auth",
    };
    await oauth.writeOAuthTokenDocument(file, token, { overwrite: true });
    const metadata = {
      clientId: "fixture",
      redirectUri: "http://127.0.0.1:0/callback",
    };
    const rotating = await api.createMcpServices({
      credentialFile: file,
      clientMetadata: metadata,
    });
    let grants = 0,
      release;
    const gate = new Promise((resolve) => (release = resolve));
    global.fetch = async (url, init) => {
      assert.equal(String(url), "https://oauth.iracing.com/oauth2/token");
      assert.equal(init.method, "POST");
      const body = new URLSearchParams(init.body);
      assert.equal(body.get("grant_type"), "refresh_token");
      assert.equal(body.get("refresh_token"), "REFRESH_SECRET");
      grants++;
      await gate;
      return Response.json({
        ...token,
        access_token: jwt,
        refresh_token: "ROTATED_SECRET",
      });
    };
    const pending = Array.from({ length: 8 }, () =>
      rotating.dataApiConfiguration.accessToken(),
    );
    release();
    await Promise.all(pending);
    assert.equal(grants, 1);
    assert.equal(
      (await oauth.readOAuthTokenDocument(file)).refresh_token,
      "ROTATED_SECRET",
    );
    checks++;
    await oauth.writeOAuthTokenDocument(file, token, { overwrite: true });
    const persistence = await api.createMcpServices({
      credentialFile: file,
      clientMetadata: metadata,
      fileSystem: {
        rename: async () => {
          throw new Error("SECRET persistence");
        },
      },
    });
    await assert.rejects(persistence.dataApiConfiguration.accessToken());
    assert.equal(persistence.authorizationState(), "authorization_required");
    checks++;
    for (const [errorCode, status, expectedState] of [
      ["temporarily_unavailable", 400, "ready"],
      ["temporarily_unavailable", 503, "authorization_required"],
      ["invalid_grant", 400, "authorization_required"],
    ]) {
      await oauth.writeOAuthTokenDocument(file, token, { overwrite: true });
      const failedRefresh = await api.createMcpServices({
        credentialFile: file,
        clientMetadata: metadata,
      });
      global.fetch = async (url, init) => {
        assert.equal(String(url), "https://oauth.iracing.com/oauth2/token");
        assert.equal(init.method, "POST");
        return Response.json(
          { error: errorCode, error_description: "SECRET" },
          { status },
        );
      };
      await assert.rejects(failedRefresh.dataApiConfiguration.accessToken());
      assert.equal(failedRefresh.authorizationState(), expectedState);
      checks++;
    }
    global.fetch = () => {
      throw new Error("unexpected external fetch");
    };
    mode = "hold";
    const admitted = Array.from({ length: 8 }, () =>
      client.callTool({ name: "get_my_driver", arguments: {} }),
    );
    await until(() => app.admittedTools === 8 && held.length === 1);
    const excess = await client.callTool({
      name: "get_my_driver",
      arguments: {},
    });
    assert.equal(excess.structuredContent.error.code, "RATE_LIMITED");
    output.push(JSON.stringify(excess));
    assert.equal(held.length, 1);
    checks++;
    mode = "normal";
    held.splice(0).forEach((release) => release());
    for (const value of await Promise.all(admitted)) {
      assert.ok(!value.isError);
      output.push(JSON.stringify(value));
    }
    assert.equal(app.admittedTools, 0);
    mode = "hold";
    const cancel = http.request({
      host: "127.0.0.1",
      port: targetPort,
      path: "/mcp",
      method: "POST",
      headers: { Host: "127.0.0.1:3000", ...headers },
    });
    cancel.on("error", () => {});
    cancel.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 900,
        method: "tools/call",
        params: { name: "get_my_driver", arguments: {} },
      }),
    );
    await until(() => held.length === 1);
    const priorAborts = abortedWires;
    cancel.destroy();
    await until(() => abortedWires > priorAborts && app.admittedTools === 0);
    held.length = 0;
    mode = "normal";
    checks++;
    assert.deepEqual(await call("get_my_driver"), {
      cust_id: 7,
      display_name: "Synthetic Driver",
    });
    mode = "hold";
    const networkA = client.callTool({ name: "get_my_driver", arguments: {} });
    const networkB = client.callTool({
      name: "lookup_content",
      arguments: { kind: "cars" },
    });
    await until(() => held.length === 2);
    const networkExcess = await client.callTool({
      name: "lookup_content",
      arguments: { kind: "tracks" },
    });
    assert.equal(networkExcess.structuredContent.error.code, "RATE_LIMITED");
    assert.equal(held.length, 2);
    output.push(JSON.stringify(networkExcess));
    checks++;
    mode = "normal";
    held.splice(0).forEach((release) => release());
    for (const value of await Promise.all([networkA, networkB])) {
      assert.ok(!value.isError);
      output.push(JSON.stringify(value));
    }
    mode = "rate";
    const rate = await client.callTool({
      name: "get_my_driver",
      arguments: {},
    });
    assert.equal(rate.structuredContent.error.code, "RATE_LIMITED");
    output.push(JSON.stringify(rate));
    const rateCount = wireCount;
    const sharedRate = await client.callTool({
      name: "lookup_content",
      arguments: { kind: "cars" },
    });
    assert.equal(sharedRate.structuredContent.error.code, "RATE_LIMITED");
    output.push(JSON.stringify(sharedRate));
    assert.equal(wireCount, rateCount);
    checks++;
    mode = "normal";
    clockOffset = 2001;
    assert.deepEqual(await call("get_my_driver"), {
      cust_id: 7,
      display_name: "Synthetic Driver",
    });
    clockOffset = 0;
    await oauth.writeOAuthTokenDocument(
      file,
      { ...token, access_token: jwt },
      { overwrite: true },
    );
    for (const [ownedServices, expectedCode] of [
      [missing, "AUTHORIZATION_REQUIRED"],
      [
        await api.createMcpServices({
          credentialFile: file,
          clientMetadata: metadata,
        }),
        "CURSOR_EXPIRED",
      ],
    ]) {
      const restarted = api.createHttpApplication({
        config: api.parseMcpApplicationConfig(),
        services: ownedServices,
      });
      await restarted.listen(0, "127.0.0.1");
      targetPort = restarted.server.address().port;
      const nextClient = new Client(
        { name: "restart-contract", version: "1" },
        { supportedProtocolVersions: ["2025-11-25"] },
      );
      try {
        await nextClient.connect(
          new StreamableHTTPClientTransport(
            new URL("http://127.0.0.1:3000/mcp"),
            {
              fetch: (_url, init) =>
                request(
                  init.method,
                  init.body,
                  Object.fromEntries(new Headers(init.headers)),
                ),
            },
          ),
        );
        assert.deepEqual((await nextClient.listTools()).tools, tools);
        const result = await nextClient.callTool({
          name: "find_drivers",
          arguments: { cursor: capped.next_cursor },
        });
        assert.equal(result.structuredContent.error.code, expectedCode);
        output.push(JSON.stringify(result));
        checks++;
      } finally {
        await nextClient.close();
        await restarted.shutdown();
        targetPort = app.server.address().port;
      }
    }
    assert.deepEqual(unexpected, []);
    assert.doesNotMatch(
      output.join(""),
      /SECRET|Bearer|scorpio-assets|credentials\.json|"private"/,
    );
  } finally {
    await client.close();
    await app.shutdown();
    await fs.rm(dir, { recursive: true, force: true });
  }
  process.send?.({ checks });
}
main().catch(() => {
  console.error("Independent composition contract failed");
  process.exitCode = 1;
});
