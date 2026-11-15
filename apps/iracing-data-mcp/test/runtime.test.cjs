const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const { test } = require("node:test");

test("environment schema applies host defaults and transforms runtime options", async () => {
  const runtime = await import("../dist/runtime-config.js");
  const local = runtime.parseRuntimeConfig({});

  assert.equal(local.host, "127.0.0.1");
  assert.equal(local.port, 3000);
  assert.equal(
    local.credentialFile,
    path.resolve(__dirname, "../../../.iracing-data/iracing-data-mcp/credentials.json"),
  );
  assert.deepEqual(local.allowedHosts, ["127.0.0.1:3000", "localhost:3000"]);

  const configured = runtime.parseRuntimeConfig({
    IRACING_MCP_PORT: "4222",
    IRACING_MCP_ALLOWED_HOSTS: "localhost:4222",
    IRACING_MCP_ALLOWED_ORIGINS: "http://localhost:4222",
  });

  assert.equal(configured.port, 4222);
  assert.deepEqual(configured.allowedOrigins, ["http://localhost:4222"]);

  const docker = runtime.parseRuntimeConfig({ NODE_ENV: "production" });

  assert.equal(docker.credentialFile, "/var/lib/iracing-data-mcp/credentials.json");

  for (const invalid of [
    { IRACING_MCP_PORT: "0" },
    { IRACING_MCP_PORT: "not-a-number" },
    { IRACING_MCP_ALLOWED_HOSTS: "evil.example:3000" },
    { IRACING_MCP_ALLOWED_ORIGINS: "http://localhost:4200" },
    { IRACING_MCP_CLIENT_SECRET: "SECRET" },
  ]) {
    assert.throws(() => runtime.parseRuntimeConfig(invalid));
  }
});

test("Awilix selectors resolve a new verified actor and dependencies on each call", async () => {
  const { composeMcpServices } = await import("../dist/composition.js");
  const actors = [];
  const services = composeMcpServices({
    resolveActor: (context) => {
      actors.push(context.authInfo?.clientId);

      return context.authInfo
        ? { provider: "ftr-events", id: context.authInfo.clientId }
        : null;
    },
    resolveDependencies: (actor) => ({
      driverQueries: {
        getCurrent: async () => ({
          cust_id: actor.id === "first" ? 1 : 2,
          display_name: actor.id,
        }),
      },
      recentRaceQueries: {
        getRecent: async () => ({
          cust_id: actor.id === "first" ? 1 : 2,
          races: [],
        }),
      },
    }),
  });
  const signal = new AbortController().signal;
  const first = { signal, authInfo: { clientId: "first" } };
  const second = { signal, authInfo: { clientId: "second" } };

  assert.equal((await services.getDriverQueries(first)).getCurrent !== undefined, true);
  assert.equal(
    (await (await services.getDriverQueries(first)).getCurrent({ signal })).cust_id,
    1,
  );
  assert.equal(
    (await (await services.getDriverQueries(second)).getCurrent({ signal })).cust_id,
    2,
  );
  assert.equal(
    (await (await services.getRecentRaceQueries(second)).getRecent({ signal })).cust_id,
    2,
  );
  await assert.rejects(services.getDriverQueries({ signal }));
  assert.deepEqual(actors, ["first", "first", "second", "second", undefined]);
});

test("local CLI actor never selects its credentials for a verified remote request", async () => {
  const {
    createCliMcpDependencies,
    composeMcpServices,
  } = await import("../dist/composition.js");
  let tokenReads = 0;
  const credentials = {
    getAccessToken: async () => {
      tokenReads++;
      return "SECRET";
    },
    assertActive: () => undefined,
    authorizationState: () => "ready",
    shutdownAuthorizationOwner: async () => undefined,
  };
  const local = createCliMcpDependencies(credentials);
  const services = composeMcpServices(local);
  const signal = new AbortController().signal;

  assert.equal((await local.resolveActor({ signal })).provider, "cli");
  assert.equal(await local.resolveActor({ signal, authInfo: { clientId: "remote" } }), null);
  await assert.rejects(services.getDriverQueries({
    signal,
    authInfo: { clientId: "remote" },
  }));
  assert.ok(await services.getDriverQueries({ signal }));
  assert.equal(tokenReads, 0);
});

test("caller can create an unstarted host with custom dependencies", async (t) => {
  const { createMcpRuntime } = await import("../dist/runtime.js");
  const { parseRuntimeConfig } = await import("../dist/runtime-config.js");
  const config = parseRuntimeConfig({});
  const runtime = createMcpRuntime({
    config,
    dependencies: {
      resolveActor: async () => null,
      resolveDependencies: async () => {
        throw new Error("Should not resolve anonymous capabilities");
      },
      authorizationState: () => "authorization_required",
    },
  });

  await runtime.listen(0, "127.0.0.1");
  t.after(() => runtime.shutdown());

  const port = runtime.server.address().port;
  const response = await new Promise((resolve, reject) => {
    http.get({
      hostname: "127.0.0.1",
      port,
      path: "/healthz",
      headers: { Host: "127.0.0.1:3000" },
    }, (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({
        status: res.statusCode,
        body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
      }));
    }).on("error", reject);
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.auth_state, "authorization_required");
});
