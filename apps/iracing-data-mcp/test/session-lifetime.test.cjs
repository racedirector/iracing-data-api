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

async function toolServices(api) {
  const now = Date.now();
  const driver = {
    cust_id: 1,
    display_name: "Synthetic Driver",
    account: "ACCOUNT_SECRET",
  };
  const cars = [
    {
      car_id: 2,
      car_name: "Synthetic GT",
      car_name_abbreviated: "SGT",
      price: 99,
    },
    {
      car_id: 1,
      car_name: "Synthetic MX-5",
      car_name_abbreviated: "SMX",
      price: 99,
    },
  ];
  const gateway = new api.DataApiGateway({
    configuration: new Configuration({
      accessToken: async () => "TOKEN_SECRET",
    }),
    authorizationState: () => "ready",
    now: () => now,
    logger: api.createDiagnosticLogger(() => {}),
    transport: async (url, init) => {
      if (url.hostname === "members-ng.iracing.com") {
        const key = url.pathname.includes("member/info") ? "member" : "cars";
        return Response.json({
          link: `https://scorpio-assets.s3.amazonaws.com/synthetic/${key}`,
          expires: new Date(now + 900000).toISOString(),
        });
      }

      assert.equal(new Headers(init.headers).has("authorization"), false);
      return Response.json(url.pathname.endsWith("/member") ? driver : cars);
    },
  });

  return Object.freeze({
    oauthClient: {},
    dataApiConfiguration: {},
    dataApiGateway: gateway,
    authorizationState: () => "ready",
    shutdownAuthorizationOwner: async () => {},
  });
}

test("official MCP client preserves one logical session across initialize, list and real tool calls", async (t) => {
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  const api = await import("../dist/index.js");
  const services = await toolServices(api);
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
  assert.ok(tools.tools.some((tool) => tool.name === "lookup_content"));
  assert.ok(tools.tools.some((tool) => tool.name === "get_my_driver"));
  assert.equal(
    (await client.callTool({ name: "probe", arguments: {} })).content[0].text,
    "ok",
  );

  const content = await client.callTool({
    name: "lookup_content",
    arguments: { kind: "cars", query: "MX-5" },
  });
  assert.ok(!content.isError, JSON.stringify(content));
  assert.deepEqual(
    content.structuredContent.items.map((item) => item.car_id),
    [1],
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

test("request abort releases tool admission without terminating its MCP session", async (t) => {
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

  await until(() => app.admittedTools === 1 && toolSignal);
  controller.abort();
  await pending;
  await until(() => app.admittedTools === 0);
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
