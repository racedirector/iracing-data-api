const assert = require("node:assert/strict");
const test = require("node:test");
const { Configuration } = require("@iracing-data/api-client-fetch");

const tick = () => new Promise((resolve) => setImmediate(resolve));

async function until(predicate) {
  for (let i = 0; i < 200 && !predicate(); i++) await tick();
  assert.ok(predicate());
}

async function fixture(t, { registerTools, services } = {}) {
  const api = await import("../dist/index.js");
  const allowedHosts = [];
  let session = 0;
  const sharedServices =
    services ??
    Object.freeze({
      authorizationState: () => "ready",
      shutdownAuthorizationOwner: async () => {},
    });
  const app = api.createHttpApplication({
    config: api.parseMcpApplicationConfig(),
    services: sharedServices,
    registerTools,
    allowedHosts,
    allowedOrigins: [],
    sessionIdGenerator: () => `session-${++session}`,
  });

  await app.listen(0, "127.0.0.1");
  t.after(() => app.shutdown());
  const port = app.server.address().port;
  allowedHosts.push(`127.0.0.1:${port}`);
  const url = new URL(`http://127.0.0.1:${port}/mcp`);

  return { api, app, sharedServices, url };
}

function initializeBody(id = 1) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "session-lifetime-test", version: "1" },
    },
  });
}

function headers(sessionId) {
  return {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
    "MCP-Protocol-Version": "2025-11-25",
    ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
  };
}

async function toolServices() {
  const { createDriverQueries } = await import("../dist/adapters/driver.js");
  const { createRecentRaceQueries } =
    await import("../dist/adapters/recent-races.js");
  const driver = {
    cust_id: 1,
    display_name: "Synthetic Driver",
    account: "ACCOUNT_SECRET",
  };
  const recent = {
    cust_id: 1,
    races: [{ subsession_id: 100, incidents: 3 }],
  };
  const transport = async (url, init) => {
    const target = new URL(url);
    if (target.hostname === "members-ng.iracing.com") {
      const key = target.pathname.includes("member/info") ? "member" : "recent";
      return Response.json({
        link: `https://cache.example.test/synthetic/${key}`,
        expires: new Date(Date.now() + 900000).toISOString(),
      });
    }

    assert.equal(new Headers(init.headers).has("authorization"), false);
    assert.equal(init.redirect, "error");
    return Response.json(target.pathname.endsWith("/member") ? driver : recent);
  };
  const configuration = new Configuration({
    accessToken: async () => "TOKEN_SECRET",
    fetchApi: transport,
  });
  return Object.freeze({
    oauthClient: {},
    dataApiConfiguration: configuration,
    getDriverQueries: () => createDriverQueries(configuration),
    getRecentRaceQueries: () => createRecentRaceQueries(configuration),
    authorizationState: () => "ready",
    shutdownAuthorizationOwner: async () => {},
  });
}

test("official MCP client preserves one logical session across initialize, list and real tool calls", async (t) => {
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  const api = await import("../dist/index.js");
  const services = await toolServices();
  let registrations = 0;
  let seenServices;
  const { app, sharedServices, url } = await fixture(t, {
    services,
    registerTools(server, injectedServices) {
      registrations++;
      seenServices = injectedServices;
      server.registerTool("probe", {}, () => ({
        content: [{ type: "text", text: "ok" }],
      }));
    },
  });
  const transport = new StreamableHTTPClientTransport(url);
  const client = new Client(
    { name: "official-session-test", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );

  t.after(() => client.close().catch(() => {}));
  await client.connect(transport);
  const sessionId = transport.sessionId;
  assert.equal(sessionId, "session-1");
  assert.equal(app.activeSessions, 1);
  assert.equal(registrations, 1);
  assert.strictEqual(seenServices, sharedServices);

  const tools = await client.listTools();
  assert.ok(tools.tools.some((tool) => tool.name === "probe"));
  assert.ok(tools.tools.some((tool) => tool.name === "get_recent_races"));
  assert.ok(tools.tools.some((tool) => tool.name === "get_my_driver"));
  assert.equal(
    (await client.callTool({ name: "probe", arguments: {} })).content[0].text,
    "ok",
  );

  const recent = await client.callTool({
    name: "get_recent_races",
    arguments: { cust_id: 1, limit: 1 },
  });
  assert.ok(!recent.isError, JSON.stringify(recent));
  assert.deepEqual(
    recent.structuredContent.races.map((item) => item.subsession_id),
    [100],
  );

  const identity = await client.callTool({
    name: "get_my_driver",
    arguments: {},
  });
  assert.ok(!identity.isError, JSON.stringify(identity));
  assert.deepEqual(identity.structuredContent, {
    cust_id: 1,
    display_name: "Synthetic Driver",
  });
  assert.doesNotMatch(JSON.stringify(identity), /ACCOUNT_SECRET|TOKEN_SECRET/);
  assert.equal(transport.sessionId, sessionId);
  assert.equal(app.activeSessions, 1);
  assert.equal(registrations, 1);

  await transport.terminateSession();
  assert.equal(app.activeSessions, 0);

  const stale = await fetch(url, {
    method: "POST",
    headers: headers(sessionId),
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 9,
      method: "tools/list",
      params: {},
    }),
  });
  assert.equal(stale.status, 404);
  assert.equal(await stale.text(), "Session not found.");
});

test("request abort cancels tool work without terminating its MCP session", async (t) => {
  let toolSignal;
  const { app, url } = await fixture(t, {
    registerTools(server) {
      server.registerTool("probe", {}, (ctx) => {
        toolSignal = ctx.mcpReq.signal;
        return new Promise(() => {});
      });
    },
  });
  const initialized = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: initializeBody(),
  });
  assert.equal(initialized.status, 200);
  const sessionId = initialized.headers.get("mcp-session-id");
  assert.equal(sessionId, "session-1");
  await initialized.text();
  assert.equal(app.activeSessions, 1);

  const controller = new AbortController();
  const pending = fetch(url, {
    method: "POST",
    headers: headers(sessionId),
    signal: controller.signal,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "probe", arguments: {} },
    }),
  }).catch(() => undefined);

  await until(() => toolSignal);
  controller.abort();
  await pending;
  await until(() => toolSignal.aborted);
  assert.equal(app.activeSessions, 1);

  const listed = await fetch(url, {
    method: "POST",
    headers: headers(sessionId),
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/list",
      params: {},
    }),
  });
  assert.equal(listed.status, 200);
  assert.ok(
    (await listed.json()).result.tools.some((tool) => tool.name === "probe"),
  );
  assert.equal(app.activeSessions, 1);

  const terminated = await fetch(url, {
    method: "DELETE",
    headers: headers(sessionId),
  });
  assert.equal(terminated.status, 200);
  await terminated.text();
  assert.equal(app.activeSessions, 0);
});

test("shutdown disposes MCP sessions before the process authorization owner", async (t) => {
  let authorizationShutdowns = 0;
  const services = Object.freeze({
    authorizationState: () => "ready",
    shutdownAuthorizationOwner: async () => {
      authorizationShutdowns++;
    },
  });
  const { app, url } = await fixture(t, { services });
  const initialized = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: initializeBody(),
  });
  assert.equal(initialized.status, 200);
  assert.equal(initialized.headers.get("mcp-session-id"), "session-1");
  await initialized.text();
  assert.equal(app.activeSessions, 1);

  await app.shutdown();
  assert.equal(app.activeSessions, 0);
  assert.equal(authorizationShutdowns, 1);
});
